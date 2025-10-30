import React, { useState } from 'react';
import { Navbar } from '../navbar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ChevronLeft, Plus, Pill, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface MedicationsProps {
  isDark: boolean;
  toggleTheme: () => void;
  onBack: () => void;
  onLogoClick?: () => void;
  onLogout?: () => void;
  onProfileClick?: () => void;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
  color: string;
}

export const Medications: React.FC<MedicationsProps> = ({ isDark, toggleTheme, onBack, onLogoClick, onLogout, onProfileClick }) => {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: 1,
      name: 'Amoxicillin',
      dosage: '500mg',
      frequency: '3 times daily',
      time: '8:00 AM',
      taken: true,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Once daily',
      time: '9:00 AM',
      taken: true,
      color: 'bg-yellow-500'
    },
    {
      id: 3,
      name: 'Metformin',
      dosage: '850mg',
      frequency: 'Twice daily',
      time: '7:00 PM',
      taken: false,
      color: 'bg-green-500'
    },
    {
      id: 4,
      name: 'Aspirin',
      dosage: '75mg',
      frequency: 'Once daily',
      time: '10:00 PM',
      taken: false,
      color: 'bg-red-500'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleMedicationStatus = (id: number) => {
    setMedications(
      medications.map((med) =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  const upcomingMedication = medications.find((med) => !med.taken);

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    // Add new medication logic here
    setIsDialogOpen(false);
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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="rounded-2xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2>Medication Reminders</h2>
              <p className="text-muted-foreground">Track and manage your medications</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl gap-2">
                <Plus className="w-4 h-4" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle>Add New Medication</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMedication} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="med-name">Medicine Name</Label>
                  <Input
                    id="med-name"
                    placeholder="e.g., Amoxicillin"
                    className="rounded-2xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 500mg"
                    className="rounded-2xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once daily</SelectItem>
                      <SelectItem value="twice">Twice daily</SelectItem>
                      <SelectItem value="thrice">3 times daily</SelectItem>
                      <SelectItem value="four">4 times daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    className="rounded-2xl"
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-2xl">
                  Add Medication
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Reminder Card */}
          <div className="lg:col-span-3">
            {upcomingMedication && (
              <Card className="rounded-3xl shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-cyan-500/5">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-2xl ${upcomingMedication.color} flex items-center justify-center shadow-lg`}>
                        <Pill className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="rounded-full bg-accent text-accent-foreground">
                            Next Reminder
                          </Badge>
                        </div>
                        <h3 className="mb-1">Hey Gayathri, it's time for your medicine!</h3>
                        <p className="text-muted-foreground mb-3">
                          Take {upcomingMedication.name} {upcomingMedication.dosage} at {upcomingMedication.time}
                        </p>
                        <Button 
                          className="rounded-2xl"
                          onClick={() => toggleMedicationStatus(upcomingMedication.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark as Taken
                        </Button>
                      </div>
                    </div>
                    <AlertCircle className="w-6 h-6 text-accent animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Today's Timeline */}
          <Card className="rounded-3xl shadow-lg border-border lg:col-span-2">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.map((medication, index) => (
                  <div key={medication.id} className="flex items-start gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full ${medication.taken ? 'bg-primary' : 'bg-secondary'} flex items-center justify-center`}>
                        {medication.taken ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      {index < medications.length - 1 && (
                        <div className="w-0.5 h-16 bg-secondary mt-2" />
                      )}
                    </div>

                    {/* Medication Card */}
                    <div className={`flex-1 p-4 rounded-2xl transition-all ${
                      medication.taken 
                        ? 'bg-secondary/30 opacity-60' 
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${medication.color}`} />
                          <div>
                            <h4>{medication.name}</h4>
                            <p className="text-muted-foreground">{medication.dosage}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="rounded-full">
                          {medication.time}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{medication.frequency}</p>
                      {!medication.taken && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => toggleMedicationStatus(medication.id)}
                        >
                          Mark as Taken
                        </Button>
                      )}
                      {medication.taken && (
                        <div className="flex items-center gap-2 text-primary">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Taken</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="rounded-3xl shadow-lg border-border">
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-primary">
                      {medications.filter(m => m.taken).length}/{medications.length}
                    </div>
                    <p className="text-muted-foreground">Taken</p>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{
                      width: `${(medications.filter(m => m.taken).length / medications.length) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="text-primary">{medications.filter(m => m.taken).length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="text-orange-500">{medications.filter(m => !m.taken).length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                  <span className="text-muted-foreground">Total</span>
                  <span>{medications.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
