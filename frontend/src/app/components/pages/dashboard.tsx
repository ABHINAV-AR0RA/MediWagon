import React, { useState, useEffect } from "react";
import { Navbar } from "../navbar";
import { MediWagonAvatar } from "../mediwagon-avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import {
  Mic,
  Send,
  Calendar,
  FileText,
  ShoppingBag,
  Bell,
  Activity,
  MapPin,
  Star,
} from "lucide-react";
import { useSpeechRecognition } from "../../../hooks/useSpeechRecognition";
import { VoiceNote } from "../voice-note";

interface DashboardProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
  onLogoClick?: () => void;
  onLogout?: () => void;
  onProfileClick?: () => void;
}

interface SymptomAnalysisResponse {
  analysis: string;
  suggested_specialty: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  audioUrl?: string;
  isLoading?: boolean;
  isAnalyzing?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  isDark,
  toggleTheme,
  onNavigate,
  onLogoClick,
  onLogout,
  onProfileClick,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello Gayathri! I'm Asha. How are you feeling today?",
      sender: "assistant",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [processingBackend, setProcessingBackend] = useState(false);

  const {
    isListening: speechIsListening,
    transcript,
    startListening,
    stopListening,
    hasSupport,
    error,
    isProcessing,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !speechIsListening) {
      handleVoiceInput(transcript);
    }
  }, [transcript, speechIsListening]);

  const analyzeSymptoms = async (text: string) => {
    try {
      const response = await fetch(
        "https://mediwagon.onrender.com/api/v1/agents/analyze-symptoms",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: "session" + Date.now(),
            symptom_text: text,
            user_lat: 28.6139, // You might want to get actual user location
            user_lon: 77.209,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SymptomAnalysisResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      throw error;
    }
  };

  const handleVoiceInput = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
    };

    const analysisMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Analyzing your symptoms...",
      sender: "assistant",
      isAnalyzing: true,
    };

    setMessages((prev) => [...prev, userMessage, analysisMessage]);
    setInputText("");

    try {
      const analysis = await analyzeSymptoms(text);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.isAnalyzing
            ? {
                id: msg.id,
                text: analysis.analysis,
                sender: "assistant",
              }
            : msg
        )
      );

      // Continue with voice processing
      handleVoiceProcessing(text);
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isAnalyzing
            ? {
                id: msg.id,
                text: "Sorry, I couldn't analyze your symptoms. Please try again.",
                sender: "assistant",
              }
            : msg
        )
      );
    }
  };

  const handleVoiceProcessing = async (text: string) => {
    const loadingMessage: Message = {
      id: (Date.now() + 2).toString(),
      text: "Processing your request...",
      sender: "assistant",
      isLoading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);
    setProcessingBackend(true);

    try {
      // read token from localStorage if present
      const token =
        (localStorage.getItem("authToken") || localStorage.getItem("token")) ??
        null;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch("http://localhost:5000/api/voice/process", {
        method: "POST",
        headers,
        body: JSON.stringify({ text, userName: "Gayathri" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Replace loading message with actual response
      if (data.success) {
        const raw = data.audioFile;
        const audioUrl =
          typeof raw === "string"
            ? raw.startsWith("http")
              ? raw
              : raw.startsWith("/")
              ? `http://localhost:5000${raw}`
              : `http://localhost:5000/${raw}`
            : "";

        setMessages((prev) =>
          prev.map((msg) =>
            msg.isLoading
              ? {
                  id: msg.id,
                  text: data.message,
                  sender: "assistant",
                  audioUrl,
                }
              : msg
          )
        );
      } else {
        // non-success: replace loading with error text
        setMessages((prev) =>
          prev.map((msg) =>
            msg.isLoading
              ? {
                  id: msg.id,
                  text:
                    data?.message ||
                    "Sorry, I couldn't process your request. Please try again.",
                  sender: "assistant",
                }
              : msg
          )
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isLoading
            ? {
                id: msg.id,
                text: "Sorry, I couldn't process your request. Please try again.",
                sender: "assistant",
              }
            : msg
        )
      );
      console.error("Error processing voice:", err);
    } finally {
      setProcessingBackend(false);
    }
  };

  const handleMicClick = () => {
    if (!hasSupport) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (speechIsListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const quickSymptoms = ["Fever", "Cold", "Headache", "Cough", "Fatigue"];

  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "Nov 2, 2025",
      time: "10:30 AM",
      status: "confirmed",
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "General Physician",
      date: "Nov 5, 2025",
      time: "2:00 PM",
      status: "pending",
    },
  ];

  const healthTasks = [
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Schedule Appointments",
      count: "2 upcoming",
      color: "bg-blue-500/10 text-blue-500",
      action: () => onNavigate("appointments"),
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "My Health Records",
      count: "5 reports",
      color: "bg-green-500/10 text-green-500",
      action: () => onNavigate("records"),
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      title: "Buy Medicine",
      color: "bg-purple-500/10 text-purple-500",
      action: () => {
        const newWin = window.open("https://www.truemeds.in/", "_blank");
        if (newWin) newWin.opener = null;
      },
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Medication Reminders",
      count: "4 active",
      color: "bg-orange-500/10 text-orange-500",
      action: () => onNavigate("medications"),
    },
  ];

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
    };

    const analysisMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Analyzing your symptoms...",
      sender: "assistant",
      isAnalyzing: true,
    };

    setMessages((prev) => [...prev, userMessage, analysisMessage]);
    setInputText("");

    try {
      const analysis = await analyzeSymptoms(inputText);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.isAnalyzing
            ? {
                id: msg.id,
                text: analysis.analysis,
                sender: "assistant",
              }
            : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isAnalyzing
            ? {
                id: msg.id,
                text: "Sorry, I couldn't analyze your symptoms. Please try again.",
                sender: "assistant",
              }
            : msg
        )
      );
    }
  };

  const handleQuickSymptom = (symptom: string) => {
    setInputText(`I have ${symptom.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        userName="Gayathri"
        onLogoClick={onLogoClick}
        onLogout={onLogout}
        onProfileClick={onProfileClick}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="rounded-3xl shadow-lg border-border h-[calc(100vh-200px)] overflow-hidden">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center gap-4">
                  <MediWagonAvatar size="sm" isListening={isListening} />
                  <div>
                    <CardTitle>Talk to Asha</CardTitle>
                    <p className="text-muted-foreground">
                      Your AI health assistant
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[calc(100%-100px)] min-h-0">
                <ScrollArea className="flex-1 p-6 min-h-0 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.sender === "user"
                              ? "bg-primary text-white"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {message.isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                                <span className="text-muted-foreground">
                                  {message.text}
                                </span>
                              </div>
                            ) : (
                              message.text
                            )}
                          </div>
                          {message.audioUrl && !message.isLoading && (
                            <VoiceNote audioUrl={message.audioUrl} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border bg-background/50">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {quickSymptoms.map((symptom) => (
                      <Badge
                        key={symptom}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 rounded-full px-3 py-1"
                        onClick={() => handleQuickSymptom(symptom)}
                      >
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder={
                        speechIsListening
                          ? "Listening..."
                          : processingBackend || isProcessing
                          ? "Processing voice..."
                          : "Describe your symptoms or ask a question..."
                      }
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      className="flex-1 rounded-2xl bg-input-background"
                      // optionally disable while backend is processing
                      disabled={processingBackend}
                    />
                    <Button
                      size="icon"
                      variant={speechIsListening ? "default" : "outline"}
                      onClick={handleMicClick}
                      className={`rounded-2xl ${
                        speechIsListening ? "animate-pulse" : ""
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={handleSend}
                      className="rounded-2xl"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Health Tasks */}
          <div className="space-y-6">
            <Card className="rounded-3xl shadow-lg border-border">
              <CardHeader>
                <CardTitle>My Health Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {healthTasks.map((task, index) => (
                  <div
                    key={index}
                    onClick={task.action}
                    className={`flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors ${
                      task.title === "Medication Reminders" ? "mb-6" : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${task.color} flex items-center justify-center`}
                    >
                      {task.icon}
                    </div>
                    <div className="flex-1">
                      <p>{task.title}</p>
                      <p className="text-muted-foreground">{task.count}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-lg border-border">
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer ${
                      appointment.doctor === "Dr. Michael Chen" ? "mb-6" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p>{appointment.doctor}</p>
                        <p className="text-muted-foreground">
                          {appointment.specialty}
                        </p>
                      </div>
                      <Badge
                        variant={
                          appointment.status === "confirmed"
                            ? "default"
                            : "secondary"
                        }
                        className="rounded-full"
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {appointment.date}
                      </span>
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
