"use client";

import Link from "next/link";
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
    title: "Sign In to Your Account",
    icon: LogIn,
    description:
      "Once registered, sign in with your email and password. You'll be redirected to the home page where you can start managing vaults.",
    details: [
      "Enter the email and password you just created.",
      'Click "Sign In" to access your dashboard.',
      "You'll see the home page with a welcome message.",
    ],
    tip: "Your session is saved locally — you'll stay signed in until you log out.",
  },
  {
    number: 3,
    title: "Create Your First Vault",
    icon: Plus,
    description:
      "From the home page, open the Create Vault modal. Name your campaign, set the number of player slots, and bring your adventure to life.",
    details: [
      'Click the "Create New Vault" button on the home page.',
      "Give your campaign a memorable name (e.g., Curse of Strahd).",
      "Set the number of player slots (2–8 adventurers).",
      'Press "Create Vault" — your vault is ready!',
    ],
    tip: "You can always create additional vaults later. Each vault is an independent campaign with its own players and inventory.",
  },
  {
    number: 4,
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
    number: 5,
    title: "Add Items from the Template List",
    icon: Package,
    description:
      'As a Game Master, click "Add Item" in any inventory. Switch to the "Choose from List" tab to browse pre-built D&D items organized by category and rarity.',
    details: [
      'Select a player (or Shared Loot) and click "+ Add Item".',
      'The "Choose from List" tab shows all template items.',
      "Use the search bar and category pills to filter items.",
      "Click any item to instantly add it to the inventory.",
    ],
    tip: "Template items include classic D&D equipment — weapons, armor, potions, wondrous items, and more.",
  },
  {
    number: 6,
    title: "Create a Custom Item",
    icon: PenLine,
    description:
      'Switch to the "Create Custom" tab to design your own item from scratch. Set the name, description, category, rarity, weight, value, and whether it requires attunement.',
    details: [
      'In the Add Item modal, switch to the "Create Custom" tab.',
      "Fill in the Item Name (required), Description, Category and Rarity.",
      "Set the Weight (lbs) and optionally a gold-piece Value.",
      'Toggle "Requires Attunement" if applicable.',
      'Click "Create Item" to add it.',
    ],
    tip: "Custom items are perfect for homebrew gear, quest rewards, or anything not in the standard list.",
  },
  {
    number: 7,
    title: "Drag & Drop Between Inventories",
    icon: MousePointer,
    description:
      "Move items between players or to shared loot with drag and drop. Grab any item card and drop it onto another player in the sidebar to transfer it instantly.",
    details: [
      "Click and hold an item card to start dragging.",
      "Drag it onto a player slot in the sidebar.",
      "The target slot highlights when you hover over it.",
      "Release to complete the transfer.",
    ],
    tip: "Drag and drop works on desktop and mobile.",
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
  ];
  const bonusRef = useScrollReveal<HTMLElement>({ delay: 100 });

  return (
    <main className="flex min-h-screen flex-col items-center bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF] overflow-hidden">
      {/* ─── Hero — fills first viewport ─── */}
      <section className="w-full max-w-5xl text-center flex flex-col justify-center items-center min-h-screen px-4 sm:px-10 relative pb-32">
        <div className="inline-block mb-4 px-4 py-2 bg-[#5C1A1A]/10 border-2 border-[#5C1A1A]/30 rounded-full fade-in-up delay-100">
          <span className="text-sm font-semibold text-[#5C1A1A] flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Step-by-Step Tutorial
          </span>
        </div>

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
            href="/login"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 border-3 border-[#3D1409]"
          >
            <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            Start Now
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>

          <Link
            href="/support"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F5EFE0] border-3 border-[#8B6F47] hover:border-[#5C1A1A] text-[#3D1409] font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300"
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
              <div className="absolute -top-1 -right-1 w-20 h-20 bg-[#5C1A1A]/5 rounded-full" />
              <div className="absolute top-3 right-4 text-[#5C1A1A]/15 text-6xl font-extrabold select-none" style={{ fontFamily: "var(--font-archivo-black)" }}>
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
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 border-3 border-[#3D1409]"
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
