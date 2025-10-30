import React, { useState } from "react";
import { MediWagonAvatar } from "../mediwagon-avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface AuthPageProps {
  onAuth: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Track active tab to separate handling for signin/signup
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  // Sign-in state
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signinErrors, setSigninErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Sign-up state
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupErrors, setSignupErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    dob?: string;
    password?: string;
    confirm?: string;
  }>({});

  // Basic validators
  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  const validatePhone = (value: string) => /^\d{10,15}$/.test(value); // 10-15 digits
  const validatePassword = (value: string) => value.length >= 8;
  const validateDob = (value: string) => {
    const date = new Date(value);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120); // Max age 120 years
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() - 13); // Min age 13 years
    return date >= minDate && date <= maxDate;
  };

  // Sign-in handlers
  const handleSigninValidate = () => {
    const errors: typeof signinErrors = {};
    if (!signinEmail) errors.email = "Email is required.";
    else if (!validateEmail(signinEmail))
      errors.email = "Invalid email address.";
    if (!signinPassword) errors.password = "Password is required.";
    else if (!validatePassword(signinPassword))
      errors.password = "Password must be at least 8 characters.";
    setSigninErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleSigninValidate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAuth();
    }, 1500);
  };

  // Sign-up handlers
  const handleSignupValidate = () => {
    const errors: typeof signupErrors = {};
    if (!name.trim()) errors.name = "Full name is required.";
    if (!signupEmail) errors.email = "Email is required.";
    else if (!validateEmail(signupEmail))
      errors.email = "Invalid email address.";
    if (!phone) errors.phone = "Phone number is required.";
    else if (!validatePhone(phone)) errors.phone = "Phone must be 10 digits.";
    if (!dob) errors.dob = "Date of birth is required.";
    else if (!validateDob(dob))
      errors.dob = "You must be at least 13 years old.";
    if (!signupPassword) errors.password = "Password is required.";
    else if (!validatePassword(signupPassword))
      errors.password = "Password must be at least 8 characters.";
    if (!confirmPassword) errors.confirm = "Please confirm your password.";
    else if (signupPassword !== confirmPassword)
      errors.confirm = "Passwords do not match.";
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleSignupValidate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAuth();
    }, 1500);
  };

  // Determine if form is currently valid to enable button (basic)
  const isSigninFormValid =
    signinEmail && signinPassword && Object.keys(signinErrors).length === 0;
  const isSignupFormValid =
    name &&
    signupEmail &&
    phone &&
    dob &&
    signupPassword &&
    confirmPassword &&
    Object.keys(signupErrors).length === 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MediWagonAvatar size="lg" />
          </div>
          <h2 className="mb-2">Welcome to MediWagon</h2>
          <p className="text-muted-foreground">
            Your AI health companion is ready to help
          </p>
        </div>

        <Card className="rounded-3xl shadow-xl border-border">
          <CardHeader className="pb-4">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Sign in or create a new account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="signin"
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "signin" | "signup")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 rounded-2xl">
                <TabsTrigger value="signin" className="rounded-xl">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="rounded-2xl"
                      required
                      value={signinEmail}
                      onChange={(e) => {
                        setSigninEmail(e.target.value);
                        if (signinErrors.email) {
                          setSigninErrors((s) => ({ ...s, email: undefined }));
                        }
                      }}
                    />
                    {signinErrors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {signinErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="rounded-2xl"
                      required
                      value={signinPassword}
                      onChange={(e) => {
                        setSigninPassword(e.target.value);
                        if (signinErrors.password) {
                          setSigninErrors((s) => ({
                            ...s,
                            password: undefined,
                          }));
                        }
                      }}
                    />
                    {signinErrors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {signinErrors.password}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-2xl"
                    disabled={isLoading || !signinEmail || !signinPassword}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your Name"
                      className="rounded-2xl"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (signupErrors.name)
                          setSignupErrors((s) => ({ ...s, name: undefined }));
                      }}
                    />
                    {signupErrors.name && (
                      <p className="text-sm text-red-600 mt-1">
                        {signupErrors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      className="rounded-2xl"
                      required
                      value={signupEmail}
                      onChange={(e) => {
                        setSignupEmail(e.target.value);
                        if (signupErrors.email)
                          setSignupErrors((s) => ({ ...s, email: undefined }));
                      }}
                    />
                    {signupErrors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {signupErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="eg. 9876543210"
                      className="rounded-2xl"
                      required
                      value={phone}
                      onChange={(e) => {
                        // allow only digits in UI; store as string
                        const val = e.target.value.replace(/\D/g, "");
                        setPhone(val);
                        if (signupErrors.phone)
                          setSignupErrors((s) => ({ ...s, phone: undefined }));
                      }}
                    />
                    {signupErrors.phone && (
                      <p className="text-sm text-red-600 mt-1">
                        {signupErrors.phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      className="rounded-2xl"
                      required
                      value={dob}
                      onChange={(e) => {
                        setDob(e.target.value);
                        if (signupErrors.dob)
                          setSignupErrors((s) => ({ ...s, dob: undefined }));
                      }}
                    />
                    {signupErrors.dob && (
                      <p className="text-sm text-red-600 mt-1">
                        {signupErrors.dob}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="rounded-2xl"
                      required
                      value={signupPassword}
                      onChange={(e) => {
                        setSignupPassword(e.target.value);
                        if (signupErrors.password)
                          setSignupErrors((s) => ({
                            ...s,
                            password: undefined,
                          }));
                      }}
                    />
                    {signupErrors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {signupErrors.password}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      className="rounded-2xl"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (signupErrors.confirm)
                          setSignupErrors((s) => ({
                            ...s,
                            confirm: undefined,
                          }));
                      }}
                    />
                    {signupErrors.confirm && (
                      <p className="text-sm text-red-600 mt-1">
                        {signupErrors.confirm}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-2xl"
                    disabled={
                      isLoading ||
                      !name ||
                      !signupEmail ||
                      !phone ||
                      !dob ||
                      !signupPassword ||
                      !confirmPassword
                    }
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
