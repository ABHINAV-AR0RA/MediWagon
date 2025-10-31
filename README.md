# 🩺 MediWagon — AI-Powered Digital Health Assistant

MediWagon is a next-generation **AI-powered health assistant platform** designed to make healthcare accessible, connected, and intelligent.  
With its built-in bilingual AI companion **Asha**, MediWagon empowers users to **book appointments, consult virtually, access medical records, and even arrange transport** — all through simple voice or chat commands.

---

## 🚀 Overview

> “Your one-stop health companion — Speak. Schedule. Heal.”

**MediWagon** bridges patients, doctors, and healthcare services through a unified web platform.  
It is powered by **Asha**, an AI assistant capable of voice and chat-based interaction in **English and Hindi**, ensuring inclusivity across India.

The system follows a **privacy-first architecture** — anonymizing user data before any AI processing — and integrates **HIPAA-compliant workflows** for secure data handling.

---

## 🧠 Key Features

### 👩‍⚕️ Smart AI Assistant — *Asha*
- Voice & chat-based interaction (Hindi + English)
- AI-guided appointment booking and navigation
- Context-aware medical query handling (via Shivaay AI)
- Human-like TTS response with *Asha’s* soft, reassuring tone

### 🧾 Patient Portal
- View, upload, and manage prescriptions & reports
- Maintain medical history securely (hashed & encrypted)
- Integrated **Zerodrive Cloud Storage** for documents

### 📅 Doctor & Service Booking
- Search doctors by specialty, rating, or availability
- AI-driven triage maps symptoms to right specialists
- Appointment scheduling with reminders and conflict resolution

### 🚑 Transport & Accessibility
- One-tap **Call Ambulance**
- Integrated **cab booking** for hospital visits  
  (important for users without private transport)

### 💬 Notifications & Chat
- Real-time updates for appointments and lab reports
- AI chat with structured health insights and next-step recommendations

### 🔐 Security & Privacy
- Full data anonymization before AI access
- HIPAA-compliant design and encrypted database (TLS + AES-256)
- Role-based access (Patient / Doctor / Admin)

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js (MERN) |
| **Backend** | FastAPI (Python) |
| **AI Layer** | Shivaay AI (OpenAI-compatible) via Langraph |
| **Database** | MongoDB (Hashed data) |
| **Speech-to-Text** | Web Speech API |
| **Text-to-Speech (Voice Asha)** | AI-generated MP3 voice via backend |
| **Cloud Storage** | Zerodrive Cloud (Hackathon Partner) |

---

## 🧩 Architecture Overview

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Anonymizer
    participant AI
    participant TTS
    participant DB
    participant Cloud

    User->>Frontend: Speak or type query
    Frontend->>Backend: Send request (text / STT result)
    Backend->>Anonymizer: Remove PII
    Anonymizer-->>Backend: Sanitized query
    Backend->>AI: Forward to Shivaay AI
    AI-->>Backend: Return structured response
    Backend->>TTS: Generate voice (Asha)
    TTS->>Cloud: Upload MP3
    Cloud-->>TTS: Return voice URL
    Backend->>DB: Store anonymized logs
    Backend-->>Frontend: Send text + audio URL
    Frontend-->>User: Display reply + play voice
