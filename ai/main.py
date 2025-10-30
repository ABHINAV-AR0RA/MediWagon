# /ai/main.py

import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
import uvicorn
from typing import List

# --- 1. Import Your Agent ---
from symptom_agent import app as symptom_agent_app 

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
    title="Aasha AI Service",
    description="This service runs all AI agents for the Aasha Healthcare app."
)

# --- 5. HACKATHON MEMORY (Simple Dictionary) ---
# This will store chat histories by session_id
chat_memory = {}

# --- 6. Define the "API Contract" (Request/Response Models) ---

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

# --- 7. Create API Endpoints ---

@app.get("/")
def read_root():
    return {"status": "Aasha AI Service is running!"}


@app.post("/api/v1/agents/analyze-symptoms", response_model=SymptomResponse)
async def analyze_symptoms(request: SymptomRequest):
    """
    (Agent 1) This is now a STATEFUL endpoint.
    It remembers the conversation.
    """
    print(f"[{request.session_id}] Received symptoms: {request.symptom_text}")
    
    # 1. Get history or start a new list
    # We use .copy() to avoid issues
    current_messages = chat_memory.get(request.session_id, []).copy()
    
    # 2. Add the new user message to the history
    current_messages.append(request.symptom_text)

    # 3. Prepare the input for the agent
    inputs = {
        "messages": current_messages
    }
    
    # 4. Run the graph
    print(f"[{request.session_id}] Calling agent with history: {inputs}")
    final_state = symptom_agent_app.invoke(inputs)
    
    # 5. Get the agent's response
    aasha_response = final_state.get("analysis", "Error in analysis")
    specialty = final_state.get("suggested_specialty", "Error")
    
    # 6. Save the new history
    # Add Aasha's response to the history for next time
    current_messages.append(aasha_response)
    chat_memory[request.session_id] = current_messages
    
    print(f"[{request.session_id}] Full History: {chat_memory[request.session_id]}")
    
    # 7. Return the *latest* response
    return SymptomResponse(
        analysis=aasha_response,
        suggested_specialty=specialty
    )


@app.post("/api/v1/agents/summarize-report", response_model=ReportResponse)
async def summarize_report(request: ReportRequest):
    # (Agent 2) This remains unchanged
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
    # (Agent 3) This remains unchanged
    print(f"Received reminder for {request.user_id}: {request.medication} at {request.time_text}")
    return ReminderResponse(
        status="scheduled_placeholder",
        scheduled_time="19:00"
    )

# --- 8. Run the Server ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)