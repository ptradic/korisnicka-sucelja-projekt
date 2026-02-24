"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/app/components/ui/sheet";
import { Menu, Scroll, Home, BookOpen, HelpCircle, LogIn, LogOut, User, X, Eye, EyeOff, AlertCircle, CheckCircle2, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateUserRole } from "@/src/firebaseService";

type Page = {
  title: string;
  path: `/${string}`;
  icon?: React.ComponentType<{ className?: string }>;
};

type AuthData = {
  isLoggedIn: boolean;
  userType: string;
  name: string;
  email: string;
  loginTime: string;
  uid?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const pages: Page[] = [
  { title: "Home", path: "/", icon: Home },
  { title: "Guides", path: "/guides", icon: BookOpen },
  { title: "Support", path: "/support", icon: HelpCircle },
  { title: "Login", path: "/login", icon: LogIn },
  { title: "Vaults", path: "/vaults", icon: Scroll },
];

function processPage(page: Page, index: number, currentPath?: string, isMobile: boolean = false, onClick?: () => void) {
  const isActive = page.path === "/" ? currentPath === page.path : currentPath?.startsWith(page.path);
  const Icon = page.icon;
  
  return (
    <li key={index} className={isMobile ? "w-full" : ""}>
      <Link 
        href={page.path}
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 font-semibold border-3 transform hover:-translate-y-0.5 active:scale-95 whitespace-nowrap",
          isMobile ? "w-full justify-start px-5 py-4" : "justify-center",
          isActive 
            ? "bg-linear-to-r from-[#5C1A1A] to-[#7A2424] text-white border-[#3D1409] shadow-lg" 
            : "text-[#3D1409] bg-white/60 border-[#8B6F47] hover:bg-white hover:border-[#5C1A1A] hover:shadow-md"
        )}
      >
        {Icon && <Icon className={cn("w-5 h-5", !isMobile && "xl:block hidden")} />}
        <span>{page.title}</span>
      </Link>
    </li>
  );
}

