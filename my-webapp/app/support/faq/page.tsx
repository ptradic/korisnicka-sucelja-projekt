"use client";

import Link from "next/link";
import { HelpCircle, ArrowLeft } from "lucide-react";
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
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-10 bg-gradient-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF]">
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
            Browse frequently asked questions organized by category. Can&apos;t find what you need?{" "}
            <Link href="/support" className="text-[#5C1A1A] font-semibold hover:underline">
              Send us feedback
            </Link>.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {faqCategories.map((category) => (
            <div
              key={category.title}
              className="bg-[#F5EFE0] border-4 border-[#8B6F47] rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-[#5C1A1A]/5 to-transparent border-b-2 border-[#D9C7AA]">
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
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#8B6F47] to-[#A0845A] flex items-center justify-center">
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
      </div>
    </main>
  );
}
