import React, { useState } from "react";
import { Navbar } from "../navbar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { Calendar } from '../ui/calendar';
import { Badge } from "../ui/badge";
import { ChevronLeft, MapPin, Star, Clock, CheckCircle2 } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

/* ...existing code... */

// Inline calendar component to replace the external Calendar so clicks persist/highlight
const InlineCalendar: React.FC<{
  selected?: Date;
  onSelect: (d: Date) => void;
  className?: string;
}> = ({ selected, onSelect, className }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selected ?? new Date()
  );

  const prevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth((m) => addMonths(m, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows: Date[][] = [];
  let day = startDate;
  while (day <= endDate) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    rows.push(week);
  }

  return (
    <div className={`w-full ${className ?? ""}`}>
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="text-sm font-medium text-muted-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            className="rounded-full"
          >
            ‹
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="rounded-full"
          >
            ›
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {rows.map((week, wi) =>
          week.map((dayItem, di) => {
            const outside = !isSameMonth(dayItem, monthStart);
            const selectedDay = selected && isSameDay(dayItem, selected);
            return (
              <button
                key={`${wi}-${di}`}
                onClick={() => {
                  onSelect(dayItem);
                  setCurrentMonth(dayItem);
                }}
                className={`h-10 w-10 flex items-center justify-center rounded-md text-sm transition ${
                  outside ? "text-muted-foreground opacity-40" : ""
                } ${
                  selectedDay
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary/30"
                }`}
              >
                {format(dayItem, "d")}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

interface AppointmentsProps {
  isDark: boolean;
  toggleTheme: () => void;
  onBack: () => void;
  onLogoClick?: () => void;
  onLogout?: () => void;
  onProfileClick?: () => void;
}

export const Appointments: React.FC<AppointmentsProps> = ({
  isDark,
  toggleTheme,
  onBack,
  onLogoClick,
  onLogout,
  onProfileClick,
}) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ];

  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      rating: 4.8,
      reviews: 128,
      distance: "2.3 km",
      fee: "$80",
      available: true,
      image:
        "https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?w=300",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "General Physician",
      rating: 4.9,
      reviews: 215,
      distance: "1.8 km",
      fee: "$60",
      available: true,
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300",
    },
    {
      id: 3,
      name: "Dr. Emily Williams",
      specialty: "Pediatrician",
      rating: 4.7,
      reviews: 95,
      distance: "3.5 km",
      fee: "$70",
      available: true,
      image:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300",
    },
    {
      id: 4,
      name: "Dr. Robert Martinez",
      specialty: "Dermatologist",
      rating: 4.6,
      reviews: 82,
      distance: "4.2 km",
      fee: "$90",
      available: false,
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300",
    },
  ];

  const handleBookAppointment = () => {
    // Simulate booking
    alert("Appointment booked successfully!");
    onBack();
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
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-2xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2>Book Appointment</h2>
            <p className="text-muted-foreground">Step {step} of 3</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Date & Time Selection */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-3xl shadow-lg border-border">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <InlineCalendar
                  selected={selectedDate}
                  onSelect={(d) => setSelectedDate(d)}
                  className="rounded-2xl w-full"
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-lg border-border">
              <CardHeader>
                <CardTitle>Select Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      className="rounded-2xl"
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
                <Button
                  className="w-full mt-6 rounded-2xl"
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Doctor Selection */}
        {step === 2 && (
          <div>
            <Card className="rounded-3xl shadow-lg border-border mb-6">
              <CardHeader>
                <CardTitle>Choose Your Doctor</CardTitle>
                <p className="text-muted-foreground">
                  Showing doctors within 5km
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedDoctor?.id === doctor.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    } ${!doctor.available ? "opacity-50" : ""}`}
                    onClick={() =>
                      doctor.available && setSelectedDoctor(doctor)
                    }
                  >
                    <div className="flex items-start gap-4">
                      <ImageWithFallback
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-2xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4>{doctor.name}</h4>
                            <p className="text-muted-foreground">
                              {doctor.specialty}
                            </p>
                          </div>
                          <Badge className="rounded-full">{doctor.fee}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {doctor.rating} ({doctor.reviews})
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {doctor.distance}
                          </span>
                        </div>
                        {!doctor.available && (
                          <Badge
                            variant="secondary"
                            className="mt-2 rounded-full"
                          >
                            Not Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                className="flex-1 rounded-2xl"
                disabled={!selectedDoctor}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && selectedDoctor && (
          <div className="max-w-2xl mx-auto">
            <Card className="rounded-3xl shadow-lg border-border mb-6">
              <CardHeader>
                <CardTitle>Confirm Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/50">
                  <ImageWithFallback
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    className="w-20 h-20 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <h4>{selectedDoctor.name}</h4>
                    <p className="text-muted-foreground">
                      {selectedDoctor.specialty}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="rounded-full">
                        {selectedDoctor.fee}
                      </Badge>
                      <Badge variant="outline" className="rounded-full">
                        {selectedDoctor.distance}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                    <span className="text-muted-foreground">Date</span>
                    <span>{selectedDate?.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                    <span className="text-muted-foreground">Time</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                    <span className="text-muted-foreground">
                      Consultation Fee
                    </span>
                    <span>{selectedDoctor.fee}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <h4 className="mb-1">Need a ride?</h4>
                      <p className="text-muted-foreground mb-3">
                        Book a ride to {selectedDoctor.name}'s clinic
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                      >
                        Book Ride
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                className="flex-1 rounded-2xl"
                onClick={handleBookAppointment}
              >
                Confirm & Book
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
