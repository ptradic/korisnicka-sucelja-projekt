"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
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
import { onAuthChange } from "@/src/firebaseService";

/* ── Tutorial step data ─────────────────────────────────────────────── */
const steps = [
  {
    number: 1,
    title: "Create Your Account",
    icon: UserPlus,
    description:
      "Head to the Sign-In page and create a new account. Pick a display name, enter your email and a password, then choose your role — Game Master or Player.",
    details: [
      'Click "Sign In" in the navigation bar.',
      'Switch to the "Create Account" tab.',
      "Fill in your Name, Email and Password.",
      'Select your role: Game Master (GM) or Player.',
      'Hit "Create Account" – you\'re in!',
    ],
    tip: "Game Masters can create vaults and manage items for the whole party. Players can view and interact with their own inventory.",
  },
  {
    number: 2,
    title: "Sign In (Email or Google)",
    icon: LogIn,
    description:
      "Log in with email/password or Google. If your account already exists, you\'ll be redirected to your vault dashboard.",
    details: [
      "Use your email/password, or click Google sign-in.",
      "After successful login, open Vaults from navigation.",
      "Your role (GM or Player) determines what actions you can perform.",
    ],
    tip: "Already signed in? Opening Login will forward you to Vaults automatically.",
  },
  {
    number: 3,
    title: "GM: Create a Vault",
    icon: Plus,
    description:
      "As a Game Master, create a campaign vault with a name, password, and optional description.",
    details: [
      'Click "Create New Campaign Vault".',
      "Set your campaign name and vault password.",
      "Optionally add a short campaign description.",
      'Click "Create Vault" to generate your campaign.',
      "Copy the 8-character invite code shown after creation.",
    ],
    tip: "Players need both the invite code and the vault password to join.",
  },
  {
    number: 4,
    title: "Player: Join a Campaign",
    icon: Users,
    description:
      "As a Player, join an existing vault using the GM\'s invite code and password.",
    details: [
      'Click "Join Campaign Vault".',
      "Enter the 8-character invite code.",
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
    title: "Add Items from 5e/5.5e or Vault Pool",
    icon: Package,
    description:
      'Open Add Item, then search official 5e/5.5e equipment or pick from your vault\'s custom item pool.',
    details: [
      'Select a player (or Shared Loot) and click "+ Add Item".',
      "In Add Items, choose between 5e/5.5e items and custom items.",
      "Search by name (minimum 2 characters for API search).",
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
    title: "Edit, Stack, and Remove Items",
    icon: CheckCircle2,
    description:
      "Open item details to update quantity, notes, attunement state, and other fields. Matching items stack automatically on add.",
    details: [
      "Click an item card to open details.",
      "Adjust fields like quantity, notes, and attunement state.",
      "Delete items you no longer need from the same modal.",
      "When adding the same item signature, quantity stacks instead of duplicating.",
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
      "Player: change your character name for this vault from the sidebar.",
      "Any user: open Account Settings from navigation to update profile details.",
      "Switch GM/Player role from account settings when needed.",
    ],
    tip: "Role changes update what actions are available the next time vault state refreshes.",
  },
];

/* ── Component ──────────────────────────────────────────────────────── */
export default function GuidesPage() {
  const [startNowHref, setStartNowHref] = useState("/login");

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setStartNowHref(firebaseUser ? "/vaults" : "/login");
    });

    return () => unsubscribe();
  }, []);

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
    <main className="flex min-h-screen flex-col items-center bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF] overflow-hidden">
      {/* ─── Hero — fills first viewport ─── */}
      <section className="w-full max-w-5xl text-center flex flex-col justify-center items-center min-h-screen px-4 sm:px-10 relative pb-32">
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 text-[#3D1409] leading-tight fade-in-up delay-200"
          style={{ fontFamily: "var(--font-archivo-black)" }}
        >
          <span className="block sm:inline">Getting</span>{" "}
          <span className="block sm:inline">Started</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#5C4A2F] leading-relaxed mb-8 fade-in-up delay-300">
          From creating your account to managing your first vault — follow this guide and you&apos;ll be running campaigns like a seasoned Game Master in no time.
        </p>

        {/* Quick-jump pills */}
        <div className="flex flex-wrap justify-center gap-3 fade-in-up delay-400">
          <Link
            href={startNowHref}
            className="btn-primary group"
          >
            <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            Start Now
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>

          <Link
            href="/support"
            className="btn-secondary group text-[#3D1409] font-bold"
          >
            Need Help?
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce fade-in delay-500">
          <span className="text-sm text-[#5C1A1A] font-medium">Scroll to begin</span>
          <ChevronDown className="w-8 h-8 text-[#5C1A1A]" />
        </div>
      </section>

      {/* ─── Steps ─── */}
      <div className="w-full max-w-5xl px-4 sm:px-10 mt-8 space-y-10 mb-12">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <section
              key={step.number}
              ref={stepRefs[i]}
              className="scroll-reveal bg-[#F5EFE0] border-4 border-[#8B6F47] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
            >
              {/* Step number accent */}
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-[#5C1A1A]/8 rounded-[58%_42%_60%_40%/45%_55%_45%_55%] rotate-12" />
              <div className="absolute top-3 right-3 w-14 sm:w-16 text-center text-[#5C1A1A]/18 text-4xl sm:text-5xl font-extrabold leading-none select-none" style={{ fontFamily: "var(--font-archivo-black)" }}>
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
              <div className="bg-linear-to-r from-[#5C1A1A]/8 to-transparent border-2 border-[#8B6F47]/50 rounded-xl p-4 flex items-start gap-3">
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
          className="scroll-reveal bg-[#F5EFE0] border-4 border-[#3D1409] rounded-2xl p-6 sm:p-10 shadow-2xl"
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
