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

# --- 2. Define Agent State ---
class AgentState(TypedDict):
    messages: Annotated[List[str], operator.add]
    analysis: str
    suggested_specialty: str
    router_decision: str 

# --- 3. Define Agent Nodes (Functions) ---

def analyze_symptoms(state: AgentState):
    """
    Node 1: Analyzes symptoms, queries the JSON, and proactively hands off to booking.
    """
    print("---NODE: ANALYZE_SYMPTOMS (SMART HAND-OFF)---")
    
    analysis_prompt_template = """
    You are a medical triage assistant. Your first job is to analyze the user's symptoms
    and determine the single, most relevant medical specialty.
    
    CHAT HISTORY:
    {chat_history}
    
    Respond ONLY with a valid JSON object in the following format:
    {{
        "analysis": "A brief summary of the user's symptoms and potential cause.",
        "suggested_specialty": "The medical specialty to recommend, e.g., 'General Physician', 'Cardiologist', 'Dermatologist'."
    }}
    """
    
    prompt = ChatPromptTemplate.from_template(analysis_prompt_template)
    chain = prompt | llm | StrOutputParser()
    
    try:
        history_str = "\n".join(state["messages"])
        response_text = chain.invoke({"chat_history": history_str})
        
        print(f"LLM specialty response: {response_text}")
        response_json = json.loads(response_text)
        
        analysis = response_json.get("analysis")
        specialty = response_json.get("suggested_specialty")
        
        if not specialty:
            raise Exception("LLM failed to provide a specialty.")

        print(f"Querying JSON for specialty: {specialty}")
        with open('doctors.json', 'r') as f:
            doctors_db = json.load(f)

        relevant_doctors = [doc for doc in doctors_db if doc["specialty"].lower() == specialty.lower()]
        
        if not relevant_doctors:
            final_response_message = (
                f"{analysis} "
                f"Based on this, I recommend you see a **{specialty}**. "
                f"Please head to the 'Schedule Appointment' section to see available doctors."
            )
        else:
            best_doctor = max(relevant_doctors, key=lambda doc: doc["rating"])
            
            final_response_message = (
                f"{analysis} "
                f"Based on this, I recommend you see a **{specialty}**. "
                f"The top-rated specialist in your area is **{best_doctor['name']} ({best_doctor['rating']} stars)**, with availability {best_doctor['next_slot']}. "
                f"\n\n**Please go to the 'Schedule Appointment' section on your dashboard to book this.**"
            )

        return {
            "analysis": final_response_message,
            "suggested_specialty": specialty,
            "messages": ["Analysis complete. Handed off to booking."]
        }
        
    except Exception as e:
        print(f"---ERROR IN ANALYZE_SYMPTOMS: {e}---")
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
            "messages": [question]
        }
    except Exception as e:
        print(f"---ERROR IN CLARIFY NODE: {e}---")
        return {
            "analysis": "I'm sorry, I had trouble processing that. Could you please tell me your symptoms again?",
            "suggested_specialty": "Pending Input",
            "messages": ["Error in clarify node."]
        }

# --- 4. Define the Router (FINAL, SMARTER VERSION) ---

def route_symptoms(state: AgentState):
    """
    Node 3: (The Router) This node RUNS, makes a decision,
    and returns a DICTIONARY to save that decision to the state.
    """
    print("---NODE: ROUTE_SYMPTOMS---")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """
         You are a medical router. Your job is to decide if the user's symptoms are "clear" or "vague".
         - "Clear" symptoms are specific (e.g., "chest pain", "fever", "coughing for 3 days", "a bad skin rash", "headache").
         - "Vague" symptoms are not specific (e.g., "I feel sick", "I'm not well", "something is wrong").
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

# --- 5. Define the Conditional Edge ---

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

# --- 6. Build the New Graph ---

workflow = StateGraph(AgentState)

workflow.add_node("route_symptoms", route_symptoms)
workflow.add_node("analyze_symptoms", analyze_symptoms)
workflow.add_node("clarify_symptoms", clarify_symptoms)

workflow.set_entry_point("route_symptoms")

workflow.add_conditional_edges(
    "route_symptoms",
    should_analyze,
    {
        "analyze_symptoms": "analyze_symptoms",
        "clarify_symptoms": "clarify_symptoms"
    }
)

workflow.add_edge("analyze_symptoms", END)
workflow.add_edge("clarify_symptoms", END)

app = workflow.compile()