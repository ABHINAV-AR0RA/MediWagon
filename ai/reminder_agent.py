# /ai/reminder_agent.py

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END
from typing import TypedDict
import json
from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv
import datetime

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
class ReminderState(TypedDict):
    medication: str
    time_text: str
    parsed_time: str
    error: str

# --- 3. Define the Parsing Node ---

def parse_time(state: ReminderState):
    """
    Takes natural language time text and converts it to a 24-hour HH:MM format.
    """
    print("---NODE: PARSE_TIME---")
    
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # === THIS IS THE CORRECTED PROMPT ===
    prompt_template = f"""
    You are a time-parsing assistant. Your job is to convert a user's natural language time request into a structured 24-hour "HH:MM" format.
    
    The current date and time is: {now}
    
    - "in the morning" means "08:00"
    - "at night" or "before bed" means "21:00"
    - "after lunch" means "13:00"
    - "tomorrow at 9" means "09:00"
    - "8pm" means "20:00"
    
    Respond ONLY with a valid JSON object in the following format:
    {{{{
        "parsed_time": "HH:MM"
    }}}}

    User's time request: "{state['time_text']}"
    """
    
    prompt = ChatPromptTemplate.from_template(prompt_template)
    chain = prompt | llm | StrOutputParser()
    
    try:
        # === THIS IS THE CORRECTED INVOKE CALL ===
        # We pass the template variables in the invoke call
        response_text = chain.invoke({
            "time_text": state['time_text']
        })
        print(f"LLM raw response: {response_text}")
        response_json = json.loads(response_text)
        
        return {
            "parsed_time": response_json.get("parsed_time", "Error: Time not found")
        }
    except Exception as e:
        print(f"---ERROR: FAILED TO PARSE TIME: {e}---")
        return {
            "parsed_time": "Error: Could not parse time",
            "error": str(e)
        }

# --- 4. Build the Graph ---
workflow = StateGraph(ReminderState)
workflow.add_node("parse_time", parse_time)
workflow.set_entry_point("parse_time")
workflow.add_edge("parse_time", END)

# Compile the final app
app = workflow.compile()