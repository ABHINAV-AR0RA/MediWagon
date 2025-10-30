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

# --- 2. Define Agent State (NOW WITH 'router_decision') ---
class AgentState(TypedDict):
    symptom_text: str
    analysis: str
    suggested_specialty: str
    messages: Annotated[List[str], operator.add]
    # NEW KEY: This will store the router's decision
    router_decision: str 

# --- 3. Define Agent Nodes (Functions) ---

def analyze_symptoms(state: AgentState):
    """
    Node 1: Takes clear symptoms and returns a JSON analysis.
    """
    print("---NODE: ANALYZE_SYMPTOMS---")
    
    prompt_template = """
    You are a medical triage assistant. Analyze the user's symptoms and suggest a relevant medical specialty.
    The user's symptoms are: {symptom_text}
    Respond ONLY with a valid JSON object in the following format:
    {{
        "analysis": "A brief summary of the user's symptoms and potential cause.",
        "suggested_specialty": "The medical specialty to recommend, e.g., 'General Physician', 'Cardiologist'."
    }}
    """
    
    prompt = ChatPromptTemplate.from_template(prompt_template)
    chain = prompt | llm | StrOutputParser()
    
    try:
        response_text = chain.invoke({"symptom_text": state["symptom_text"]})
        print(f"LLM raw response: {response_text}")
        response_json = json.loads(response_text)
        
        # This node returns a DICTIONARY to update the state
        return {
            "analysis": response_json.get("analysis"),
            "suggested_specialty": response_json.get("suggested_specialty"),
            "messages": ["Analysis complete."]
        }
    except Exception as e:
        print(f"---ERROR: FAILED TO PARSE LLM JSON: {e}---")
        return {
            "analysis": "Error: Could not analyze symptoms.",
            "suggested_specialty": "Error",
        }

def clarify_symptoms(state: AgentState):
    """
    Node 2: If symptoms are vague, this asks a follow-up question.
    """
    print("---NODE: CLARIFY_SYMPTOMS---")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are Aasha, a helpful medical assistant. The user's symptom description is too vague. Ask one simple, specific follow-up question to get more details. Ask only the question."),
        ("user", "User's symptoms: {symptom_text}")
    ])
    
    chain = prompt | llm | StrOutputParser()
    
    try:
        question = chain.invoke({"symptom_text": state["symptom_text"]})
        # This node returns a DICTIONARY to update the state
        return {
            "analysis": question,
            "suggested_specialty": "Pending Input",
            "messages": [f"Asked clarifying question: {question}"]
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
    Node 3: (The Router) This node RUNS, makes a decision,
    and returns a DICTIONARY to save that decision to the state.
    """
    print("---NODE: ROUTE_SYMPTOMS---")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """
         You are a medical router. Your job is to decide if the user's symptoms are "clear" or "vague".
         Respond with ONLY the word 'clear' or 'vague'.
         """),
        ("user", "Symptoms: {symptom_text}")
    ])
    
    chain = prompt | llm | StrOutputParser()
    
    try:
        decision = chain.invoke({"symptom_text": state["symptom_text"]})
        print(f"Router decision: {decision}")
        
        if "clear" in decision.lower():
            return {"router_decision": "analyze_symptoms"} # Return a dict
        else:
            return {"router_decision": "clarify_symptoms"} # Return a dict
            
    except Exception as e:
        print(f"---ERROR IN ROUTER: {e}---")
        return {"router_decision": "clarify_symptoms"} # Return a dict

# --- 4. Define the Conditional Edge (The NEW Function) ---

def should_analyze(state: AgentState) -> Literal["analyze_symptoms", "clarify_symptoms"]:
    """
    This is the new "Condition" function. It's not a node.
    It just reads the state and returns a string for where to go next.
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
    "route_symptoms",  # Branch from the router node
    should_analyze,    # Use our new function to decide
    {
        # Map the string output to the node names
        "analyze_symptoms": "analyze_symptoms",
        "clarify_symptoms": "clarify_symptoms"
    }
)

# Add the final edges
workflow.add_edge("analyze_symptoms", END)
workflow.add_edge("clarify_symptoms", END)

# Compile the final app
app = workflow.compile()