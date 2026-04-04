"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/app/components/ui/sheet";
import { Menu, Home, BookOpen, HelpCircle, LogIn, LogOut, User, X, Eye, EyeOff, AlertCircle, CheckCircle2, Save, Trash2, AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateUserName, signOutUser, onAuthChange, getUserDoc, deleteUserProfile } from "@/src/firebaseService";
import { auth } from "@/src/firebase";
import { reauthenticateWithCredential, reauthenticateWithPopup, EmailAuthProvider, GoogleAuthProvider, updatePassword } from "firebase/auth";

type Page = {
  title: string;
  path: `/${string}`;
  icon?: React.ComponentType<{ className?: string }>;
};

type AuthData = {
  userType: 'gm' | 'player';
  name: string;
  email: string;
  uid: string;
  isGoogleUser: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const pages: Page[] = [
  { title: "Home", path: "/", icon: Home },
  { title: "Guides", path: "/guides", icon: BookOpen },
  { title: "Support", path: "/support", icon: HelpCircle },
  { title: "Login", path: "/login", icon: LogIn },
  { title: "Vaults", path: "/vaults", icon: Package },
];

function processPage(page: Page, index: number, currentPath?: string, isMobile: boolean = false, onClick?: () => void, transparent: boolean = false) {
  const isActive = page.path === "/" ? currentPath === page.path : currentPath?.startsWith(page.path);
  const Icon = page.icon;

  return (
    <li key={index} className={isMobile ? "w-full" : ""}>
      <Link
        href={page.path}
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 font-semibold transition-all duration-200",
          isMobile ? "w-full justify-start px-5 py-4" : "justify-center",
          isActive
            ? transparent
              ? "bg-white/15 border-2 border-white/30 text-white shadow-md backdrop-blur-sm"
              : "btn-primary text-white border-[#3D1409] shadow-lg"
            : transparent
              ? "border-2 border-transparent text-[#F5EDE0]/80 hover:bg-white/10 hover:text-[#F5EDE0]"
              : "btn-secondary text-[#3D1409]"
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
  onDelete,
}: {
  auth: AuthData;
  onClose: () => void;
  onSave: (updated: { name: string; email: string; currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; error?: string }>;
  onDelete: (password?: string) => Promise<{ success: boolean; error?: string }>;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mouseDownOnBackdrop = useRef(false);

  // Delete profile state
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0); // 0=hidden, 1=warning, 2=confirm
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePw, setShowDeletePw] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const inputCls =
    "w-full px-3 py-2.5 bg-white/70 border-2 border-[#8B6F47] rounded-lg text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all text-sm";
  const inputErrCls =
    "w-full px-3 py-2.5 bg-white/70 border-2 border-red-400 rounded-lg text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-300/30 transition-all text-sm";

  const handleSubmit = async (e: React.FormEvent) => {
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
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    const result = await onSave({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      currentPassword: changingPassword ? currentPassword : undefined,
      newPassword: changingPassword ? newPassword : undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg("Profile updated!");
      setChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccessMsg(""), 2500);
    } else if (result.error) {
      if (result.error.includes("password") || result.error.includes("credential")) {
        setErrors({ currentPassword: result.error });
      } else {
        setErrors({ general: result.error });
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center px-4"
      onMouseDown={() => { mouseDownOnBackdrop.current = true; }}
      onClick={() => { if (mouseDownOnBackdrop.current) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-[#F5EFE0] border-4 border-[#3D1409] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onMouseDown={(e) => { e.stopPropagation(); mouseDownOnBackdrop.current = false; }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-[#3D1409]">Account Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#5C1A1A]/10 transition-colors">
            <X className="w-5 h-5 text-[#3D1409]" />
          </button>
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

          {/* Password section — hidden for Google users */}
          {auth.isGoogleUser ? (
            <p className="text-xs text-[#5C4A2F] italic">Password is managed by Google. You can change it in your Google account settings.</p>
          ) : !changingPassword ? (
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
            disabled={isSubmitting}
            className="btn-primary w-full text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* ── Danger Zone: Delete Profile ── */}
        <div className="mt-5 border-t-2 border-red-200 pt-4">
          {deleteStep === 0 && (
            <button
              type="button"
              onClick={() => setDeleteStep(1)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete Profile
            </button>
          )}

          {deleteStep === 1 && (
            <div className="space-y-3 p-3 bg-red-50 border-2 border-red-300 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700">This action is permanent</p>
                  <p className="text-xs text-red-600 mt-1">Deleting your profile will:</p>
                  <ul className="text-xs text-red-600 mt-1 space-y-0.5 list-disc ml-4">
                    <li>Delete your account permanently</li>
                    <li>Delete all vaults you created (as Game Master)</li>
                    <li>Remove you from all joined vaults</li>
                    <li>Delete all your custom homebrew items</li>
                  </ul>
                  <p className="text-xs text-red-600 mt-1.5 font-semibold">Vaults you joined (but didn't create) will not be deleted.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setDeleteStep(0); setDeleteError(""); }}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-[#3D1409] bg-white border-2 border-[#8B6F47]/40 rounded-lg hover:bg-[#F5EFE0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteStep(2)}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 border-2 border-red-700 rounded-lg transition-colors"
                >
                  I understand, continue
                </button>
              </div>
            </div>
          )}

          {deleteStep === 2 && (
            <div className="space-y-3 p-3 bg-red-50 border-2 border-red-300 rounded-xl">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Final Confirmation</p>
              <div>
                <label className="block text-red-700 font-semibold text-xs mb-1">
                  Type &quot;DELETE&quot; to confirm
                </label>
                <input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-red-300 rounded-lg text-[#3D1409] placeholder:text-red-300 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-300/30 transition-all text-sm"
                  placeholder="DELETE"
                />
              </div>
              {!auth.isGoogleUser && (
                <div>
                  <label className="block text-red-700 font-semibold text-xs mb-1">Enter your password</label>
                  <div className="relative">
                    <input
                      type={showDeletePw ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(""); }}
                      className="w-full px-3 py-2 bg-white border-2 border-red-300 rounded-lg text-[#3D1409] placeholder:text-red-300 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-300/30 transition-all text-sm"
                      placeholder="Your password"
                    />
                    <button type="button" onClick={() => setShowDeletePw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600" tabIndex={-1}>
                      {showDeletePw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              {auth.isGoogleUser && (
                <p className="text-xs text-red-600">You will be asked to sign in with Google to confirm deletion.</p>
              )}
              {deleteError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {deleteError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setDeleteStep(0); setDeletePassword(""); setDeleteConfirmText(""); setDeleteError(""); }}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-[#3D1409] bg-white border-2 border-[#8B6F47]/40 rounded-lg hover:bg-[#F5EFE0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting || deleteConfirmText !== "DELETE" || (!auth.isGoogleUser && !deletePassword)}
                  onClick={async () => {
                    setIsDeleting(true);
                    setDeleteError("");
                    const result = await onDelete(auth.isGoogleUser ? undefined : deletePassword);
                    if (!result.success) {
                      setDeleteError(result.error || "Failed to delete profile.");
                      setIsDeleting(false);
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 border-2 border-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                    {isDeleting ? "Deleting..." : "Delete Forever"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
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
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navTransparent = true;

  // Compute short initials from user name
  const initials = authData?.name
    ? (() => {
        const parts = authData.name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0].slice(0, 2).toUpperCase();
      })()
    : "";

  // Keep auth state in sync with Firebase only.
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getUserDoc(firebaseUser.uid);
        setIsLoggedIn(true);
        setAuthData({
          uid: firebaseUser.uid,
          userType: userDoc?.role ?? 'player',
          name: userDoc?.name ?? firebaseUser.displayName ?? 'Adventurer',
          email: userDoc?.email ?? firebaseUser.email ?? '',
          isGoogleUser: firebaseUser.providerData.some(p => p.providerId === 'google.com'),
        });
      } else {
        setIsLoggedIn(false);
        setAuthData(null);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Close hamburger menu when resizing to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setIsOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

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

  // Pages that are accessible without login
  const PUBLIC_PATHS = ['/', '/guides', '/support', '/login'];
  const isPublicPage = (path: string) =>
    PUBLIC_PATHS.some((p) => p === '/' ? path === '/' : path.startsWith(p));

  const handleLogout = async () => {
    try {
      // Sign out from Firebase first
      await signOutUser();
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
    }
    setIsLoggedIn(false);
    setAuthData(null);
    setIsOpen(false);
    setProfileDropdownOpen(false);
    setShowLogoutToast(true);
    setTimeout(() => setShowLogoutToast(false), 4000);
    if (!isPublicPage(currentPath ?? '')) {
      router.push('/');
    }
  };

  const handleProfileSave = async (updated: { name: string; email: string; currentPassword?: string; newPassword?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!authData) return { success: false, error: "Not logged in." };

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return { success: false, error: "Session expired. Please log in again." };

      // Reauthenticate and change password if requested
      if (updated.currentPassword && updated.newPassword) {
        const credential = EmailAuthProvider.credential(firebaseUser.email!, updated.currentPassword);
        try {
          await reauthenticateWithCredential(firebaseUser, credential);
        } catch {
          return { success: false, error: "Incorrect current password." };
        }
        await updatePassword(firebaseUser, updated.newPassword);
      }

      // Update name in Firestore if changed
      if (updated.name !== authData.name) {
        await updateUserName(authData.uid!, updated.name);
      }

      const newAuth: AuthData = {
        ...authData,
        name: updated.name,
        email: updated.email,
      };
      setAuthData(newAuth);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to update profile." };
    }
  };

  const handleProfileDelete = async (password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!authData) return { success: false, error: "Not logged in." };

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return { success: false, error: "Session expired. Please log in again." };

      // Reauthenticate before deletion
      if (authData.isGoogleUser) {
        try {
          await reauthenticateWithPopup(firebaseUser, new GoogleAuthProvider());
        } catch {
          return { success: false, error: "Google sign-in cancelled or failed." };
        }
      } else {
        if (!password) return { success: false, error: "Password is required." };
        const credential = EmailAuthProvider.credential(firebaseUser.email!, password);
        try {
          await reauthenticateWithCredential(firebaseUser, credential);
        } catch {
          return { success: false, error: "Incorrect password." };
        }
      }

      // Delete profile (campaigns, inventories, user doc, auth account)
      await deleteUserProfile(authData.uid);

      // Clear local state and redirect
      setIsLoggedIn(false);
      setAuthData(null);
      setProfileModalOpen(false);
      router.push('/');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to delete profile." };
    }
  };

  const navPages = pages.filter(page => page.path !== '/login');


  return (
    <div>
      {/* Mobile Header */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b-4 border-[#3D1409] shadow-xl transition-all duration-300"
        style={{
          background: isOpen
            ? 'linear-gradient(to right, #5C1A1A, #7A2424)'
            : navTransparent ? 'linear-gradient(to right, #5C1A1A, #7A2424)' : 'rgba(245, 239, 224, 0.95)',
          transition: 'background 0.3s ease-in-out'
        }}
      >
        <div className="flex items-center justify-between px-4 py-2">
          <Link href="/" className="group flex items-center gap-3 transition-all duration-300">
            <img src="/tbvWhite.svg" alt="TBV logo" className="w-12 h-12 object-contain shrink-0" />
            <h1 
              className="text-xl font-extrabold"
              style={{ 
                fontFamily: 'var(--font-archivo-black)',
                color: isOpen ? '#ffffff' : navTransparent ? '#F5EDE0' : '#3D1409',
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
            className="flex flex-col items-center justify-center gap-1.5 fixed top-6 right-4 z-100"
            style={{ background: 'none', border: 'none', boxShadow: 'none' }}
            aria-label="Toggle menu"
          >
            <span className={cn("block w-8 h-0.5 rounded-full transition-all duration-300 ease-in-out", isOpen ? "rotate-45 translate-y-2 bg-white" : navTransparent ? "bg-[#F5EDE0]" : "bg-[#3D1409]")} />
            <span className={cn("block w-8 h-0.5 rounded-full transition-all duration-300 ease-in-out", isOpen ? "opacity-0 bg-white" : navTransparent ? "bg-[#F5EDE0]" : "bg-[#3D1409]")} />
            <span className={cn("block w-8 h-0.5 rounded-full transition-all duration-300 ease-in-out", isOpen ? "-rotate-45 -translate-y-2 bg-white" : navTransparent ? "bg-[#F5EDE0]" : "bg-[#3D1409]")} />
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
          className="w-full h-auto bg-linear-to-br from-[#F5EFE0] via-[#E8D5B7] to-[#DCC8A8] border-x-4 border-b-4 border-[#3D1409] rounded-b-2xl p-0 pb-6 pt-18 z-30"
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
                  {processPage(page, index, currentPath, true)}
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
                      <p className="text-sm font-bold text-[#3D1409] truncate">{authData.name}</p>
                      <p className="text-xs text-[#5C4A2F] truncate">{authData.email}</p>
                    </div>
                    <button
                      onClick={() => { setIsOpen(false); setProfileModalOpen(true); }}
                      className="btn-secondary inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-xs font-semibold text-[#3D1409] border-[#8B6F47]/60 shrink-0"
                      title="Edit profile"
                    >
                      <User className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <ul className="space-y-2">
                  <li className="w-full">
                    <button 
                      onClick={handleLogout}
                      className="btn-secondary inline-flex w-full items-center gap-3 px-5 py-4 rounded-lg justify-start text-[#3D1409]"
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
      <nav
        className={cn(
          "hidden md:block fixed top-0 left-0 right-0 backdrop-blur-md border-b-4 border-[#3D1409] shadow-xl z-50 transition-all duration-300"
        )}
        style={navTransparent ? { background: 'linear-gradient(to right, #5C1A1A, #7A2424)' } : undefined}
      >
        <div className="w-full px-3 md:px-4 xl:px-6">
          <div className="flex items-center h-14 gap-2 xl:gap-6">
            {/* Brand Logo */}
            <Link href="/" className="group flex items-center gap-2 xl:gap-3 shrink-0 transition-all duration-300 w-auto xl:w-64">
              <img src="/tbvWhite.svg" alt="TBV logo" className="w-12 h-12 object-contain shrink-0 transition-transform duration-300 group-hover:rotate-6" />
              <h1 className={cn("text-xl font-extrabold hidden xl:block transition-colors duration-300", navTransparent ? "text-[#F5EDE0]" : "text-[#3D1409]")} style={{ fontFamily: 'var(--font-archivo-black)' }}>Trailblazers' Vault</h1>
            </Link>
            
            {/* Navigation Links */}
            <ul className="flex gap-1.5 md:gap-2 xl:gap-3 items-center flex-1 justify-center">
              {navPages.map((page, index) => processPage(page, index, currentPath, false, undefined, navTransparent))}
            </ul>

            {/* Right side: Profile or Login */}
            <div className="shrink-0 w-auto xl:w-64 flex justify-end">
              {isLoggedIn && authData ? (
                <div className="relative" ref={dropdownRef}>
                  {/* Profile icon button */}
                  <button
                    onClick={() => setProfileDropdownOpen(v => !v)}
                    className={cn(
                      "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-2.5 font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group",
                      navTransparent
                        ? "border-2 border-[#F5EDE0]/50 bg-[#F5EDE0]/10 text-[#F5EDE0] backdrop-blur-sm shadow-md hover:bg-[#F5EDE0]/20 hover:border-[#F5EDE0]/75 hover:shadow-lg"
                        : "border-2 border-[#3D1409]/50 bg-[#5C1A1A]/10 text-[#3D1409] shadow-md hover:bg-[#5C1A1A]/20 hover:border-[#3D1409]/75 hover:shadow-lg"
                    )}
                  >
                    <User className="w-5 h-5 xl:block hidden group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm xl:text-base font-bold leading-none">{initials}</span>
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
                            <p className="text-sm font-bold text-[#3D1409] truncate">{authData.name}</p>
                            <p className="text-xs text-[#5C4A2F] truncate">{authData.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-2">
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
                <Link
                  href="/login"
                  className={cn(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-2.5 font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group",
                    navTransparent
                      ? "border-2 border-[#F5EDE0]/50 bg-[#F5EDE0]/10 text-[#F5EDE0] backdrop-blur-sm shadow-md hover:bg-[#F5EDE0]/20 hover:border-[#F5EDE0]/75 hover:shadow-lg"
                      : "border-2 border-[#3D1409]/50 bg-[#5C1A1A]/10 text-[#3D1409] shadow-md hover:bg-[#5C1A1A]/20 hover:border-[#3D1409]/75 hover:shadow-lg"
                  )}
                >
                  <LogIn className="w-5 h-5 xl:block hidden group-hover:scale-110 transition-transform duration-300" />
                  <span>Login</span>
                </Link>
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
          onDelete={handleProfileDelete}
        />
      )}

      {/* Logout success toast */}
      {showLogoutToast && (
        <div className="fixed top-16 md:top-18 left-1/2 -translate-x-1/2 z-9999 flex items-center gap-3 px-5 py-3.5 bg-[#F0F7EC] border-4 border-[#5C7A3B] rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 whitespace-nowrap" style={{ fontFamily: 'var(--font-archivo-black)' }}>
          <CheckCircle2 className="w-5 h-5 text-[#5C7A3B] shrink-0" />
          <p className="text-sm font-bold text-[#2D4A1A]">You have been successfully logged out.</p>
        </div>
      )}
    </div>
  );
}
