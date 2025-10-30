# /ai/main.py

import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
import uvicorn

# --- 1. Load Environment Variables ---
# This line loads the SHIVAAY_API_KEY and SHIVAAY_BASE_URL from your .env file
load_dotenv()

api_key = os.getenv("SHIVAAY_API_KEY")
base_url = os.getenv("SHIVAAY_BASE_URL")

# --- 2. Initialize the Shivaay LLM Client ---
if not api_key:
    print("FATAL ERROR: SHIVAAY_API_KEY not found in .env file")
if not base_url:
    print("FATAL ERROR: SHIVAAY_BASE_URL not found in .env file")

# We use the exact model name "shivaay" and the base_url you found
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

# --- 3. Initialize FastAPI App ---
app = FastAPI(
    title="Aasha AI Service",
    description="This service runs all AI agents for the Aasha Healthcare app."
)

# --- 4. Define the "API Contract" (Request/Response Models) ---

# For the Symptom Analyzer
class SymptomRequest(BaseModel):
    session_id: str
    symptom_text: str

class SymptomResponse(BaseModel):
    analysis: str
    suggested_specialty: str

# For the Report Summarizer
class ReportRequest(BaseModel):
    scrubbed_report_text: str # Anonymized by the backend!

class ReportResponse(BaseModel):
    simple_summary: str

# For the Reminder Manager
class ReminderRequest(BaseModel):
    medication: str
    time_text: str 
    user_id: str # Backend will pass this

class ReminderResponse(BaseModel):
    status: str
    scheduled_time: str

# --- 5. Create Placeholder API Endpoints ---

@app.get("/")
def read_root():
    """Health check endpoint to see if the server is running."""
    return {"status": "Aasha AI Service is running!"}

@app.post("/api/v1/agents/analyze-symptoms", response_model=SymptomResponse)
async def analyze_symptoms(request: SymptomRequest):
    """
    (Agent 1) Takes user symptoms and returns an analysis.
    This is where your LangGraph agent will go.
    """
    print(f"Received symptoms: {request.symptom_text}")
    
    # TODO: Replace this with your LangGraph agent logic
    
    return SymptomResponse(
        analysis=f"Placeholder analysis for: {request.symptom_text}",
        suggested_specialty="General Physician"
    )

@app.post("/api/v1/agents/summarize-report", response_model=ReportResponse)
async def summarize_report(request: ReportRequest):
    """
    (Agent 2) Takes scrubbed medical text and summarizes it simply.
    This is your RAG agent.
    """
    if not llm:
        return ReportResponse(simple_summary="Error: LLM not initialized")
    
    try:
        # This is a simple test of your LLM!
        prompt = f"""
        You are 'Aasha', a helpful medical assistant.
        Explain the following medical report text to a patient in simple, non-medical language.
        Be clear and supportive.
        
        Report Text:
        {request.scrubbed_report_text}
        """
        response = llm.invoke(prompt)
        
        return ReportResponse(
            simple_summary=response.content
        )
    except Exception as e:
        return ReportResponse(simple_summary=f"Error summarizing: {e}")


@app.post("/api/v1/agents/schedule-reminder", response_model=ReminderResponse)
async def schedule_reminder(request: ReminderRequest):
    """
    (Agent 3) Receives a reminder request to be scheduled.
    This will call the n8n webhook or backend API.
    """
    print(f"Received reminder for {request.user_id}: {request.medication} at {request.time_text}")
    
    # TODO: Add logic to call your backend's /api/reminders endpoint
    
    return ReminderResponse(
        status="scheduled_placeholder",
        scheduled_time="19:00" # Placeholder
    )

# --- 6. Run the Server ---
if __name__ == "__main__":
    """This allows you to run the server by typing `python main.py`"""
    uvicorn.run(app, host="0.0.0.0", port=8000)