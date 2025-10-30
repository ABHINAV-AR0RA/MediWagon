# /ai/symptom_agent.py

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel, Field # We still use this for the main.py response
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List
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
    symptom_text: str
    analysis: str
    suggested_specialty: str
    messages: Annotated[List[str], operator.add]

# --- 3. Define Agent Nodes (Functions) ---

def analyze_symptoms(state: AgentState):
    """
    Takes the user's symptoms and asks the LLM for a JSON analysis.
    """
    print("---CALLING SYMPTOM ANALYZER NODE (SIMPLE JSON)---")
    
    # This is the new, simpler prompt
    prompt_template = """
    You are a medical triage assistant. Analyze the user's symptoms and suggest a relevant medical specialty.
    Respond ONLY with a valid JSON object in the following format:
    {{
        "analysis": "A brief summary of the user's symptoms.",
        "suggested_specialty": "The medical specialty to recommend, e.g., 'General Physician', 'Cardiologist'."
    }}

    User symptoms: {symptom_text}
    """
    
    prompt = ChatPromptTemplate.from_template(prompt_template)
    
    # This is a much simpler, more reliable chain
    chain = prompt | llm | StrOutputParser()
    
    try:
        # Run the chain
        response_text = chain.invoke({"symptom_text": state["symptom_text"]})
        print(f"LLM raw response: {response_text}")

        # Parse the JSON text response
        response_json = json.loads(response_text)
        
        return {
            "analysis": response_json.get("analysis", "Error: Analysis missing"),
            "suggested_specialty": response_json.get("suggested_specialty", "Error: Specialty missing"),
            "messages": [f"Analysis complete: {response_json.get('analysis')}"]
        }
    except Exception as e:
        print(f"---ERROR: FAILED TO PARSE LLM JSON: {e}---")
        # Fallback in case the LLM fails
        return {
            "analysis": "Could not analyze symptoms. Please rephrase.",
            "suggested_specialty": "General Physician",
            "messages": ["Error in analysis."]
        }

def final_response_node(state: AgentState):
    """
    This is a dummy node to show the agent is finished.
    """
    print("---AGENT WORK COMPLETE---")
    return {}

# --- 4. Build the Graph ---
workflow = StateGraph(AgentState)
workflow.add_node("analyze_symptoms", analyze_symptoms)
workflow.add_node("final_response", final_response_node)
workflow.set_entry_point("analyze_symptoms")
workflow.add_edge("analyze_symptoms", "final_response")
workflow.add_edge("final_response", END)
app = workflow.compile()

# Test the graph
if __name__ == "__main__":
    print("Testing the symptom agent...")
    inputs = {"symptom_text": "I have a fever and a bad cough for 3 days."}
    for output in app.stream(inputs):
        print(output)
        print("----")