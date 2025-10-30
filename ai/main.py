# /ai/main.py

import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
import uvicorn

# --- 1. Import Your New Agent ---
from symptom_agent import app as symptom_agent_app 

# --- 2. Load Environment Variables ---
load_dotenv()

api_key = os.getenv("SHIVAAY_API_KEY")
base_url = os.getenv("SHIVAAY_BASE_URL")

# --- 3. Initialize the Shivaay LLM Client ---
if not api_key:
    print("FATAL ERROR: SHIVAAY_API_KEY not found in .env file")
if not base_url:
    print("FATAL ERROR: SHIVAAY_BASE_URL not found in .env file")

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
    title="Aasha AI Service",
    description="This service runs all AI agents for the Aasha Healthcare app."
)

# --- 5. Define the "API Contract" (Request/Response Models) ---

class SymptomRequest(BaseModel):
    session_id: str
    symptom_text: str

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
    scheduled_time: str

# --- 6. Create API Endpoints ---

@app.get("/")
def read_root():
    return {"status": "Aasha AI Service is running!"}


@app.post("/api/v1/agents/analyze-symptoms", response_model=SymptomResponse)
async def analyze_symptoms(request: SymptomRequest):
    """
    (Agent 1) Takes user symptoms and returns an analysis.
    This now calls our real LangGraph agent.
    """
    print(f"Calling LangGraph agent with symptoms: {request.symptom_text}")
    
    # THIS IS THE CORRECTED, SAFER INPUT
    inputs = {
        "symptom_text": request.symptom_text,
        "messages": [],
        "analysis": "",
        "suggested_specialty": "",
        "router_decision": ""
    }
    
    final_state = symptom_agent_app.invoke(inputs)
    
    return SymptomResponse(
        analysis=final_state.get("analysis", "Error in analysis"),
        suggested_specialty=final_state.get("suggested_specialty", "Error in analysis")
    )


@app.post("/api/v1/agents/summarize-report", response_model=ReportResponse)
async def summarize_report(request: ReportRequest):
    """
    (Agent 2) Takes scrubbed medical text and summarizes it simply.
    """
    if not llm:
        return ReportResponse(simple_summary="Error: LLM not initialized")
    
    try:
        prompt = f"""
        You are 'Aasha', a helpful medical assistant.
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
    (Agent 3) Receives a reminder request to be scheduled.
    """
    print(f"Received reminder for {request.user_id}: {request.medication} at {request.time_text}")
    
    return ReminderResponse(
        status="scheduled_placeholder",
        scheduled_time="19:00"
    )

# --- 7. Run the Server ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)