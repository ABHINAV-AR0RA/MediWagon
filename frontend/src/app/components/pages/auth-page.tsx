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
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

// ADDED: API imports (removed useNavigate)
import {
  registerUser,
  loginUser,
  RegisterData,
  LoginData,
  LoginResponse,
} from "../../../api/auth";

interface AuthPageProps {
  onAuth: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  // Sign-in state
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signinErrors, setSigninErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Updated Sign-up state
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">();
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupErrors, setSignupErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    dob?: string;
    address?: string;
    gender?: string;
    password?: string;
    confirm?: string;
  }>({});

  // ADDED: API feedback + navigation state
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  const { login } = useAuth();

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

  // UPDATED: Sign-in submit — calls loginUser, saves token/user, shows toast
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setApiMessage(null);
    if (!handleSigninValidate()) return;
    setIsLoading(true);
    try {
      const payload: LoginData = {
        email: signinEmail,
        password: signinPassword,
      };
      const resp: LoginResponse = await loginUser(payload);
      login(resp); // Save to context/localStorage
      setIsLoading(false);
      onAuth();
    } catch (err) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "Login failed";
      setApiError(msg);
      toast.error(msg); // Show toast for invalid credentials
    }
  };

  // Add age calculation function
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Updated validation
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
    if (!address.trim()) errors.address = "Address is required.";
    if (!gender) errors.gender = "Please select your gender.";
    if (!signupPassword) errors.password = "Password is required.";
    else if (!validatePassword(signupPassword))
      errors.password = "Password must be at least 8 characters.";
    if (!confirmPassword) errors.confirm = "Please confirm your password.";
    else if (signupPassword !== confirmPassword)
      errors.confirm = "Passwords do not match.";
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // UPDATED: Sign-up submit — calls registerUser and switches to Sign In tab on success
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setApiMessage(null);
    if (!handleSignupValidate()) return;
    setIsLoading(true);
    try {
      const regAge = age ?? calculateAge(dob);
      const payload: RegisterData = {
        name: name.trim(),
        email: signupEmail,
        password: signupPassword,
        age: regAge,
        address: address.trim(),
        gender: gender ?? "other",
        phone,
      };
      await registerUser(payload);
      setIsLoading(false);
      setApiMessage("Account created successfully. You can now sign in.");
      // Instead of using a Router navigate, switch the active tab back to sign-in.
      setActiveTab("signin");
    } catch (err) {
      setIsLoading(false);
      setApiError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  // Determine if form is currently valid to enable button (basic)
  const isSigninFormValid =
    signinEmail && signinPassword && Object.keys(signinErrors).length === 0;
  const isSignupFormValid =
    name &&
    signupEmail &&
    phone &&
    dob &&
    address &&
    gender &&
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
          <h2 className="mb-2">Welcome to Asha</h2>
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
            {/* API messages */}
            {apiError && (
              <div className="mb-4 text-sm text-red-600">{apiError}</div>
            )}
            {apiMessage && (
              <div className="mb-4 text-sm text-green-600">{apiMessage}</div>
            )}

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
                        const newDob = e.target.value;
                        setDob(newDob);
                        setAge(calculateAge(newDob));
                        if (signupErrors.dob)
                          setSignupErrors((s) => ({ ...s, dob: undefined }));
                      }}
                    />
                    {age !== null && (
                      <p className="text-sm text-muted-foreground">
                        Age: {age} years
                      </p>
                    )}
                    {signupErrors.dob && (
                      <p className="text-sm text-red-600 mt-1">
                        {signupErrors.dob}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Enter your full address"
                      className="rounded-2xl"
                      required
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (signupErrors.address)
                          setSignupErrors((s) => ({
                            ...s,
                            address: undefined,
                          }));
                      }}
                    />
                    {signupErrors.address && (
                      <p className="text-sm text-red-600 mt-1">
                        {signupErrors.address}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      className="w-full rounded-2xl border border-input bg-background px-3 py-2"
                      value={gender}
                      onChange={(e) => {
                        setGender(
                          e.target.value as "male" | "female" | "other"
                        );
                        if (signupErrors.gender)
                          setSignupErrors((s) => ({ ...s, gender: undefined }));
                      }}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {signupErrors.gender && (
                      <p className="text-sm text-red-600 mt-1">
                        {signupErrors.gender}
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
                      !address ||
                      !gender ||
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
