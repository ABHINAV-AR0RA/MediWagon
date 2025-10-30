"use client";
import React, { useState, useEffect } from "react";
import { LandingPage } from "./components/pages/landing-page";
import { AuthPage } from "./components/pages/auth-page";
import { Dashboard } from "./components/pages/dashboard";
import { Appointments } from "./components/pages/appointments";
import { HealthRecords } from "./components/pages/health-records";
import { Medications } from "./components/pages/medications";
import { ProfileSettings } from "./components/pages/profile-settings";
import { FloatingAssistant } from "./components/floating-assistant";
import { Button } from "./components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { AuthProvider } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function App() {
  const [currentPage, setCurrentPage] = useState<
    | "landing"
    | "auth"
    | "dashboard"
    | "appointments"
    | "records"
    | "medications"
    | "profile"
  >("landing");
  const [isDark, setIsDark] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((s) => !s);

  const handleGetStarted = () => setCurrentPage("auth");
  const handleAuth = () => setCurrentPage("dashboard");
  const handleNavigate = (page: string) => setCurrentPage(page as any);
  const handleBack = () => setCurrentPage("dashboard");
  const handleLogoClick = () => setCurrentPage("dashboard");
  const handleLogout = () => setCurrentPage("landing");
  const handleProfileClick = () => setCurrentPage("profile");

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage onGetStarted={handleGetStarted} />;
      case "auth":
        return <AuthPage onAuth={handleAuth} />;
      case "dashboard":
        return (
          <Dashboard
            isDark={isDark}
            toggleTheme={toggleTheme}
            onNavigate={handleNavigate}
            onLogoClick={handleLogoClick}
            onLogout={handleLogout}
            onProfileClick={handleProfileClick}
          />
        );
      case "appointments":
        return (
          <Appointments
            isDark={isDark}
            toggleTheme={toggleTheme}
            onBack={handleBack}
            onLogoClick={handleLogoClick}
            onLogout={handleLogout}
            onProfileClick={handleProfileClick}
          />
        );
      case "records":
        return (
          <HealthRecords
            isDark={isDark}
            toggleTheme={toggleTheme}
            onBack={handleBack}
            onLogoClick={handleLogoClick}
            onLogout={handleLogout}
            onProfileClick={handleProfileClick}
          />
        );
      case "medications":
        return (
          <Medications
            isDark={isDark}
            toggleTheme={toggleTheme}
            onBack={handleBack}
            onLogoClick={handleLogoClick}
            onLogout={handleLogout}
            onProfileClick={handleProfileClick}
          />
        );
      case "profile":
        return (
          <ProfileSettings
            isDark={isDark}
            toggleTheme={toggleTheme}
            onBack={handleBack}
            onLogoClick={handleLogoClick}
            onLogout={handleLogout}
            onProfileClick={handleProfileClick}
          />
        );
      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen">
        {renderPage()}

        {/* Floating Assistant Button */}
        {currentPage !== "landing" && currentPage !== "auth" && (
          <Button
            size="icon"
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-transform z-40"
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          >
            {isAssistantOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MessageCircle className="w-6 h-6" />
            )}
          </Button>
        )}

        {/* Floating Assistant Modal */}
        <FloatingAssistant
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
        />

        <Toaster />
      </div>
    </AuthProvider>
  );
}
