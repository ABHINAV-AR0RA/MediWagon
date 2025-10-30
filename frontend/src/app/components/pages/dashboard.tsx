import React, { useState } from "react";
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

interface DashboardProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
  onLogoClick?: () => void;
  onLogout?: () => void;
  onProfileClick?: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
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
      text: "Hello Gayathri! I'm MediWagon. How are you feeling today?",
      sender: "assistant",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);

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
      count: "3 items",
      color: "bg-purple-500/10 text-purple-500",
      action: () => {},
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Medication Reminders",
      count: "4 active",
      color: "bg-orange-500/10 text-orange-500",
      action: () => onNavigate("medications"),
    },
  ];

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand. Based on your symptoms, I recommend booking an appointment with a general physician. Would you like me to help you find one nearby?",
        sender: "assistant",
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
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
                    <CardTitle>Talk to MediWagon</CardTitle>
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
                          <p className="whitespace-pre-wrap break-words">
                            {message.text}
                          </p>
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
                      placeholder="Describe your symptoms or ask a question..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      className="flex-1 rounded-2xl bg-input-background"
                    />
                    <Button
                      size="icon"
                      variant={isListening ? "default" : "outline"}
                      onClick={() => setIsListening(!isListening)}
                      className="rounded-2xl"
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
                    className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
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
                    className="p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
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
