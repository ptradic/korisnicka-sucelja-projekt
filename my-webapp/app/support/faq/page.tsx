"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HelpCircle, ArrowLeft, Send, CheckCircle2, LogIn, X, MessageCircle } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/app/components/ui/accordion";

/* ─── FAQ Data ─── */
const faqCategories = [
  {
    title: "Getting Started",
    items: [
      {
        question: "How do I create my first vault?",
        answer: "After signing up and logging in, click the \"Manage Vaults\" button on the homepage. From there, hit \"Create New Vault,\" give it a name, and you're ready to start adding items!",
        author: "TrailblazerTina",
      },
      {
        question: "What's the difference between a Game Master and a Player account?",
        answer: "Game Masters have full control over vaults — they can create, edit, and delete items, as well as manage player access. Players can view and interact with shared vaults but have limited editing permissions depending on the GM's settings.",
        author: "DungeonDave42",
      },
      {
        question: "Can I change my role after signing up?",
        answer: "Yes! Go to your profile settings by clicking your profile icon in the navigation bar, then open Account Settings. You can update your role from there at any time.",
        author: "RogueRunner",
      },
    ],
  },
  {
    title: "Inventory & Items",
    items: [
      {
        question: "How do I add items to my vault?",
        answer: "Open a vault, then click the \"Add Item\" button. Fill in the item name, quantity, description, and any custom fields. The item will appear in your vault immediately.",
        author: "LootLover99",
      },
      {
        question: "Is there a limit to how many items I can store?",
        answer: "Currently there's no hard limit on the number of items per vault. However, for best performance we recommend keeping individual vaults under 200 items and creating additional vaults for larger campaigns.",
        author: "PackratPaladin",
      },
      {
        question: "Can multiple players edit the same vault at the same time?",
        answer: "Right now, vault data is stored locally in your browser. Shared/multiplayer vault editing is planned for a future update — stay tuned!",
        author: "CoOpCrusader",
      },
    ],
  },
  {
    title: "Account & Settings",
    items: [
      {
        question: "I forgot my password — how do I reset it?",
        answer: "Since accounts are stored locally in your browser, there's no email-based password recovery yet. If you've lost your password, you can clear your browser's local storage and create a new account. Cloud-based accounts with proper recovery are on the roadmap.",
        author: "ForgetfulFighter",
      },
      {
        question: "How do I change my display name or email?",
        answer: "Click your profile icon in the top-right corner of the navigation, then select \"Account Settings.\" From there you can update your name, email, and password.",
        author: "NameChanger",
      },
      {
        question: "Will my data be saved if I clear my browser?",
        answer: "Currently all data is stored in your browser's localStorage. Clearing your browser data will remove your account and vault information. We recommend exporting important data. Cloud sync is planned for the future.",
        author: "CautiousCleric",
      },
    ],
  },
  {
    title: "Troubleshooting",
    items: [
      {
        question: "The page won't load or looks broken — what should I do?",
        answer: "Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R). If the issue persists, clear your browser cache and reload. Make sure you're using a modern browser like Chrome, Firefox, or Edge.",
        author: "TechTroubadour",
      },
      {
        question: "My items disappeared after refreshing — is this a bug?",
        answer: "This can happen if your browser's localStorage was cleared by an extension, privacy setting, or incognito mode. Make sure you're not in a private browsing window, and check that no cleanup extensions are removing site data.",
        author: "VanishingVault",
      },
      {
        question: "I found a bug — where do I report it?",
        answer: "You can use the feedback form on the Support page to submit a bug report, or open an issue on our GitHub repository. Please include steps to reproduce the bug and your browser/OS info — it helps us fix things faster!",
        author: "BugHunterBard",
      },
    ],
  },
];

