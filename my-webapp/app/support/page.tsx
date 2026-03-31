"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { Github, MessageCircle, HelpCircle, Send, RotateCcw, Mail, ExternalLink, Bug, Lightbulb, ChevronDown, Check } from 'lucide-react';
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
    href: "https://discord.gg/T2CzJqQSWQ",
    title: "Community Discord",
    desc: "Chat with other users",
    icon: MessageCircle,
    external: true,
  },
];

export default function SupportPage() {
  const feedbackRef = useScrollReveal<HTMLElement>();
  const helpRef = useScrollReveal<HTMLElement>({ delay: 100 });
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // Custom scrollbar state
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const isScrollDragging = useRef(false);
  const scrollDragStartY = useRef(0);
  const scrollDragStartTop = useRef(0);

  // Update custom scrollbar thumb position & size
  const updateScrollbar = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const hasScroll = scrollHeight > clientHeight + 1;
    setShowScrollbar(hasScroll);
    if (!hasScroll) {
      setThumbTop(0);
      setThumbHeight(0);
      return;
    }
    const trackH = Math.max(1, scrollTrackRef.current?.clientHeight ?? clientHeight);
    const ratio = clientHeight / scrollHeight;
    const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
    const maxTop = Math.max(0, trackH - tHeight);
    const tTop = maxTop * (scrollTop / Math.max(1, scrollHeight - clientHeight));
    setThumbHeight(tHeight);
    setThumbTop(tTop);
  }, []);

  // Listen for scroll, input, and resize on textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const handler = () => updateScrollbar();
    el.addEventListener('scroll', handler);
    el.addEventListener('input', handler);
    // Watch for size changes (from custom resize handle)
    const resizeObserver = new ResizeObserver(handler);
    resizeObserver.observe(el);
    // Initial check
    const timer = setTimeout(handler, 100);
    return () => {
      el.removeEventListener('scroll', handler);
      el.removeEventListener('input', handler);
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [updateScrollbar]);

  // Custom scrollbar thumb drag
  const handleScrollThumbDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isScrollDragging.current = true;
    scrollDragStartY.current = e.clientY;
    scrollDragStartTop.current = thumbTop;

    const handleMove = (ev: MouseEvent) => {
      if (!isScrollDragging.current || !textareaRef.current) return;
      const el = textareaRef.current;
      const trackH = Math.max(1, scrollTrackRef.current?.clientHeight ?? el.clientHeight);
      const delta = ev.clientY - scrollDragStartY.current;
      const ratio = el.clientHeight / el.scrollHeight;
      const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
      const maxTop = Math.max(0, trackH - tHeight);
      const newTop = Math.min(maxTop, Math.max(0, scrollDragStartTop.current + delta));
      const scrollRatio = maxTop > 0 ? newTop / maxTop : 0;
      el.scrollTop = scrollRatio * Math.max(0, el.scrollHeight - el.clientHeight);
    };

    const handleUp = () => {
      isScrollDragging.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [thumbTop]);

  // Click on track to jump scroll
  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (!scrollTrackRef.current || !textareaRef.current) return;
    const rect = scrollTrackRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const el = textareaRef.current;
    const trackH = Math.max(1, rect.height);
    const ratio = el.clientHeight / el.scrollHeight;
    const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
    const maxTop = Math.max(0, trackH - tHeight);
    const newTop = Math.min(maxTop, Math.max(0, clickY - tHeight / 2));
    const scrollRatio = maxTop > 0 ? newTop / maxTop : 0;
    el.scrollTop = scrollRatio * Math.max(0, el.scrollHeight - el.clientHeight);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startY.current = clientY;
    startHeight.current = textareaRef.current?.offsetHeight || 150;

    const handleMove = (ev: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !textareaRef.current) return;
      const currentY = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
      const delta = currentY - startY.current;
      const newHeight = Math.max(80, startHeight.current + delta);
      textareaRef.current.style.height = `${newHeight}px`;
      updateScrollbar();
    };

    const handleEnd = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
  }, [updateScrollbar]);

  return (
    <main
      className="flex min-h-screen flex-col items-center overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #3D1409 0vh, #5C1A1A 35vh, #7A2424 62vh, #C8A97A 85vh, #E8D5B7 100vh, #DCC8A8 140vh, #E0CFAF 200vh)',
      }}
    >
      {/* Hero + Links — fills first viewport */}
      <section className="w-full text-center flex flex-col justify-center items-center min-h-screen relative pb-32">
        {/* SVG diamond pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' fill='%23F5EDE0' fill-opacity='0.04'/%3E%3C/svg%3E\")",
            backgroundSize: '40px 40px',
          }}
        />
        <div className="w-full max-w-5xl px-4 sm:px-10 flex flex-col items-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-10 text-[#F5EDE0] leading-tight fade-in-up delay-200" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            <span className="block sm:inline">Support &</span>{' '}
            <span className="block sm:inline">Feedback</span>
          </h1>

          {/* Link Buttons */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 mb-8 fade-in-up delay-300">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              const linkClass = "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-[#F5EDE0]/50 bg-[#F5EDE0]/10 text-[#F5EDE0] font-semibold text-lg shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-[#F5EDE0]/20 hover:border-[#F5EDE0]/75 hover:-translate-y-0.5 active:scale-95 group";
              const content = (
                <>
                  <Icon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>{link.title}</span>
                  {link.external && <ExternalLink className="w-3 h-3 opacity-70" />}
                </>
              );
              if (!link.external) {
                return <Link key={link.id} href={link.href} className={linkClass}>{content}</Link>;
              }
              return (
                <a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {content}
                </a>
              );
            })}
          </div>

          <p className="text-xl sm:text-2xl text-[#F5EDE0]/75 font-medium fade-in-up delay-400">
            "Report bugs, request features, or find quick help resources."
          </p>
        </div>

        {/* Scroll Indicator — pinned near bottom */}
        <div className="absolute bottom-24 left-1/2 flex flex-col items-center gap-2 animate-gentle-bob">
          <span className="text-base text-[#F5EDE0]/70 font-bold">Scroll for more</span>
          <ChevronDown className="w-9 h-9 text-[#F5EDE0]/70" strokeWidth={2.5} />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFeedbackType("bug")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-3 cursor-pointer transition-all duration-300 ${
                    feedbackType === "bug"
                      ? "bg-linear-to-br from-[#5C1A1A] to-[#7A2424] border-[#3D1409] shadow-lg"
                      : "border-[#8B6F47] bg-white/50 hover:bg-white hover:border-[#5C1A1A]"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                    feedbackType === "bug"
                      ? "bg-white border-white"
                      : "border-[#8B6F47] bg-white/70"
                  }`}>
                    {feedbackType === "bug" && <Check className="w-3.5 h-3.5 text-[#5C1A1A]" strokeWidth={3} />}
                  </div>
                  <Bug className={`w-6 h-6 transition-colors ${feedbackType === "bug" ? "text-white" : "text-[#5C1A1A]"}`} />
                  <span className={`font-semibold transition-colors ${feedbackType === "bug" ? "text-white" : "text-[#3D1409]"}`}>Bug Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType("feature")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-3 cursor-pointer transition-all duration-300 ${
                    feedbackType === "feature"
                      ? "bg-linear-to-br from-[#5C1A1A] to-[#7A2424] border-[#3D1409] shadow-lg"
                      : "border-[#8B6F47] bg-white/50 hover:bg-white hover:border-[#5C1A1A]"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                    feedbackType === "feature"
                      ? "bg-white border-white"
                      : "border-[#8B6F47] bg-white/70"
                  }`}>
                    {feedbackType === "feature" && <Check className="w-3.5 h-3.5 text-[#5C1A1A]" strokeWidth={3} />}
                  </div>
                  <Lightbulb className={`w-6 h-6 transition-colors ${feedbackType === "feature" ? "text-white" : "text-[#5C1A1A]"}`} />
                  <span className={`font-semibold transition-colors ${feedbackType === "feature" ? "text-white" : "text-[#3D1409]"}`}>Feature Request</span>
                </button>
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
              <div className="relative">
                <div className="relative">
                  <textarea 
                    ref={textareaRef}
                    onInput={() => {
                      updateScrollbar();
                    }}
                    onKeyUp={() => {
                      updateScrollbar();
                    }}
                    className="w-full px-4 py-3 pr-8 border-3 border-[#8B6F47] rounded-xl bg-white/70 text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-[border-color,box-shadow] duration-300 custom-scrollbar resize-none" 
                    style={{ height: '150px' }}
                    placeholder="Describe the bug or feature request in detail. Include steps to reproduce if reporting a bug."
                  />
                  {/* Custom scrollbar overlay — thin rail + thick thumb */}
                  {showScrollbar && (
                    <div
                      ref={scrollTrackRef}
                      onClick={handleTrackClick}
                      className="hidden md:flex absolute top-2 right-1 bottom-3 w-3.5 items-stretch cursor-pointer"
                    >
                      {/* Thick draggable thumb */}
                      <div
                        onMouseDown={handleScrollThumbDown}
                        className="absolute left-1/2 -translate-x-1/2 w-2.5 rounded-full bg-[#8B6F47] hover:bg-[#5C1A1A] transition-colors duration-200 cursor-grab active:cursor-grabbing"
                        style={{
                          top: `${thumbTop}px`,
                          height: `${thumbHeight}px`,
                        }}
                      />
                    </div>
                  )}
                </div>
                {/* Custom resize handle — diagonal grip lines */}
                <div
                  onMouseDown={handleResizeStart}
                  onTouchStart={handleResizeStart}
                  className="flex items-center justify-center py-1 cursor-ns-resize select-none group/handle"
                >
                  <svg width="20" height="10" viewBox="0 0 20 10" className="text-[#8B6F47] group-hover/handle:text-[#5C1A1A] transition-colors duration-200">
                    <line x1="4" y1="2" x2="16" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="6" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                type="submit" 
                className="btn-primary group flex-1"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                Send Feedback
              </button>
              <button 
                type="button" 
                onClick={() => { setFeedbackType(null); if (textareaRef.current) { textareaRef.current.style.height = '150px'; } const form = document.querySelector('form'); form?.reset(); }}
                className="btn-secondary group text-[#5C1A1A] font-bold"
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