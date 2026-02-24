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
import { signUpUser, signInUser, onAuthChange, getUserDoc } from "@/src/firebaseService";

//  Helpers 
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//  Main Component 
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

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
        localStorage.setItem(
          "trailblazers-auth",
          JSON.stringify({
            isLoggedIn: true,
            uid: user.uid,
            userType: userDoc.role,
            name: userDoc.name,
            email: userDoc.email,
            loginTime: new Date().toISOString(),
          })
        );
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
      const user = await signUpUser(signupEmail, signupPassword, signupName.trim(), userType!);
      setSignupSuccess(true);

      // Auto-login after short delay
      setTimeout(() => {
        localStorage.setItem(
          "trailblazers-auth",
          JSON.stringify({
            isLoggedIn: true,
            uid: user.uid,
            userType,
            name: signupName.trim(),
            email: signupEmail.toLowerCase(),
            loginTime: new Date().toISOString(),
          })
        );
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
                className="group w-full flex items-center justify-center gap-2 px-6 py-4 bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 border-4 border-[#3D1409]"
              >
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                <span>Log In</span>
              </button>
            </form>

            {/* Switch to sign-up */}
            <div className="mt-6 pt-5 border-t-2 border-[#D9C7AA]">
              <p className="text-sm text-[#5C4A2F] text-center mb-3">
                Don&apos;t have an account yet?
              </p>
              <button
                onClick={() => setMode("signup")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/60 hover:bg-white border-3 border-[#8B6F47] hover:border-[#5C1A1A] text-[#3D1409] font-semibold rounded-xl transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5 active:scale-95"
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
              className="flex items-center gap-1.5 text-sm font-semibold text-[#5C1A1A] hover:text-[#3D1409] mb-5 transition-colors group"
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
                className="group w-full flex items-center justify-center gap-2 px-6 py-4 bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold text-base sm:text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 border-4 border-[#3D1409]"
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
