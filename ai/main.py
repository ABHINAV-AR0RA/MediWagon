# /ai/main.py

import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
import uvicorn

# --- 1. Import Your New Agent ---
# This is the new line you added
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
    # This is the corrected config that worked
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

# --- 6. Create API Endpoints ---

@app.get("/")
def read_root():
    """Health check endpoint to see if the server is running."""
    return {"status": "Aasha AI Service is running!"}


# === THIS IS YOUR NEW, UPDATED ENDPOINT ===
@app.post("/api/v1/agents/analyze-symptoms", response_model=SymptomResponse)
async def analyze_symptoms(request: SymptomRequest):
    """
    (Agent 1) Takes user symptoms and returns an analysis.
    This now calls our real LangGraph agent.
    """
    print(f"Calling LangGraph agent with symptoms: {request.symptom_text}")
    
    # 1. Prepare the input for the graph
    # We pass the symptom_text from the API request
    inputs = {"symptom_text": request.symptom_text}
    
    # 2. Run the graph
    # We use .invoke() here for a single, final answer
    final_state = symptom_agent_app.invoke(inputs)
    
    # 3. Return the final state
    # We safely get the keys from the state dictionary
    return SymptomResponse(
        analysis=final_state.get("analysis", "Error in analysis"),
        suggested_specialty=final_state.get("suggested_specialty", "Error in analysis")
    )


# === THIS IS YOUR WORKING SUMMARY ENDPOINT ===
@app.post("/api/v1/agents/summarize-report", response_model=ReportResponse)
async def summarize_report(request: ReportRequest):
    """
    (Agent 2) Takes scrubbed medical text and summarizes it simply.
    This is your working RAG agent.
    """
    if not llm:
        return ReportResponse(simple_summary="Error: LLM not initialized")
    
    try:
        # This is the working test of your LLM
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


# === THIS IS YOUR PLACEHOLDER REMINDER ENDPOINT ===
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

# --- 7. Run the Server ---
if __name__ == "__main__":
    """This allows you to run the server by typing `python main.py`"""
    uvicorn.run(app, host="0.0.0.0", port=8000)