import React from "react";
import { AuroraBackground } from "../aurora-background";
import { MediWagonAvatar } from "../mediwagon-avatar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Mic,
  Calendar,
  FileText,
  Pill,
  CheckCircle,
  Shield,
  Clock,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: <CheckCircle className="w-8 h-8 text-primary" />,
      title: "Symptom Checker",
      description:
        "Describe your symptoms and get AI-powered health insights instantly.",
    },
    {
      icon: <Calendar className="w-8 h-8 text-primary" />,
      title: "Appointment Booking",
      description:
        "Find and book appointments with top doctors near you in seconds.",
    },
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: "Report Summarizer",
      description:
        "Upload medical reports and get easy-to-understand summaries.",
    },
    {
      icon: <Pill className="w-8 h-8 text-primary" />,
      title: "Medication Reminder",
      description:
        "Never miss a dose with smart medication tracking and alerts.",
    },
  ];

  return (
    <AuroraBackground>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-8 md:pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <MediWagonAvatar
              size="xl"
              isListening={false}
              showWaveform={false}
            />
          </div>
          <h1 className="mb-3 text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            Meet MediWagon
          </h1>
          <h2 className="mb-4 text-2xl md:text-3xl text-slate-900 dark:text-white">
            Your AI Health Companion
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Talk, book, and manage your health with ease. MediWagon combines
            voice AI with smart healthcare management to make your wellness
            journey seamless.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="rounded-2xl px-8 gap-2 shadow-lg hover:shadow-xl transition-shadow"
              onClick={onGetStarted}
            >
              <Mic className="w-5 h-5" />
              Start Talking
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl px-8 shadow-md hover:shadow-lg transition-shadow"
              onClick={onGetStarted}
            >
              Try Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h4>HIPAA Compliant</h4>
            <p className="text-muted-foreground">
              Your health data is secure and private
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <h4>24/7 Available</h4>
            <p className="text-muted-foreground">
              Get health assistance anytime, anywhere
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-3">
              <Mic className="w-6 h-6 text-accent" />
            </div>
            <h4>Voice Powered</h4>
            <p className="text-muted-foreground">
              Just talk naturally, MediWagon understands
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-cyan-500/10 backdrop-blur-sm rounded-3xl shadow-xl max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="mb-3">Ready to take control of your health?</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of users who trust MediWagon for their healthcare
                needs.
              </p>
              <Button
                size="lg"
                className="rounded-2xl px-8"
                onClick={onGetStarted}
              >
                Get Started Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuroraBackground>
  );
};
