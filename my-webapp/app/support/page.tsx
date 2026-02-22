"use client";

import Link from "next/link";
import { LifeBuoy, Github, MessageCircle, HelpCircle, Send, RotateCcw, Mail, ExternalLink, Bug, Lightbulb, ChevronDown } from 'lucide-react';
import { useScrollReveal } from "@/app/hooks/useScrollReveal";

const quickLinks = [
  {
    id: "github",
    href: "https://github.com/ptradic",
    title: "GitHub Issues",
    desc: "Report bugs or request features",
    icon: Github,
    external: true,
  },
  {
    id: "faq",
    href: "/support/faq",
    title: "FAQ & Troubleshooting",
    desc: "Common questions and solutions",
    icon: HelpCircle,
    external: false,
  },
  {
    id: "discord",
    href: "#",
    title: "Community Discord",
    desc: "Chat with other users",
    icon: MessageCircle,
    external: true,
  },
];

export default function SupportPage() {
  const feedbackRef = useScrollReveal<HTMLElement>();
  const helpRef = useScrollReveal<HTMLElement>({ delay: 100 });

  return (
    <main className="flex min-h-screen flex-col items-center bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF] overflow-hidden">

      {/* Hero + Links — fills first viewport */}
      <section className="w-full max-w-5xl flex flex-col justify-center items-center min-h-screen px-4 sm:px-10 relative pb-32">
        {/* Hero */}
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-[#5C1A1A]/10 border-2 border-[#5C1A1A]/30 rounded-full fade-in-up delay-100">
            <span className="text-sm font-semibold text-[#5C1A1A] flex items-center gap-2">
              <LifeBuoy className="w-4 h-4" />
              We&apos;re Here to Help
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 sm:mb-10 text-[#3D1409] leading-tight fade-in-up delay-200" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            <span className="block sm:inline">Support &</span>{' '}
            <span className="block sm:inline">Feedback</span>
          </h1>

          {/* Link Buttons */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-3 sm:gap-4 mb-6 sm:mb-8 fade-in-up delay-300">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              const isInternal = !link.external && link.href !== "#";
              
              if (isInternal) {
                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    className="group inline-flex items-center gap-2 w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-[#F5EFE0] border-3 sm:border-4 border-[#8B6F47] hover:border-[#5C1A1A] shadow-md sm:shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 justify-center"
                  >
                    <Icon className="w-5 h-5 text-[#5C1A1A] group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-bold text-base sm:text-lg text-[#3D1409] group-hover:text-[#5C1A1A] transition-colors">
                      {link.title}
                    </span>
                    {link.external && <ExternalLink className="w-3 h-3 text-[#8B6F47]" />}
                  </Link>
                );
              }
              
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="group inline-flex items-center gap-2 w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-[#F5EFE0] border-3 sm:border-4 border-[#8B6F47] hover:border-[#5C1A1A] shadow-md sm:shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 justify-center"
                >
                  <Icon className="w-5 h-5 text-[#5C1A1A] group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-bold text-base sm:text-lg text-[#3D1409] group-hover:text-[#5C1A1A] transition-colors">
                    {link.title}
                  </span>
                  {link.external && <ExternalLink className="w-3 h-3 text-[#8B6F47]" />}
                </a>
              );
            })}
          </div>
          
          <p className="max-w-xs sm:max-w-2xl mx-auto text-sm sm:text-xl md:text-2xl text-[#5C4A2F] leading-relaxed fade-in-up delay-400">
            Report bugs, request features,<br className="sm:hidden" /> or find quick help resources<br className="sm:hidden" /> to get the most out of<br className="sm:hidden" /> Trailblazers&apos;&nbsp;Vault.
          </p>
        </div>

        {/* Scroll Indicator — pinned near bottom */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 fade-in delay-500">
          <span className="text-sm text-[#5C1A1A] font-medium">Scroll for more</span>
          <ChevronDown className="w-8 h-8 text-[#5C1A1A]" />
        </div>
      </section>

      {/* Below-the-fold content */}
      <div className="w-full max-w-5xl px-4 sm:px-10 mt-8">

        {/* Feedback Form Section */}
        <section ref={feedbackRef} className="scroll-reveal bg-[#F5EFE0] border-4 border-[#3D1409] rounded-2xl p-6 sm:p-10 shadow-2xl mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-linear-to-br from-[#5C1A1A] to-[#7A2424] rounded-xl flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D1409]">Send Feedback</h2>
          </div>

          <p className="text-[#5C4A2F] mb-6">
            Have a bug to report or a feature idea? Let us know below and we&apos;ll get back to you.
          </p>

          <form className="space-y-6">
            <div>
              <label className="block mb-2 text-[#3D1409] font-semibold">
                Feedback Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-4 rounded-xl border-3 border-[#8B6F47] bg-white/50 cursor-pointer hover:bg-white hover:border-[#5C1A1A] transition-all duration-300">
                  <input type="radio" name="type" value="bug" className="w-4 h-4 text-[#5C1A1A]" />
                  <Bug className="w-5 h-5 text-[#5C1A1A]" />
                  <span className="text-[#3D1409] font-medium">Bug Report</span>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl border-3 border-[#8B6F47] bg-white/50 cursor-pointer hover:bg-white hover:border-[#5C1A1A] transition-all duration-300">
                  <input type="radio" name="type" value="feature" className="w-4 h-4 text-[#5C1A1A]" />
                  <Lightbulb className="w-5 h-5 text-[#5C1A1A]" />
                  <span className="text-[#3D1409] font-medium">Feature Request</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-[#3D1409] font-semibold">
                Subject
              </label>
              <input 
                className="w-full px-4 py-3 border-3 border-[#8B6F47] rounded-xl bg-white/70 text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300" 
                placeholder="Brief summary of your feedback" 
              />
            </div>

            <div>
              <label className="block mb-2 text-[#3D1409] font-semibold">
                Details
              </label>
              <textarea 
                className="w-full px-4 py-3 border-3 border-[#8B6F47] rounded-xl bg-white/70 text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300" 
                rows={6} 
                placeholder="Describe the bug or feature request in detail. Include steps to reproduce if reporting a bug."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                type="submit" 
                className="group flex-1 px-6 py-3 rounded-xl bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 border-4 border-[#3D1409]"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                Send Feedback
              </button>
              <button 
                type="reset" 
                className="group px-6 py-3 rounded-xl bg-[#F5EFE0] hover:bg-white text-[#5C1A1A] font-bold shadow-md hover:shadow-lg transform hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 border-4 border-[#8B6F47] hover:border-[#5C1A1A]"
              >
                <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                Reset Form
              </button>
            </div>
          </form>
        </section>

        {/* Additional Help */}
        <section ref={helpRef} className="scroll-reveal bg-linear-to-br from-[#5C1A1A]/10 to-transparent border-4 border-[#8B6F47] rounded-2xl p-6 sm:p-8 mb-10">
          <h3 className="text-2xl font-bold mb-4 text-[#3D1409]">Need Immediate Help?</h3>
          <p className="text-[#5C4A2F] leading-relaxed mb-4">
            Check out our <a href="/guides" className="text-[#5C1A1A] font-semibold hover:underline">Guides & Tutorials</a> for step-by-step walkthroughs, or visit the <Link href="/support/faq" className="text-[#5C1A1A] font-semibold hover:underline">FAQ</Link> for answers to common questions.
          </p>
          <p className="text-sm text-[#5C4A2F]">
            Most issues can be resolved quickly by checking our documentation first.
          </p>
        </section>
      </div>
    </main>
  );
}