export default function FaqPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Check auth on mount
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    try {
      const auth = localStorage.getItem("trailblazers-auth");
      if (auth) {
        const parsed = JSON.parse(auth);
        if (parsed.isLoggedIn) {
          setIsLoggedIn(true);
          setUserEmail(parsed.email || "");
        }
      }
    } catch { /* ignore */ }
  }, []);

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    // "Send" the question (frontend only for now)
    setShowSuccess(true);
    setQuestion("");
    // Auto-hide success after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-10 bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF]">
      <div className="max-w-5xl w-full">
        {/* Back Button */}
        <Link
          href="/support"
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-xl bg-[#F5EFE0] border-3 border-[#8B6F47] hover:border-[#5C1A1A] text-[#3D1409] font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Support
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-[#5C1A1A]/10 border-2 border-[#5C1A1A]/30 rounded-full">
            <span className="text-sm font-semibold text-[#5C1A1A] flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Answers from the community &amp; the team
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-[#3D1409]"
            style={{ fontFamily: "var(--font-archivo-black)" }}
          >
            FAQ
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#5C4A2F] leading-relaxed">
            Browse frequently asked questions organized by category. Can&apos;t find what you need? Ask below and we&apos;ll get back to you.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {faqCategories.map((category) => (
            <div
              key={category.title}
              className="bg-[#F5EFE0] border-4 border-[#8B6F47] rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="px-6 py-4 bg-linear-to-r from-[#5C1A1A]/5 to-transparent border-b-2 border-[#D9C7AA]">
                <h3 className="text-lg font-bold text-[#3D1409]">{category.title}</h3>
              </div>

              <Accordion type="multiple" className="px-6">
                {category.items.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`${category.title}-${idx}`}
                    className="border-[#D9C7AA]"
                  >
                    <AccordionTrigger className="text-[#3D1409] font-semibold text-sm sm:text-base hover:no-underline hover:text-[#5C1A1A] py-4 gap-3">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8] rounded-xl p-4">
                        <p className="text-sm text-[#5C4A2F] leading-relaxed mb-3">
                          {item.answer}
                        </p>
                        <div className="flex items-center gap-2 pt-2 border-t border-[#DCC8A8]">
                          <div className="w-6 h-6 rounded-lg bg-linear-to-br from-[#8B6F47] to-[#A0845A] flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white leading-none">
                              {item.author.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-[#8B6F47]">
                            {item.author}
                          </span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Ask a Question Section */}
        <div className="mt-10 bg-[#F5EFE0] border-4 border-[#3D1409] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-linear-to-br from-[#5C1A1A] to-[#7A2424] rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#3D1409]">Can&apos;t find your answer?</h3>
          </div>
          <p className="text-[#5C4A2F] text-sm sm:text-base mb-5">
            Ask your question below and we&apos;ll send the answer to your email. Once answered, it may also appear here for others.
          </p>
          <form onSubmit={handleSubmitQuestion} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 px-4 py-3 border-3 border-[#8B6F47] rounded-xl bg-white/70 text-[#3D1409] placeholder:text-[#8B6F47]/60 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
              placeholder="Type your question here..."
              required
            />
            <button
              type="submit"
              className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border-4 border-[#3D1409]"
            >
              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#F5EFE0] border-4 border-[#3D1409] rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-3 right-3 p-1 rounded-lg text-[#8B6F47] hover:text-[#5C1A1A] hover:bg-[#5C1A1A]/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 bg-[#5C1A1A]/10 border-3 border-[#5C1A1A]/30 rounded-full flex items-center justify-center">
                <LogIn className="w-7 h-7 text-[#5C1A1A]" />
              </div>
              <h3 className="text-xl font-extrabold text-[#3D1409]">Login Required</h3>
              <p className="text-sm text-[#5C4A2F] leading-relaxed">
                You need to be logged in so we can send the answer to your email. Please log in or create an account first.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                <button
                  onClick={() => router.push("/login")}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border-4 border-[#3D1409]"
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 px-5 py-3 rounded-xl bg-white/60 hover:bg-white border-3 border-[#8B6F47] hover:border-[#5C1A1A] text-[#3D1409] font-semibold transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom fade-in duration-300">
          <div className="flex items-center gap-3 px-5 py-4 bg-[#F5EFE0] border-4 border-[#3D1409] rounded-2xl shadow-2xl max-w-md">
            <div className="w-10 h-10 bg-green-100 border-3 border-green-300 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-[#3D1409] text-sm">Question submitted!</p>
              <p className="text-xs text-[#5C4A2F] mt-0.5">
                We&apos;ll send the answer to <span className="font-semibold">{userEmail}</span> once it&apos;s ready.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-2 p-1 rounded-lg text-[#8B6F47] hover:text-[#5C1A1A] hover:bg-[#5C1A1A]/10 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
