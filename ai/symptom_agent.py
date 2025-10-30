# /ai/symptom_agent.py

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List, Literal
import operator
import json
from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv

# --- 1. Load LLM ---
load_dotenv()
api_key = os.getenv("SHIVAAY_API_KEY")
base_url = os.getenv("SHIVAAY_BASE_URL")

llm = ChatOpenAI(
    model_name="shivaay",
    api_key=api_key,
    base_url=base_url
)

# --- 2. Define Agent State (Memory-Aware) ---
class AgentState(TypedDict):
    # This is now the ONLY input. It will contain the full chat history.
    messages: Annotated[List[str], operator.add]
    
    # These keys will be populated by the agent's nodes
    analysis: str
    suggested_specialty: str
    router_decision: str 

# --- 3. Define Agent Nodes (Functions) ---

def analyze_symptoms(state: AgentState):
    """
    Node 1: Takes the FULL conversation history and returns a JSON analysis.
    """
    print("---NODE: ANALYZE_SYMPTOMS---")
    
    prompt_template = """
    You are a medical triage assistant. Analyze the user's symptoms from the following conversation and suggest a relevant medical specialty.
    The user's symptoms are in the chat history.
    
    CHAT HISTORY:
    {chat_history}
    
    Respond ONLY with a valid JSON object in the following format:
    {{
        "analysis": "A brief summary of the user's symptoms and potential cause.",
        "suggested_specialty": "The medical specialty to recommend, e.g., 'General Physician', 'Cardiologist'."
    }}
    """
    
    prompt = ChatPromptTemplate.from_template(prompt_template)
    chain = prompt | llm | StrOutputParser()
    
    try:
        # Join the list of messages into a single string for the prompt
        history_str = "\n".join(state["messages"])
        response_text = chain.invoke({"chat_history": history_str})
        
        print(f"LLM raw response: {response_text}")
        response_json = json.loads(response_text)
        
        return {
            "analysis": response_json.get("analysis"),
            "suggested_specialty": response_json.get("suggested_specialty"),
            "messages": ["Analysis complete."] # This is a system message, not shown to user
        }
    except Exception as e:
        print(f"---ERROR: FAILED TO PARSE LLM JSON: {e}---")
        return {
            "analysis": "Error: Could not analyze symptoms.",
            "suggested_specialty": "Error",
        }

def clarify_symptoms(state: AgentState):
    """
    Node 2: Asks a follow-up question based on the conversation.
    """
    print("---NODE: CLARIFY_SYMPTOMS---")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are Aasha, a helpful medical assistant. The user's symptom description in the chat history is too vague. Ask one simple, specific follow-up question to get more details. Ask only the question."),
        ("user", "CHAT HISTORY:\n{chat_history}")
    ])
    
    chain = prompt | llm | StrOutputParser()
    
    try:
        history_str = "\n".join(state["messages"])
        question = chain.invoke({"chat_history": history_str})
        
        return {
            "analysis": question,
            "suggested_specialty": "Pending Input",
            "messages": [question] # This is Aasha's response
        }
    except Exception as e:
        print(f"---ERROR IN CLARIFY NODE: {e}---")
        return {
            "analysis": "I'm sorry, I had trouble processing that. Could you please tell me your symptoms again?",
            "suggested_specialty": "Pending Input",
            "messages": ["Error in clarify node."]
        }

def route_symptoms(state: AgentState):
    """
    Node 3: (The Router) Decides whether to analyze or clarify.
    """
    print("---NODE: ROUTE_SYMPTOMS---")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """
         You are a medical router. Your job is to decide if the user's *latest message* provides clear symptoms, or if it's still vague, based on the *entire conversation*.
         - "Clear" symptoms are specific (e.g., "chest pain", "fever", "coughing for 3 days").
         - "Vague" symptoms are not specific (e.g., "I feel sick", "I'm not well", "something is wrong").
         - If the user is answering a clarifying question, they are probably giving "clear" info.
         
         Respond with ONLY the word 'clear' or 'vague'.
         """),
        ("user", "CHAT HISTORY:\n{chat_history}")
    ])
    
    chain = prompt | llm | StrOutputParser()
    
    try:
        history_str = "\n".join(state["messages"])
        decision = chain.invoke({"chat_history": history_str})
        print(f"Router decision: {decision}")
        
        if "clear" in decision.lower():
            return {"router_decision": "analyze_symptoms"}
        else:
            return {"router_decision": "clarify_symptoms"}
            
    except Exception as e:
        print(f"---ERROR IN ROUTER: {e}---")
        return {"router_decision": "clarify_symptoms"}

# --- 4. Define the Conditional Edge (The NEW Function) ---

def should_analyze(state: AgentState) -> Literal["analyze_symptoms", "clarify_symptoms"]:
    """
    This is the Condition function. It just reads the router's decision.
    """
    print("---CONDITION: SHOULD_ANALYZE---")
    decision = state.get("router_decision", "clarify_symptoms")
    if decision == "analyze_symptoms":
        return "analyze_symptoms"
    else:
        return "clarify_symptoms"

# --- 5. Build the New Graph ---

workflow = StateGraph(AgentState)

# Add the nodes
workflow.add_node("route_symptoms", route_symptoms)
workflow.add_node("analyze_symptoms", analyze_symptoms)
workflow.add_node("clarify_symptoms", clarify_symptoms)

# Set the entry point
workflow.set_entry_point("route_symptoms")

# Add the conditional edges
workflow.add_conditional_edges(
    "route_symptoms",
    should_analyze,
    {
        "analyze_symptoms": "analyze_symptoms",
        "clarify_symptoms": "clarify_symptoms"
    }
)

# Add the final edges
workflow.add_edge("analyze_symptoms", END)
# NOTE: We change this edge. After clarifying, the agent just ends.
# The user's *next* message will re-start the loop.
workflow.add_edge("clarify_symptoms", END)

# Compile the final app
app = workflow.compile()