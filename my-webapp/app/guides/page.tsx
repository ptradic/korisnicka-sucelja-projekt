"use client";

import Link from "next/link";
import {
  ChevronDown,
  LogIn,
  UserPlus,
  Plus,
  Package,
  Users,
  Wand2,
  PenLine,
  MousePointer,
  Coins,
  Settings,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useScrollReveal } from "@/app/hooks/useScrollReveal";

/* ── Tutorial step data ─────────────────────────────────────────────── */
const steps = [
  {
    number: 1,
    title: "Create Your Account",
    icon: UserPlus,
    description:
      "Head to the Login page and create a new account. Pick a display name, enter your email and a password — you're ready to go.",
    details: [
      'Click "Login" in the navigation bar.',
      'Click "Sign up" to switch to account creation.',
      "Fill in your Profile Name, Email, and Password.",
      "Follow the guided hints as you fill each field.",
      'Hit "Create Account" – you\'re in!',
    ],
    tip: "Your profile name is your account identity. You'll choose a character name later when joining a vault.",
  },
  {
    number: 2,
    title: "Sign In (Email or Google)",
    icon: LogIn,
    description:
      "Log in with email/password or use Google sign-in. After login you'll be taken straight to your vault dashboard.",
    details: [
      "Use your email/password, or click Continue with Google.",
      "After successful login, you're automatically redirected to Vaults.",
      "Already signed in? The login page will forward you to Vaults automatically.",
    ],
    tip: "You can switch between Game Master and Player roles anytime from the Vaults page — no need to pick during signup.",
  },
  {
    number: 3,
    title: "Choose Your Role & Create a Vault",
    icon: Plus,
    description:
      "On the Vaults page, switch to the Game Master tab to create a campaign vault with a name, password, and optional description.",
    details: [
      'Switch to the "Game Master" tab at the top of the Vaults page.',
      'Click "Create New Campaign Vault".',
      "Set your campaign name and vault password.",
      "Optionally add a short campaign description.",
      'Click "Create Vault" and copy the 8-character invite code shown after creation.',
    ],
    tip: "Players need both the invite code and the vault password to join. You can switch between Player and Game Master tabs anytime.",
  },
  {
    number: 4,
    title: "Join a Campaign",
    icon: Users,
    description:
      "From either the Player or Game Master tab, join an existing vault using the invite code and password.",
    details: [
      'Click "Join Campaign Vault".',
      "Enter the 8-character invite code from the GM.",
      "Enter the campaign password.",
      "Choose your character name for this vault.",
      'Click "Join Campaign" to enter the party.',
    ],
    tip: "Your character name can be changed later inside that vault.",
  },
  {
    number: 5,
    title: "Meet the Vault Interface",
    icon: Users,
    description:
      "Your vault opens with a sidebar of party members and a shared-loot section. Select any player or Shared Loot to view their inventory.",
    details: [
      "The left sidebar shows all party member slots.",
      'A "Shared Loot" section holds items not yet distributed.',
      "Click a player to view and manage their personal inventory.",
      "The weight bar shows how close each player is to their carry limit.",
    ],
    tip: "On mobile, the sidebar appears as a horizontal scrollable bar at the top of the screen.",
  },
  {
    number: 6,
    title: "Add Items from 5.5e or Vault Pool",
    icon: Package,
    description:
      'Open Add Item, then search official 5.5e equipment or pick from your vault\'s custom item pool.',
    details: [
      'Select a player (or Shared Loot) and click "+ Add Item".',
      "In Add Items, choose between 5.5e items and custom items.",
      "Search by name (minimum 2 characters to search).",
      "Pick an item to add it instantly to the selected inventory.",
    ],
    tip: "You can add to a player inventory or to Shared Loot depending on what is selected.",
  },
  {
    number: 7,
    title: "Create Homebrew and Manage Pool",
    icon: PenLine,
    description:
      "Game Masters can create homebrew items, edit them later, and control which homebrew appears in the current vault.",
    details: [
      'In Add Item, switch to "Create Homebrew" to make a new item.',
      "Set name, category, rarity, quantity, value, weight, and attunement.",
      "Save it to your homebrew list.",
      "From Add Items, toggle which homebrew entries are enabled in this vault.",
      "Save Custom Item Pool to publish your selection to the campaign.",
    ],
    tip: "Homebrew is user-level, while the custom item pool is vault-level.",
  },
  {
    number: 8,
    title: "Edit, Stack, Remove, and Sell Items",
    icon: CheckCircle2,
    description:
      "Open item details to update quantity, notes, attunement state, and other fields. Matching items stack automatically on add. Use bulk select to remove or sell multiple items at once.",
    details: [
      "Click an item card to open details.",
      "Adjust fields like quantity, notes, and attunement state.",
      "Delete items you no longer need from the same modal.",
      "When adding the same item signature, quantity stacks instead of duplicating.",
      "Use the bulk-select button (checklist icon) to select multiple items, then choose Move, Remove, or Sell.",
      "Sell calculates earnings at 80% of item value by default — adjustable before confirming.",
    ],
    tip: "Use clear naming and notes so players can understand loot at a glance.",
  },
  {
    number: 9,
    title: "Track Coins and Carry Limit",
    icon: Coins,
    description:
      "Each player inventory supports coin tracking and max carry weight controls.",
    details: [
      "Use the coin controls to add or subtract PP, GP, SP, and CP.",
      "Edit carry limit to match character strength or house rules.",
      "Watch the weight bar to avoid over-encumbrance.",
      "Shared Loot does not use player coin/carry settings.",
    ],
    tip: "Negative values in the coin panel are useful for quick spending adjustments.",
  },
  {
    number: 10,
    title: "Move Items and Handle Transfer Requests",
    icon: MousePointer,
    description:
      "Drag and drop items between inventories. GM moves are immediate, while player-to-player moves create short transfer requests.",
    details: [
      "Click and hold an item card to start dragging.",
      "Drop onto another player or Shared Loot in the sidebar.",
      "If a player sends to another player, the recipient gets an accept/decline prompt.",
      "Requests expire quickly if not accepted, and senders can cancel pending ones.",
    ],
    tip: "Bulk-select and drag can move multiple item units in one action.",
  },
  {
    number: 11,
    title: "Use Vault and Profile Settings",
    icon: Settings,
    description:
      "Fine-tune your campaign and identity from settings modals in the app.",
    details: [
      "GM: open Vault Settings to rename vault, update password, and copy invite code.",
      "Player: change your character name and set an avatar image link for this vault from the sidebar.",
      "Any user: open Account Settings from navigation to update profile details.",
      "Switch between Player and Game Master using the tabs on the Vaults page.",
    ],
    tip: "Switching between Player and Game Master tabs on the Vaults page changes what actions are available to you.",
  },
];

