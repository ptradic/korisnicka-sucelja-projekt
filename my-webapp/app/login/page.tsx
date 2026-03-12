"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogIn,
  Wand2,
  Shield,
  Sparkles,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { signUpUser, signInUser, signInWithGoogle, onAuthChange, getUserDoc } from "@/src/firebaseService";

//  Helpers 
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type PasswordStrength = {
  label: "Weak" | "Fair" | "Strong";
  colorClass: string;
  meterClass: string;
  segments: number;
};

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return {
      label: "Weak",
      colorClass: "text-red-600",
      meterClass: "bg-red-500",
      segments: 1,
    };
  }

  if (score <= 4) {
    return {
      label: "Fair",
      colorClass: "text-amber-600",
      meterClass: "bg-amber-500",
      segments: 2,
    };
  }

  return {
    label: "Strong",
    colorClass: "text-emerald-600",
    meterClass: "bg-emerald-500",
    segments: 3,
  };
}

//  Main Component 
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Sign-up state
  const [userType, setUserType] = useState<"dm" | "player" | null>(null);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [signupSuccess, setSignupSuccess] = useState(false);
  const passwordStrength = getPasswordStrength(signupPassword);

  // Tutorial step  tracks which field the user is currently on
  const tutorialStep = !userType
    ? 0
    : signupName.trim() === ""
    ? 1
    : signupEmail.trim() === ""
    ? 2
    : signupPassword === ""
    ? 3
    : signupConfirm === ""
    ? 4
    : 5;

  const tutorialMessages: Record<number, string> = {
    0: "First, choose whether you are a Game Master or a Player. This determines your role and permissions.",
    1: userType === "dm"
      ? "Great! Now give your account a GM name \u2014 this is how players will see you."
      : "Great! Now choose your Player name \u2014 this is your adventurer identity.",
    2: "Enter your email address. We\u2019ll use this for login and account recovery.",
    3: "Create a strong password \u2014 at least 6 characters to protect your vault.",
    4: "Almost there! Re-enter your password to make sure there are no typos.",
    5: "All set! Hit the button below to create your account.",
  };

  // Reset errors when switching modes
  useEffect(() => {
    setLoginError("");
    setSignupErrors({});
    setSignupSuccess(false);
  }, [mode]);

  //  Login handler 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Please fill in all fields.");
      return;
    }

    try {
      const user = await signInUser(loginEmail, loginPassword);
      const userDoc = await getUserDoc(user.uid);
      
      if (userDoc) {
        router.push("/vaults");
      }
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setLoginError("Invalid email or password. Don't have an account? Sign up below.");
      } else if (error.code === 'auth/too-many-requests') {
        setLoginError("Too many failed login attempts. Please try again later.");
      } else {
        setLoginError("Login failed. Please try again.");
      }
    }
  };

  //  Google Sign-In handler 
  const handleGoogleSignIn = async () => {
    setLoginError("");
    setIsGoogleLoading(true);
    
    try {
      const { user } = await signInWithGoogle();
      const userDoc = await getUserDoc(user.uid);
      
      if (userDoc) {
        router.push("/vaults");
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error.code, error.message);
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show error
      } else if (error.code === 'auth/popup-blocked') {
        setLoginError("Popup was blocked. Please allow popups for this site.");
      } else if (error.code === 'auth/unauthorized-domain') {
        setLoginError("This domain is not authorized. Please add it to Firebase Console.");
      } else if (error.code === 'auth/operation-not-allowed') {
        setLoginError("Google sign-in is not enabled. Please enable it in Firebase Console.");
      } else {
        setLoginError(`Google sign-in failed: ${error.code || error.message || 'Unknown error'}`);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  //  Sign-up handler 
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!userType) errors.role = "Please select a role.";
    if (!signupName.trim()) errors.name = "Name is required.";
    if (!signupEmail.trim()) errors.email = "Email is required.";
    else if (!EMAIL_RE.test(signupEmail)) errors.email = "Please enter a valid email address.";
    if (!signupPassword) errors.password = "Password is required.";
    else if (signupPassword.length < 6) errors.password = "Password must be at least 6 characters.";
    if (signupPassword !== signupConfirm) errors.confirm = "Passwords do not match.";

    setSignupErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await signUpUser(signupEmail, signupPassword, signupName.trim(), userType!);
      setSignupSuccess(true);

      // Auto-login after short delay
      setTimeout(() => {
        router.push("/vaults");
      }, 1500);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setSignupErrors({ email: "An account with this email already exists." });
      } else if (error.code === 'auth/weak-password') {
        setSignupErrors({ password: "Password is too weak. Please use a stronger password." });
      } else {
        setSignupErrors({ email: "Sign up failed. Please try again." });
      }
    }
  };

  //  DEV skip - removed, using real auth now


  //  Shared UI pieces 
  const inputClass =
    "w-full px-4 py-3 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/60 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300";
  const inputErrorClass =
    "w-full px-4 py-3 bg-white/70 border-3 border-red-400 rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/60 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-300/30 transition-all duration-300";

  //  Render 
  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF] flex items-center justify-center px-4 py-8 sm:py-12 pt-24 sm:pt-28">
      <div className="bg-[#F5EFE0] border-4 border-[#3D1409] rounded-2xl p-6 sm:p-8 md:p-10 max-w-md w-full shadow-2xl">
        {/*  Header  */}
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-[#3D1409] text-center mb-6"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          {mode === "login" ? "Log In" : "Sign In"}
        </h1>

        {/* 
            LOGIN FORM
            */}
        {mode === "login" && (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[#3D1409] font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setLoginError(""); }}
                  className={loginError ? inputErrorClass : inputClass}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[#3D1409] font-semibold mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }}
                    className={loginError ? inputErrorClass : inputClass}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6F47] hover:text-[#5C1A1A] transition-colors"
                    tabIndex={-1}
                  >
                    {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {loginError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{loginError}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary group w-full text-lg"
              >
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                <span>Log In</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-[#D9C7AA]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[#F5EFE0] text-[#8B6F47] font-medium">or continue with</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="btn-secondary group w-full gap-3 text-lg"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-[#5C1A1A] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>{isGoogleLoading ? "Signing in..." : "Sign in with Google"}</span>
            </button>

            {/* Switch to sign-up */}
            <div className="mt-6 pt-5 border-t-2 border-[#D9C7AA]">
              <p className="text-sm text-[#5C4A2F] text-center mb-3">
                Don&apos;t have an account yet?
              </p>
              <button
                onClick={() => setMode("signup")}
                className="btn-secondary w-full"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create an Account</span>
              </button>
            </div>
          </>
        )}

        {/* 
            SIGN-UP FORM
            */}
        {mode === "signup" && !signupSuccess && (
          <>
            {/* Back to login */}
            <button
              onClick={() => setMode("login")}
              className="btn-ghost group mb-5 text-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Log In
            </button>

            <form onSubmit={handleSignup} className="space-y-4">
              {/* 1. Role selection */}
              <div>
                <label className="block text-[#3D1409] font-semibold mb-2 text-center">I am a...</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setUserType("dm"); setSignupErrors((p) => { const n = { ...p }; delete n.role; return n; }); }}
                    className={`group px-4 py-4 rounded-lg border-3 transition-all duration-300 ${
                      userType === "dm"
                        ? "bg-linear-to-br from-[#5C1A1A] to-[#7A2424] border-[#3D1409] shadow-md"
                        : "bg-white/50 border-[#8B6F47] hover:border-[#5C1A1A] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Wand2
                        className={`w-5 h-5 transition-colors ${
                          userType === "dm" ? "text-white" : "text-[#5C1A1A]"
                        }`}
                      />
                      <span
                        className={`font-bold text-sm transition-colors ${
                          userType === "dm" ? "text-white" : "text-[#3D1409]"
                        }`}
                      >
                        Game Master
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUserType("player"); setSignupErrors((p) => { const n = { ...p }; delete n.role; return n; }); }}
                    className={`group px-4 py-4 rounded-lg border-3 transition-all duration-300 ${
                      userType === "player"
                        ? "bg-linear-to-br from-[#5C1A1A] to-[#7A2424] border-[#3D1409] shadow-md"
                        : "bg-white/50 border-[#8B6F47] hover:border-[#5C1A1A] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Shield
                        className={`w-5 h-5 transition-colors ${
                          userType === "player" ? "text-white" : "text-[#5C1A1A]"
                        }`}
                      />
                      <span
                        className={`font-bold text-sm transition-colors ${
                          userType === "player" ? "text-white" : "text-[#3D1409]"
                        }`}
                      >
                        Player
                      </span>
                    </div>
                  </button>
                </div>
                {signupErrors.role && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {signupErrors.role}
                  </p>
                )}
                {tutorialStep === 0 && (
                  <div className="mt-2 bg-[#5C1A1A]/5 border-2 border-[#5C1A1A]/15 rounded-lg px-3 py-2">
                    <p className="text-xs text-[#5C1A1A] leading-relaxed flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{tutorialMessages[0]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* 2. Name */}
              <div>
                <label className="block text-[#3D1409] font-semibold mb-2">
                  {userType === "dm" ? "GM Name" : "Player Name"}
                </label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => {
                    setSignupName(e.target.value);
                    setSignupErrors((p) => { const n = { ...p }; delete n.name; return n; });
                  }}
                  className={signupErrors.name ? inputErrorClass : inputClass}
                  placeholder={userType === "dm" ? "e.g., Game Master" : "e.g., Aragorn"}
                />
                {signupErrors.name && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {signupErrors.name}
                  </p>
                )}
                {tutorialStep === 1 && (
                  <div className="mt-2 bg-[#5C1A1A]/5 border-2 border-[#5C1A1A]/15 rounded-lg px-3 py-2">
                    <p className="text-xs text-[#5C1A1A] leading-relaxed flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{tutorialMessages[1]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* 3. Email */}
              <div>
                <label className="block text-[#3D1409] font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    setSignupErrors((p) => { const n = { ...p }; delete n.email; return n; });
                  }}
                  className={signupErrors.email ? inputErrorClass : inputClass}
                  placeholder={userType === "dm" ? "gm@example.com" : "player@example.com"}
                  autoComplete="email"
                />
                {signupErrors.email && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {signupErrors.email}
                  </p>
                )}
                {tutorialStep === 2 && (
                  <div className="mt-2 bg-[#5C1A1A]/5 border-2 border-[#5C1A1A]/15 rounded-lg px-3 py-2">
                    <p className="text-xs text-[#5C1A1A] leading-relaxed flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{tutorialMessages[2]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* 4. Password */}
              <div>
                <label className="block text-[#3D1409] font-semibold mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      setSignupErrors((p) => { const n = { ...p }; delete n.password; return n; });
                    }}
                    className={signupErrors.password ? inputErrorClass : inputClass}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6F47] hover:text-[#5C1A1A] transition-colors"
                    tabIndex={-1}
                  >
                    {showSignupPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signupPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#5C4A2F]">Password strength</span>
                      <span className={`text-xs font-semibold ${passwordStrength.colorClass}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[1, 2, 3].map((segment) => (
                        <div
                          key={segment}
                          className={`h-1.5 rounded-full transition-colors duration-200 ${
                            segment <= passwordStrength.segments ? passwordStrength.meterClass : "bg-[#D9C7AA]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {signupErrors.password && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {signupErrors.password}
                  </p>
                )}
                {tutorialStep === 3 && (
                  <div className="mt-2 bg-[#5C1A1A]/5 border-2 border-[#5C1A1A]/15 rounded-lg px-3 py-2">
                    <p className="text-xs text-[#5C1A1A] leading-relaxed flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{tutorialMessages[3]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* 5. Confirm password */}
              <div>
                <label className="block text-[#3D1409] font-semibold mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showSignupConfirm ? "text" : "password"}
                    value={signupConfirm}
                    onChange={(e) => {
                      setSignupConfirm(e.target.value);
                      setSignupErrors((p) => { const n = { ...p }; delete n.confirm; return n; });
                    }}
                    className={signupErrors.confirm ? inputErrorClass : inputClass}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6F47] hover:text-[#5C1A1A] transition-colors"
                    tabIndex={-1}
                  >
                    {showSignupConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signupErrors.confirm && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {signupErrors.confirm}
                  </p>
                )}
                {tutorialStep === 4 && (
                  <div className="mt-2 bg-[#5C1A1A]/5 border-2 border-[#5C1A1A]/15 rounded-lg px-3 py-2">
                    <p className="text-xs text-[#5C1A1A] leading-relaxed flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{tutorialMessages[4]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* All done hint */}
              {tutorialStep === 5 && (
                <div className="bg-[#5C1A1A]/5 border-2 border-[#5C1A1A]/15 rounded-lg px-3 py-2">
                  <p className="text-xs text-[#5C1A1A] leading-relaxed flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{tutorialMessages[5]}</span>
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary group w-full text-base sm:text-lg"
              >
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>{userType ? `Sign Up as ${userType === "dm" ? "Game Master" : "Player"}` : "Sign Up"}</span>
              </button>
            </form>

            {/* Switch to login */}
            <div className="mt-5 pt-4 border-t-2 border-[#D9C7AA]">
              <p className="text-sm text-[#5C4A2F] text-center">
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="font-bold text-[#5C1A1A] hover:text-[#3D1409] underline underline-offset-2 transition-colors"
                >
                  Log In
                </button>
              </p>
            </div>
          </>
        )}

        {/*  Sign-up success  */}
        {mode === "signup" && signupSuccess && (
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="w-16 h-16 bg-green-100 border-4 border-green-300 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#3D1409] text-center">Account Created!</h2>
            <p className="text-sm text-[#5C4A2F] text-center">
              Welcome aboard, <span className="font-semibold">{signupName}</span>. Redirecting to your vaults...
            </p>
            <div className="w-8 h-8 border-4 border-[#5C1A1A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
