# /ai/main.py

import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
import uvicorn
from typing import List, Optional
import requests
from fastapi.middleware.cors import CORSMiddleware # <-- 1. NEW IMPORT

# --- 1. Import Your Agents ---
from symptom_agent import app as symptom_agent_app 
from reminder_agent import app as reminder_agent_app

# --- 2. Load Environment Variables ---
load_dotenv()
api_key = os.getenv("SHIVAAY_API_KEY")
base_url = os.getenv("SHIVAAY_BASE_URL")

# --- 3. Initialize the Shivaay LLM Client ---
try:
    llm = ChatOpenAI(
        model_name="shivaay",
        api_key=api_key,
        base_url=base_url
    )
    print("✅ Shivaay LLM client initialized successfully!")
except Exception as e:
    print(f"❌ ERROR initializing LLM: {e}")
    llm = None

# --- 4. Initialize FastAPI App ---
app = FastAPI(
    title="Asha AI Service",
    description="This service runs all AI agents for the Asha Healthcare app."
)

# --- 5. NEW: CONFIGURE CORS ---
# This tells your server to accept requests from your frontend

origins = [
    "http://localhost:3000",          # Your local frontend
    "https://medi-wagon.vercel.app",  # Your deployed frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# --- 6. HACKATHON MEMORY (Simple Dictionary) ---
chat_memory = {}

# --- 7. Define the "API Contract" (Models) ---

class SymptomRequest(BaseModel):
    session_id: str
    symptom_text: str
    user_lat: Optional[float] = None
    user_lon: Optional[float] = None

class SymptomResponse(BaseModel):
    analysis: str
    suggested_specialty: str

class ReportRequest(BaseModel):
    scrubbed_report_text: str

class ReportResponse(BaseModel):
    simple_summary: str

class ReminderRequest(BaseModel):
    medication: str
    time_text: str
    user_id: str

class ReminderResponse(BaseModel):
    status: str
    parsed_time: str
    medication: str

# --- 8. Create API Endpoints ---

@app.get("/")
def read_root():
    return {"status": "Aasha AI Service is running!"}



@app.post("/api/v1/agents/analyze-symptoms", response_model=SymptomResponse)
async def analyze_symptoms(request: SymptomRequest):
    """
    (Agent 1) This is now a STATEFUL & FAULT-TOLERANT endpoint.
    """
    print(f"[{request.session_id}] Received symptoms: {request.symptom_text}")
    current_messages = chat_memory.get(request.session_id, []).copy()
    current_messages.append(request.symptom_text)

    # We now pass the location, which might be None
    inputs = {
        "messages": current_messages,
        "user_lat": request.user_lat,
        "user_lon": request.user_lon,
        "analysis": "",
        "suggested_specialty": "",
        "router_decision": ""
    }
    
    print(f"[{request.session_id}] Calling agent with: {inputs}")
    final_state = symptom_agent_app.invoke(inputs)
    
    aasha_response = final_state.get("analysis", "Error in analysis")
    specialty = final_state.get("suggested_specialty", "Error")
    
    current_messages.append(aasha_response)
    chat_memory[request.session_id] = current_messages
    
    return SymptomResponse(
        analysis=aasha_response,
        suggested_specialty=specialty
    )


@app.post("/api/v1/agents/summarize-report", response_model=ReportResponse)
async def summarize_report(request: ReportRequest):
    # (Agent 2) This is your working summarizer
    if not llm:
        return ReportResponse(simple_summary="Error: LLM not initialized")
    try:
        prompt = f"""
        You are 'Asha', a helpful medical assistant.
        Explain the following medical report text to a patient in simple, non-medical language.
        Be clear and supportive.
        Report Text: {request.scrubbed_report_text}
        """
        response = llm.invoke(prompt)
        return ReportResponse(simple_summary=response.content)
    except Exception as e:
        return ReportResponse(simple_summary=f"Error summarizing: {e}")


@app.post("/api/v1/agents/schedule-reminder", response_model=ReminderResponse)
async def schedule_reminder(request: ReminderRequest):
    """
    (Agent 3) This is your working reminder agent.
    """
    print(f"Received reminder for {request.user_id}: {request.medication} at {request.time_text}")
    
    inputs = {"medication": request.medication, "time_text": request.time_text}
    
    final_state = reminder_agent_app.invoke(inputs)
    parsed_time = final_state.get("parsed_time", "Error")
    
    print(f"Parsed time: {parsed_time}")
    
    BACKEND_URL = "http://localhost:3001/api/reminders" # Change this to your team's URL
    
    try:
        api_call_payload = {
            "userId": request.user_id,
            "medicationName": request.medication,
            "time": parsed_time
        }
        
        response = requests.post(BACKEND_URL, json=api_call_payload)
        
        if response.status_code == 200 or response.status_code == 201:
            print("Successfully sent reminder to backend.")
            status = "scheduled_success"
        else:
            print(f"Backend error: {response.text}")
            status = "backend_error"
            
    except Exception as e:
        print(f"---ERROR: FAILED TO CALL BACKEND: {e}---")
        status = "ai_error_calling_backend"
    
    return ReminderResponse(
        status=status,
        parsed_time=parsed_time,
        medication=request.medication
    )

# --- 9. Run the Server ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)