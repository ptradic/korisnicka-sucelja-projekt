"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogIn,
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
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [signupSuccess, setSignupSuccess] = useState(false);
  const passwordStrength = getPasswordStrength(signupPassword);

  // Tutorial step — tracks which field the user is currently on
  const tutorialStep = signupName.trim() === ""
    ? 0
    : signupEmail.trim() === ""
    ? 1
    : signupPassword === ""
    ? 2
    : signupConfirm === ""
    ? 3
    : 4;

  const tutorialMessages: Record<number, string> = {
    0: "Choose your account display name. You\u2019ll pick a character name later.",
    1: "Enter your email address. We\u2019ll use this for login and account recovery.",
    2: "Create a strong password \u2014 at least 6 characters to protect your vault.",
    3: "Almost there! Re-enter your password to make sure there are no typos.",
    4: "All set! Hit the button below to create your account.",
  };

  // Reset errors when switching modes
  useEffect(() => {
    setLoginError("");
    setSignupErrors({});
    setSignupSuccess(false);
  }, [mode]);

  // If already authenticated, skip login page.
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) return;

      const userDoc = await getUserDoc(firebaseUser.uid);
      if (userDoc) {
        router.replace("/vaults");
      }
    });

    return () => unsubscribe();
  }, [router]);

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

    if (!signupName.trim()) errors.name = "Name is required.";
    if (!signupEmail.trim()) errors.email = "Email is required.";
    else if (!EMAIL_RE.test(signupEmail)) errors.email = "Please enter a valid email address.";
    if (!signupPassword) errors.password = "Password is required.";
    else if (signupPassword.length < 6) errors.password = "Password must be at least 6 characters.";
    if (signupPassword !== signupConfirm) errors.confirm = "Passwords do not match.";

    setSignupErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await signUpUser(signupEmail, signupPassword, signupName.trim(), "player");
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


  const inputClass =
    "w-full px-3.5 py-2.5 bg-white/70 border-2 border-[#8B6F47] rounded-xl text-sm text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition";
  const inputErrorClass =
    "w-full px-3.5 py-2.5 bg-white/70 border-2 border-red-400 rounded-xl text-sm text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200/30 transition";

  const googleButton = (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isGoogleLoading}
      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white/70 border-2 border-[#8B6F47] rounded-xl text-sm font-medium text-[#3D1409] hover:bg-white hover:border-[#5C1A1A] active:bg-[#F5EFE0] transition shadow-sm disabled:opacity-60"
    >
      {isGoogleLoading ? (
        <div className="w-4 h-4 border-2 border-[#5C1A1A] border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )}
      <span>{isGoogleLoading ? "Continuing..." : "Continue with Google"}</span>
    </button>
  );

  const divider = (
    <div className="relative my-1">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t-2 border-[#DCC8A8]" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-3 bg-[#F5EFE0] text-xs text-[#8B6F47]">or</span>
      </div>
    </div>
  );

  //  Render
  return (
    <div
      className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-8 relative"
      style={{
        background: 'linear-gradient(to bottom, #3D1409 0%, #5C1A1A 40%, #7A2424 70%, #5C1A1A 100%)',
      }}
    >
      {/* Diamond pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' fill='%23F5EDE0' fill-opacity='0.04'/%3E%3C/svg%3E\")",
          backgroundSize: '40px 40px',
        }}
      />

      <div className="bg-[#F5EFE0] rounded-2xl w-full max-w-sm overflow-hidden relative z-10 border-0" style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)' }}>

        {/* ── Header ── */}
        <div className="px-8 pt-5 pb-3 text-center">
          <h1 className="text-xl font-extrabold text-[#3D1409] tracking-tight" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            {mode === "login" ? "Log In" : "Create Account"}
          </h1>
          <p className="text-xs text-[#8B6F47] mt-0.5">
            {mode === "login" ? "Welcome back, trailblazer" : "Begin your adventure"}
          </p>
        </div>

        {/* ── Login form ── */}
        {mode === "login" && (
          <div className="px-7 py-4 space-y-3 bg-[#F5EFE0]">
            {googleButton}
            {divider}

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#3D1409] uppercase tracking-wide mb-1.5">Email</label>
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

              <div>
                <label className="block text-xs font-semibold text-[#3D1409] uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }}
                    className={(loginError ? inputErrorClass : inputClass) + " pr-10"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89070] hover:text-[#5C1A1A] transition-colors"
                    tabIndex={-1}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 leading-relaxed">{loginError}</p>
                </div>
              )}

              <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] active:from-[#3D1409] active:to-[#4A1515] text-white text-sm font-bold rounded-xl border-2 border-[#3D1409] transition shadow-lg">
                <LogIn className="w-4 h-4" />
                Log In
              </button>
            </form>

            <p className="text-center text-xs text-[#8B6F47]">
              Don&apos;t have an account?{" "}
              <button onClick={() => setMode("signup")} className="font-bold text-[#5C1A1A] hover:text-[#3D1409] underline underline-offset-2 transition-colors">
                Sign up
              </button>
            </p>
          </div>
        )}

        {/* ── Sign-up form ── */}
        {mode === "signup" && !signupSuccess && (
          <div className="px-7 py-6 bg-[#F5EFE0]">
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[#3D1409] uppercase tracking-wide mb-1.5">Profile Name</label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => { setSignupName(e.target.value); setSignupErrors((p) => { const n = { ...p }; delete n.name; return n; }); }}
                  className={signupErrors.name ? inputErrorClass : inputClass}
                  placeholder="e.g., Aragorn"
                />
                {signupErrors.name && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{signupErrors.name}</p>
                )}
                {tutorialStep === 0 && (
                  <div className="mt-2 bg-[#5C1A1A]/5 border border-[#5C1A1A]/15 rounded-lg px-3 py-2">
                    <p className="text-xs text-[#5C1A1A] leading-relaxed flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{tutorialMessages[0]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#3D1409] uppercase tracking-wide mb-1.5">Email</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => { setSignupEmail(e.target.value); setSignupErrors((p) => { const n = { ...p }; delete n.email; return n; }); }}
                  className={signupErrors.email ? inputErrorClass : inputClass}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {signupErrors.email && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{signupErrors.email}</p>
                )}
                {tutorialStep === 1 && (
                  <div className="mt-2 bg-[#5C1A1A]/5 border border-[#5C1A1A]/15 rounded-lg px-3 py-2">
                    <p className="text-xs text-[#5C1A1A] leading-relaxed flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{tutorialMessages[1]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#3D1409] uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => { setSignupPassword(e.target.value); setSignupErrors((p) => { const n = { ...p }; delete n.password; return n; }); }}
                    className={(signupErrors.password ? inputErrorClass : inputClass) + " pr-10"}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowSignupPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89070] hover:text-[#5C1A1A] transition-colors" tabIndex={-1}>
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#8B6F47]">Strength</span>
                      <span className={`text-xs font-semibold ${passwordStrength.colorClass}`}>{passwordStrength.label}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className={`h-1 rounded-full transition-colors duration-200 ${s <= passwordStrength.segments ? passwordStrength.meterClass : "bg-[#E2D5C0]"}`} />
                      ))}
                    </div>
                  </div>
                )}
                {signupErrors.password && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{signupErrors.password}</p>
                )}
                {tutorialStep === 2 && (
                  <div className="mt-2 bg-[#5C1A1A]/5 border border-[#5C1A1A]/15 rounded-lg px-3 py-2">
                    <p className="text-xs text-[#5C1A1A] leading-relaxed flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{tutorialMessages[2]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-semibold text-[#3D1409] uppercase tracking-wide mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showSignupConfirm ? "text" : "password"}
                    value={signupConfirm}
                    onChange={(e) => { setSignupConfirm(e.target.value); setSignupErrors((p) => { const n = { ...p }; delete n.confirm; return n; }); }}
                    className={(signupErrors.confirm ? inputErrorClass : inputClass) + " pr-10"}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowSignupConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89070] hover:text-[#5C1A1A] transition-colors" tabIndex={-1}>
                    {showSignupConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupErrors.confirm && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{signupErrors.confirm}</p>
                )}
                {tutorialStep === 3 && (
                  <div className="mt-2 bg-[#5C1A1A]/5 border border-[#5C1A1A]/15 rounded-lg px-3 py-2">
                    <p className="text-xs text-[#5C1A1A] leading-relaxed flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{tutorialMessages[3]}</span>
                    </p>
                  </div>
                )}
              </div>

              {tutorialStep === 4 && (
                <div className="bg-[#5C1A1A]/5 border border-[#5C1A1A]/15 rounded-lg px-3 py-2">
                  <p className="text-xs text-[#5C1A1A] leading-relaxed flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{tutorialMessages[4]}</span>
                  </p>
                </div>
              )}

              <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] active:from-[#3D1409] active:to-[#4A1515] text-white text-sm font-bold rounded-xl border-2 border-[#3D1409] transition shadow-lg">
                <UserPlus className="w-4 h-4" />
                Create Account
              </button>
            </form>

            <p className="text-center text-xs text-[#8B6F47] mt-4">
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="font-bold text-[#5C1A1A] hover:text-[#3D1409] underline underline-offset-2 transition-colors">
                Log In
              </button>
            </p>
          </div>
        )}

        {/* ── Sign-up success ── */}
        {mode === "signup" && signupSuccess && (
          <div className="px-7 py-10 flex flex-col items-center gap-4 text-center bg-[#F5EFE0]">
            <div className="w-14 h-14 bg-emerald-100/70 border-2 border-emerald-300 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A0A00]">Account Created!</h2>
              <p className="text-sm text-[#8B6F47] mt-1">
                Welcome, <span className="font-semibold text-[#3D1409]">{signupName}</span>. Redirecting...
              </p>
            </div>
            <div className="w-6 h-6 border-[3px] border-[#5C1A1A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
