import React from 'react';
import { Navbar } from '../navbar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ChevronLeft, User, Bell, Shield, Mic, Globe, Palette } from 'lucide-react';

interface ProfileSettingsProps {
  isDark: boolean;
  toggleTheme: () => void;
  onBack: () => void;
  onLogoClick?: () => void;
  onLogout?: () => void;
  onProfileClick?: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ isDark, toggleTheme, onBack, onLogoClick, onLogout, onProfileClick }) => {
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
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h2>Settings & Profile</h2>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="rounded-3xl shadow-lg border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    G
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" className="rounded-2xl">
                    Change Photo
                  </Button>
                  <p className="text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    defaultValue="Gayathri Sharma"
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="gayathri@example.com"
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    defaultValue="1990-05-15"
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <Button className="rounded-2xl">Save Changes</Button>
            </CardContent>
          </Card>

          {/* MediWagon Voice Settings */}
          <Card className="rounded-3xl shadow-lg border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                MediWagon Voice Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voice-tone">Voice Tone</Label>
                <Select defaultValue="friendly">
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select voice tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly & Warm</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="calm">Calm & Soothing</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="english">
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                <div>
                  <p>Voice Activation</p>
                  <p className="text-muted-foreground">Wake MediWagon with "Hey MediWagon"</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="rounded-3xl shadow-lg border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                <div>
                  <p>Medication Reminders</p>
                  <p className="text-muted-foreground">Get notified for medicines</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                <div>
                  <p>Appointment Alerts</p>
                  <p className="text-muted-foreground">Reminders before appointments</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                <div>
                  <p>Health Tips</p>
                  <p className="text-muted-foreground">Daily wellness suggestions</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                <div>
                  <p>Report Analysis</p>
                  <p className="text-muted-foreground">When reports are analyzed</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="rounded-3xl shadow-lg border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                <div>
                  <p>Dark Mode</p>
                  <p className="text-muted-foreground">Toggle dark/light theme</p>
                </div>
                <Switch checked={isDark} onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="rounded-3xl shadow-lg border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                <div>
                  <p>Two-Factor Authentication</p>
                  <p className="text-muted-foreground">Add extra security layer</p>
                </div>
                <Switch />
              </div> */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                <div>
                  <p>Data Sharing</p>
                  <p className="text-muted-foreground">Share anonymized health data</p>
                </div>
                <Switch />
              </div>
              <Button variant="outline" className="w-full rounded-2xl">
                Change Password
              </Button>
              <Button variant="outline" className="w-full rounded-2xl">
                Download My Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