/* ─── Profile Edit Modal ─── */
function ProfileModal({
  auth,
  onClose,
  onSave,
}: {
  auth: AuthData;
  onClose: () => void;
  onSave: (updated: { name: string; email: string; newPassword?: string }) => { success: boolean; error?: string };
}) {
  const [name, setName] = useState(auth.name);
  const [email, setEmail] = useState(auth.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");

  const inputCls =
    "w-full px-3 py-2.5 bg-white/70 border-2 border-[#8B6F47] rounded-lg text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all text-sm";
  const inputErrCls =
    "w-full px-3 py-2.5 bg-white/70 border-2 border-red-400 rounded-lg text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-300/30 transition-all text-sm";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!EMAIL_RE.test(email)) errs.email = "Invalid email address.";

    if (changingPassword) {
      if (!currentPassword) errs.currentPassword = "Enter your current password.";
      if (!newPassword) errs.newPassword = "Enter a new password.";
      else if (newPassword.length < 6) errs.newPassword = "Min. 6 characters.";
      if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match.";

      // Verify current password
      if (!errs.currentPassword) {
        const raw = localStorage.getItem("trailblazers-accounts");
        const accounts = raw ? JSON.parse(raw) : {};
        const account = accounts[auth.email.toLowerCase()];
        if (!account || account.password !== currentPassword) {
          errs.currentPassword = "Incorrect password.";
        }
      }
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const result = onSave({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      newPassword: changingPassword ? newPassword : undefined,
    });

    if (result.success) {
      setSuccessMsg("Profile updated!");
      setChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccessMsg(""), 2500);
    } else if (result.error) {
      setErrors({ general: result.error });
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-[#F5EFE0] border-4 border-[#3D1409] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-[#3D1409]">Account Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#5C1A1A]/10 transition-colors">
            <X className="w-5 h-5 text-[#3D1409]" />
          </button>
        </div>

        {/* Role badge */}
        <div className="mb-4 flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5C1A1A]/10 border-2 border-[#5C1A1A]/30 rounded-full text-xs font-semibold text-[#5C1A1A] capitalize">
            <User className="w-3 h-3" />
            {auth.userType === "dm" || auth.userType === "gm" ? "Game Master" : "Player"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name */}
          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-1">Display Name</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => { const n = { ...p }; delete n.name; return n; }); }}
              className={errors.name ? inputErrCls : inputCls}
              placeholder="Your name"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => { const n = { ...p }; delete n.email; return n; }); }}
              className={errors.email ? inputErrCls : inputCls}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
          </div>

          {/* Password section */}
          {!changingPassword ? (
            <button
              type="button"
              onClick={() => setChangingPassword(true)}
              className="text-sm font-semibold text-[#5C1A1A] hover:text-[#3D1409] underline underline-offset-2 transition-colors"
            >
              Change Password
            </button>
          ) : (
            <div className="space-y-3 p-3 bg-[#5C1A1A]/5 border-2 border-[#5C1A1A]/15 rounded-xl">
              <p className="text-xs font-bold text-[#5C1A1A] uppercase tracking-wider">Change Password</p>
              {/* Current password */}
              <div>
                <label className="block text-[#3D1409] font-semibold text-sm mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); setErrors((p) => { const n = { ...p }; delete n.currentPassword; return n; }); }}
                    className={errors.currentPassword ? inputErrCls : inputCls}
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B6F47] hover:text-[#5C1A1A]" tabIndex={-1}>
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.currentPassword && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.currentPassword}</p>}
              </div>
              {/* New password */}
              <div>
                <label className="block text-[#3D1409] font-semibold text-sm mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => { const n = { ...p }; delete n.newPassword; return n; }); }}
                    className={errors.newPassword ? inputErrCls : inputCls}
                    placeholder="Min. 6 characters"
                  />
                  <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B6F47] hover:text-[#5C1A1A]" tabIndex={-1}>
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.newPassword}</p>}
              </div>
              {/* Confirm new password */}
              <div>
                <label className="block text-[#3D1409] font-semibold text-sm mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => { const n = { ...p }; delete n.confirmPassword; return n; }); }}
                    className={errors.confirmPassword ? inputErrCls : inputCls}
                    placeholder="Re-enter new password"
                  />
                  <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B6F47] hover:text-[#5C1A1A]" tabIndex={-1}>
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.confirmPassword}</p>}
              </div>
              <button
                type="button"
                onClick={() => { setChangingPassword(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setErrors({}); }}
                className="text-xs text-[#5C4A2F] hover:text-[#3D1409] underline transition-colors"
              >
                Cancel password change
              </button>
            </div>
          )}

          {/* General error */}
          {errors.general && (
            <div className="flex items-start gap-2 p-2.5 bg-red-50 border-2 border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-green-50 border-2 border-green-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-700 font-semibold">{successMsg}</p>
            </div>
          )}

          {/* Save */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border-3 border-[#3D1409]"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Navigation Component ─── */
export function Navigation() {
  const currentPath = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute short initials from user name
  const initials = authData?.name
    ? (() => {
        const parts = authData.name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0].slice(0, 2).toUpperCase();
      })()
    : "";

  // Check auth state on mount and when path changes
  useEffect(() => {
    const auth = localStorage.getItem('trailblazers-auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      setIsLoggedIn(!!parsed.isLoggedIn);
      setAuthData(parsed);
    } else {
      setIsLoggedIn(false);
      setAuthData(null);
    }
  }, [currentPath]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('trailblazers-auth');
    setIsLoggedIn(false);
    setAuthData(null);
    setIsOpen(false);
    setProfileDropdownOpen(false);
    router.push('/');
  };

  const handleRoleToggle = async () => {
    if (!authData?.uid) {
      alert('Unable to switch role: UID not found. Please log in again.');
      return;
    }
    
    const newRole = authData.userType === 'dm' ? 'player' : 'dm';
    
    try {
      await updateUserRole(authData.uid, newRole);
      
      const updatedAuth = {
        ...authData,
        userType: newRole,
      };
      
      localStorage.setItem('trailblazers-auth', JSON.stringify(updatedAuth));
      setAuthData(updatedAuth);
      
      // Reload after a short delay
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      console.error('Failed to toggle role:', error);
      const errorMsg = error?.message || 'Unknown error occurred';
      alert(`Failed to switch role: ${errorMsg}`);
    }
  };

  const handleProfileSave = (updated: { name: string; email: string; newPassword?: string }) => {
    if (!authData) return { success: false, error: "Not logged in." };

    const raw = localStorage.getItem("trailblazers-accounts");
    const accounts: Record<string, { name: string; userType: string; email: string; password: string }> = raw ? JSON.parse(raw) : {};
    const oldEmail = authData.email.toLowerCase();
    const account = accounts[oldEmail];
    if (!account) return { success: false, error: "Account not found." };

    // Check if new email conflicts with another account
    const newEmail = updated.email.toLowerCase();
    if (newEmail !== oldEmail && accounts[newEmail]) {
      return { success: false, error: "Email already taken by another account." };
    }

    // Check if name conflicts
    const nameTaken = Object.entries(accounts).some(
      ([key, a]) => key !== oldEmail && a.name.toLowerCase() === updated.name.toLowerCase()
    );
    if (nameTaken) return { success: false, error: "Name already taken." };

    // Update account
    const updatedAccount = {
      ...account,
      name: updated.name,
      email: newEmail,
      password: updated.newPassword || account.password,
    };

    // If email changed, remove old key
    if (newEmail !== oldEmail) {
      delete accounts[oldEmail];
    }
    accounts[newEmail] = updatedAccount;
    localStorage.setItem("trailblazers-accounts", JSON.stringify(accounts));

    // Update auth session
    const newAuth: AuthData = {
      ...authData,
      name: updated.name,
      email: newEmail,
    };
    localStorage.setItem("trailblazers-auth", JSON.stringify(newAuth));
    setAuthData(newAuth);

    return { success: true };
  };

  const navPages = pages.filter(page => page.path !== '/login');


  return (
    <div>
      {/* Mobile Header */}
      <div 
        className="md:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b-4 border-[#3D1409] shadow-xl"
        style={{
          background: isOpen 
            ? 'linear-gradient(to right, #5C1A1A, #7A2424)' 
            : 'rgba(245, 239, 224, 0.95)',
          transition: 'background 0.3s ease-in-out'
        }}
      >
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="group flex items-center gap-4 transition-all duration-300">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center border-4 shadow-lg"
              style={{
                background: isOpen 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'linear-gradient(to bottom right, #5C1A1A, #7A2424)',
                borderColor: isOpen ? 'rgba(255, 255, 255, 0.2)' : '#3D1409',
                backdropFilter: isOpen ? 'blur(4px)' : 'none',
                transition: 'all 0.4s ease-in-out'
              }}
            >
              <Scroll className="w-6 h-6 text-white" />
            </div>
            <h1 
              className="text-xl font-extrabold"
              style={{ 
                fontFamily: 'var(--font-archivo-black)',
                color: isOpen ? '#ffffff' : '#3D1409',
                transition: 'color 0.4s ease-in-out'
              }}
            >
              Trailblazers' Vault
            </h1>
          </Link>
          
          {/* Hamburger Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsOpen(prev => !prev);
            }}
            className="w-12 h-12 flex flex-col items-center justify-center gap-1.5 rounded-lg fixed top-4 right-4 z-100"
            style={{
              background: isOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              backdropFilter: isOpen ? 'blur(4px)' : 'none',
              boxShadow: isOpen 
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)' 
                : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.4s ease-in-out'
            }}
            aria-label="Toggle menu"
          >
            <span className={cn("block w-7 h-1 rounded-full transition-all duration-300 ease-in-out", isOpen ? "rotate-45 translate-y-2.5 bg-white" : "bg-[#3D1409]")} />
            <span className={cn("block w-7 h-1 rounded-full transition-all duration-300 ease-in-out", isOpen ? "opacity-0 bg-white" : "bg-[#3D1409]")} />
            <span className={cn("block w-7 h-1 rounded-full transition-all duration-300 ease-in-out", isOpen ? "-rotate-45 -translate-y-2.5 bg-white" : "bg-[#3D1409]")} />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-20 pt-24"
          onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          style={{ top: '0', pointerEvents: 'auto' }}
        />
      )}
      
      <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <SheetTrigger asChild className="hidden" suppressHydrationWarning>
          <button aria-label="Toggle menu" suppressHydrationWarning />
        </SheetTrigger>
        <SheetContent 
          side="top" 
          className="w-full h-auto bg-linear-to-br from-[#F5EFE0] via-[#E8D5B7] to-[#DCC8A8] border-none p-0 pb-6 pt-24 z-30"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>

          <nav className="px-6">
            <p className="text-xs font-bold text-[#5C4A2F] uppercase tracking-wider mb-4">Navigation</p>
            <ul className="space-y-2">
              {navPages.map((page, index) => (
                <div key={index} onClick={() => setIsOpen(false)}>
                  {processPage(page, index, currentPath, true, page.path === '/vaults' ? () => window.dispatchEvent(new Event('vaults-go-home')) : undefined)}
                </div>
              ))}
              {!isLoggedIn && (
                <div onClick={() => setIsOpen(false)}>
                  {processPage({ title: 'Login', path: '/login', icon: LogIn }, navPages.length, currentPath, true)}
                </div>
              )}
            </ul>

            {/* Mobile Account Section — shown only when logged in */}
            {isLoggedIn && authData && (
              <div className="mt-6">
                <p className="text-xs font-bold text-[#5C4A2F] uppercase tracking-wider mb-4">Account</p>
                
                {/* Profile card */}
                <div className="bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8] rounded-2xl p-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#5C1A1A] to-[#7A2424] flex items-center justify-center border-4 border-[#3D1409] shrink-0">
                      <span className="text-sm font-bold text-white leading-none">{initials}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#3D1409] truncate">{authData.name}</p>
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#5C1A1A]/10 border border-[#5C1A1A]/30 rounded text-[10px] font-bold text-[#5C1A1A] uppercase shrink-0">
                          {authData.userType === "dm" || authData.userType === "gm" ? "GM" : "Player"}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C4A2F] truncate">{authData.email}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <ul className="space-y-2">
                  <li className="w-full">
                    <button
                      onClick={() => { setIsOpen(false); handleRoleToggle(); }}
                      className="inline-flex w-full items-center gap-3 px-5 py-4 rounded-lg transition-all duration-300 font-semibold border-3 transform hover:-translate-y-0.5 active:scale-95 justify-start text-[#3D1409] bg-white/60 border-[#8B6F47] hover:bg-white hover:border-[#5C1A1A] hover:shadow-md"
                    >
                      {authData.userType === 'dm' || authData.userType === 'gm' ? (
                        <>
                          <ToggleRight className="w-5 h-5" />
                          <span>Switch to Player Mode</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5" />
                          <span>Switch to DM Mode</span>
                        </>
                      )}
                    </button>
                  </li>
                  <li className="w-full">
                    <button
                      onClick={() => { setIsOpen(false); setProfileModalOpen(true); }}
                      className="inline-flex w-full items-center gap-3 px-5 py-4 rounded-lg transition-all duration-300 font-semibold border-3 transform hover:-translate-y-0.5 active:scale-95 justify-start text-[#3D1409] bg-white/60 border-[#8B6F47] hover:bg-white hover:border-[#5C1A1A] hover:shadow-md"
                    >
                      <User className="w-5 h-5" />
                      <span>Edit Profile</span>
                    </button>
                  </li>
                  <li className="w-full">
                    <button 
                      onClick={handleLogout}
                      className="inline-flex w-full items-center gap-3 px-5 py-4 rounded-lg transition-all duration-300 font-semibold border-3 transform hover:-translate-y-0.5 active:scale-95 justify-start text-[#3D1409] bg-white/60 border-[#8B6F47] hover:bg-white hover:border-[#5C1A1A] hover:shadow-md"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-[#F5EFE0]/95 backdrop-blur-md border-b-4 border-[#3D1409] shadow-xl z-50">
        <div className="max-w-7xl mx-auto px-3 md:px-4 xl:px-6">
          <div className="flex items-center h-20 gap-2 xl:gap-6">
            {/* Brand Logo */}
            <Link href="/" className="group flex items-center gap-2 xl:gap-3 shrink-0 transition-all duration-300 w-auto xl:w-64">
              <div className="w-12 h-12 xl:w-14 xl:h-14 shrink-0 aspect-square bg-linear-to-br from-[#5C1A1A] to-[#7A2424] group-hover:from-[#4A1515] group-hover:to-[#5C1A1A] rounded-2xl flex items-center justify-center border-4 border-[#3D1409] shadow-lg hover:rotate-6 transition-all duration-300">
                <Scroll className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#3D1409] hidden xl:block" style={{ fontFamily: 'var(--font-archivo-black)' }}>Trailblazers' Vault</h1>
            </Link>
            
            {/* Navigation Links */}
            <ul className="flex gap-1.5 md:gap-2 xl:gap-3 items-center flex-1 justify-center">
              {navPages.map((page, index) => processPage(page, index, currentPath, false, page.path === '/vaults' ? () => window.dispatchEvent(new Event('vaults-go-home')) : undefined))}
            </ul>

            {/* Right side: Profile or Login */}
            <div className="shrink-0 w-auto xl:w-64 flex justify-end">
              {isLoggedIn && authData ? (
                <div className="relative" ref={dropdownRef}>
                  {/* Profile icon button */}
                  <button
                    onClick={() => setProfileDropdownOpen(v => !v)}
                    className={cn(
                      "w-12 h-12 xl:w-14 xl:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border-4 transform hover:-translate-y-0.5 hover:rotate-6 active:scale-95",
                      profileDropdownOpen
                        ? "bg-linear-to-br from-[#5C1A1A] to-[#7A2424] border-[#3D1409] shadow-lg"
                        : "bg-linear-to-br from-[#5C1A1A] to-[#7A2424] border-[#3D1409] shadow-lg hover:from-[#4A1515] hover:to-[#5C1A1A]"
                    )}
                  >
                    <span className="text-sm xl:text-base font-bold text-white leading-none">{initials}</span>
                  </button>

                  {/* Dropdown menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#F5EFE0] border-3 border-[#3D1409] rounded-xl shadow-2xl overflow-hidden z-60">
                      {/* User info */}
                      <div className="p-4 border-b-2 border-[#D9C7AA]">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#5C1A1A] to-[#7A2424] flex items-center justify-center border-2 border-[#3D1409] shrink-0">
                            <span className="text-sm font-bold text-white leading-none">{initials}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-[#3D1409] truncate">{authData.name}</p>
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-[#5C1A1A]/10 border border-[#5C1A1A]/30 rounded text-[10px] font-bold text-[#5C1A1A] uppercase shrink-0">
                                {authData.userType === "dm" || authData.userType === "gm" ? "GM" : "Player"}
                              </span>
                            </div>
                            <p className="text-xs text-[#5C4A2F] truncate">{authData.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-2">
                        <button
                          onClick={() => { setProfileDropdownOpen(false); handleRoleToggle(); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#3D1409] hover:bg-white/80 transition-colors"
                        >
                          {authData.userType === 'dm' || authData.userType === 'gm' ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-[#5C1A1A]" />
                              Switch to Player
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-[#5C1A1A]" />
                              Switch to DM
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => { setProfileDropdownOpen(false); setProfileModalOpen(true); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#3D1409] hover:bg-white/80 transition-colors"
                        >
                          <User className="w-4 h-4 text-[#5C1A1A]" />
                          Account Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#3D1409] hover:bg-white/80 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-[#5C1A1A]" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ul>
                  {processPage({ title: 'Login', path: '/login', icon: LogIn }, navPages.length, currentPath, false)}
                </ul>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile edit modal */}
      {profileModalOpen && authData && (
        <ProfileModal
          auth={authData}
          onClose={() => setProfileModalOpen(false)}
          onSave={handleProfileSave}
        />
      )}
    </div>
  );
}