/* ── Component ──────────────────────────────────────────────────────── */
export default function GuidesPage() {
  /* scroll-reveal refs – one per below-the-fold section */
  const stepRefs = [
    useScrollReveal<HTMLElement>({ delay: 0 }),
    useScrollReveal<HTMLElement>({ delay: 50 }),
    useScrollReveal<HTMLElement>({ delay: 0 }),
    useScrollReveal<HTMLElement>({ delay: 50 }),
    useScrollReveal<HTMLElement>({ delay: 0 }),
    useScrollReveal<HTMLElement>({ delay: 50 }),
    useScrollReveal<HTMLElement>({ delay: 0 }),
    useScrollReveal<HTMLElement>({ delay: 50 }),
    useScrollReveal<HTMLElement>({ delay: 0 }),
    useScrollReveal<HTMLElement>({ delay: 50 }),
    useScrollReveal<HTMLElement>({ delay: 0 }),
  ];
  const bonusRef = useScrollReveal<HTMLElement>({ delay: 100 });


  return (
    <main
      className="flex min-h-screen flex-col items-center overflow-hidden relative"
      style={{
        background: 'linear-gradient(to bottom, #3D1409 0%, #5C1A1A 40%, #7A2424 70%, #5C1A1A 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* SVG diamond pattern — covers full page like login */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' fill='%23F5EDE0' fill-opacity='0.04'/%3E%3C/svg%3E\")",
          backgroundSize: '40px 40px',
        }}
      />

      {/* ─── Hero — fills first viewport ─── */}
      <section className="w-full text-center flex flex-col justify-center items-center min-h-screen relative pb-32 z-10">
        <div className="w-full max-w-5xl px-4 sm:px-10 flex flex-col items-center">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 text-[#F5EDE0] leading-tight fade-in-up delay-200"
            style={{ fontFamily: "var(--font-archivo-black)" }}
          >
            <span className="block sm:inline">Getting</span>{" "}
            <span className="block sm:inline">Started</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#F5EDE0]/75 leading-relaxed mb-8 fade-in-up delay-300">
            From creating your account to managing your first vault — follow this guide and you&apos;ll be running campaigns like a seasoned Game Master in no time.
          </p>

        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-24 left-1/2 flex flex-col items-center gap-2 animate-gentle-bob">
          <span className="text-base text-[#F5EDE0]/70 font-bold">Scroll to begin</span>
          <ChevronDown className="w-9 h-9 text-[#F5EDE0]/70" strokeWidth={2.5} />
        </div>
      </section>

      {/* ─── Steps ─── */}
      <div className="relative z-10 w-full max-w-5xl px-4 sm:px-10 mt-8 space-y-10 mb-12">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <section
              key={step.number}
              ref={stepRefs[i]}
              className="scroll-reveal bg-[#F5EFE0] rounded-2xl p-6 sm:p-8 relative overflow-hidden"
              style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)' }}
            >
              {/* Step number accent */}
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-[#5C1A1A]/8 rounded-[58%_42%_60%_40%/45%_55%_45%_55%] rotate-12" />
              <div className="absolute top-3 right-3 w-14 sm:w-16 text-center text-[#5C1A1A]/15 text-4xl sm:text-5xl font-extrabold leading-none select-none" style={{ fontFamily: "var(--font-archivo-black)" }}>
                {step.number}
              </div>

              {/* Header */}
              <div className="flex items-center gap-4 mb-5 relative z-10">
                <div className="w-12 h-12 bg-linear-to-br from-[#5C1A1A] to-[#7A2424] rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#5C1A1A] uppercase tracking-wider">Step {step.number}</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3D1409] leading-tight">{step.title}</h2>
                </div>
              </div>

              {/* Description */}
              <p className="text-[#5C4A2F] leading-relaxed mb-5 text-base sm:text-lg">{step.description}</p>

              {/* Detail list */}
              <div className="space-y-2.5 mb-5">
                {step.details.map((detail, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#5C1A1A] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {j + 1}
                    </div>
                    <p className="text-[#3D1409] text-sm sm:text-base leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>

              {/* Tip box */}
              <div className="bg-[#5C1A1A]/8 border-2 border-[#8B6F47]/50 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#5C1A1A] shrink-0 mt-0.5" />
                <p className="text-sm text-[#5C4A2F] leading-relaxed">
                  <strong className="text-[#3D1409]">Tip:</strong> {step.tip}
                </p>
              </div>
            </section>
          );
        })}

        {/* ─── Bonus: 404 easter-egg link ─── */}
        <section
          ref={bonusRef}
          className="scroll-reveal bg-[#F5EFE0] rounded-2xl p-6 sm:p-10"
          style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-linear-to-br from-[#5C1A1A] to-[#7A2424] rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3D1409]">Bonus: The Secret Room</h2>
          </div>

          <p className="text-[#5C4A2F] leading-relaxed mb-4 text-base sm:text-lg">
            Every dungeon has a hidden chamber. What happens when an adventurer wanders off the map? Try visiting a page that doesn&apos;t exist and find out what awaits those who stray from the path.
          </p>

          <Link
            href="/the-secret-room-that-does-not-exist"
            className="btn-primary group gap-3"
          >
            <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            Enter the Unknown
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </section>
      </div>
    </main>
  );
}
