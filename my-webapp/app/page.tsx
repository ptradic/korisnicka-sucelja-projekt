"use client";

import { useRouter } from "next/navigation";
import { Package, BookOpen, ChevronRight, ChevronDown, Zap, GripVertical } from "lucide-react";
import { useScrollReveal } from "@/app/hooks/useScrollReveal";
import { auth } from "@/src/firebase";

export default function HomePage() {
  const router = useRouter();
  const featuresRef = useScrollReveal<HTMLElement>();
  const aboutRef = useScrollReveal<HTMLElement>({ delay: 100 });

  const handleManageVaults = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(auth.currentUser ? '/vaults' : '/login');
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #3D1409 0%, #5C1A1A 40%, #7A2424 70%, #5C1A1A 100%)' }}
    >

      {/* Hero Section */}
      <section
        className="w-full text-center flex flex-col justify-center items-center min-h-screen relative pb-32"
      >
        {/* SVG diamond pattern overlay — same as login page */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' fill='%23F5EDE0' fill-opacity='0.04'/%3E%3C/svg%3E\")",
            backgroundSize: '40px 40px',
          }}
        />
        <div className="w-full max-w-5xl px-4 sm:px-10 flex flex-col items-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-10 text-[#F5EDE0] leading-tight fade-in-up delay-200" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            <span className="block sm:inline">Trailblazers'</span>{' '}
            <span className="block sm:inline">Vault</span>
          </h1>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 fade-in-up delay-300">
            {/* Primary — cream solid, dark red text */}
            <button
              onClick={handleManageVaults}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-[#F5EDE0] bg-[#F5EDE0] text-[#3D1409] font-bold text-lg shadow-xl transition-all duration-300 hover:bg-white hover:border-white hover:shadow-2xl hover:-translate-y-1 active:scale-95 cursor-pointer group w-full sm:w-auto"
            >
              <Package className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              Manage Vaults
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            {/* Secondary — frosted outline */}
            <button
              onClick={(e) => {
                e.preventDefault();
                router.push(auth.currentUser ? '/vaults?tutorial=true' : '/login');
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-[#F5EDE0]/50 bg-[#F5EDE0]/10 text-[#F5EDE0] font-semibold text-lg shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-[#F5EDE0]/20 hover:border-[#F5EDE0]/75 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer group w-full sm:w-auto"
            >
              <Zap className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Quick Start
            </button>
          </div>

          <p className="text-xl sm:text-2xl text-[#F5EDE0]/75 font-medium fade-in-up delay-400">
            "Your party's loot, safely stashed."
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-24 left-1/2 flex flex-col items-center gap-2 animate-gentle-bob">
          <span className="text-base text-[#F5EDE0]/70 font-bold">Scroll for more</span>
          <ChevronDown className="w-9 h-9 text-[#F5EDE0]/70" strokeWidth={2.5} />
        </div>

      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="scroll-reveal w-full max-w-5xl mb-16 px-4 sm:px-10 mt-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-[#F5EDE0]" style={{ fontFamily: 'var(--font-archivo-black)' }}>Key Features</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="bg-[#5C1A1A]/60 backdrop-blur-sm border border-[#8B3030]/50 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#F5EDE0]/10 border-2 border-[#F5EDE0]/50 rounded-2xl flex items-center justify-center mb-4 shadow-md backdrop-blur-sm">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#F5EDE0] mb-3">
                Shared Inventories for Tabletop RPGs
              </h3>
              <p className="text-sm text-[#DCC8A8] leading-relaxed">
                Organize shared inventories for tabletop RPGs. Keep party inventories synchronized across players and campaigns.
              </p>
            </div>
          </div>

          <div className="bg-[#5C1A1A]/60 backdrop-blur-sm border border-[#8B3030]/50 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#F5EDE0]/10 border-2 border-[#F5EDE0]/50 rounded-2xl flex items-center justify-center mb-4 shadow-md backdrop-blur-sm">
                <GripVertical className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#F5EDE0] mb-3">
                Simple Drag-and-Drop Interface
              </h3>
              <p className="text-sm text-[#DCC8A8] leading-relaxed">
                Move, stack and sort items quickly with a simple drag-and-drop interface that makes inventory management effortless.
              </p>
            </div>
          </div>

          <div className="bg-[#5C1A1A]/60 backdrop-blur-sm border border-[#8B3030]/50 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#F5EDE0]/10 border-2 border-[#F5EDE0]/50 rounded-2xl flex items-center justify-center mb-4 shadow-md backdrop-blur-sm">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#F5EDE0] mb-3">
                Customizable Item Templates
              </h3>
              <p className="text-sm text-[#DCC8A8] leading-relaxed">
                Customizable item templates and tools built for players and Game Masters. Create and save your own item presets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="scroll-reveal w-full max-w-5xl mb-16 px-4 sm:px-10">
        <div className="bg-[#5C1A1A]/60 backdrop-blur-sm border border-[#8B3030]/50 rounded-2xl p-8 sm:p-12 shadow-lg">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8 text-[#F5EDE0] text-center" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            About the Project
          </h2>

          <section className="mb-8">
            <div className="space-y-4 text-[#DCC8A8] leading-relaxed">
              <p className="text-base">
                Trailblazers' Vault is built to solve the clutter and confusion that often come with managing items and loot in tabletop RPGs like 5.5e, especially when inventories are shared across multiple players or campaigns.
              </p>
              <p className="text-base">
                It's designed for TTRPG players and game masters who want an easier, more organized way to track and share their party's gear.
              </p>
              <p className="text-base">
                Trailblazers' Vault offers a streamlined inventory system that lets users manage, sort, and customize their loot through a simple interactive drag-and-drop interface.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold mb-3 text-[#F5EDE0]" style={{ fontFamily: 'var(--font-archivo-black)' }}>Why We Built It</h3>
            <p className="text-base text-[#DCC8A8] leading-relaxed">
              Born from experience at the table, we wanted a simple, reliable way to track and share gear so the game
              stays focused on play instead of spreadsheet management.
            </p>
          </section>
        </div>
      </section>

      <footer className="w-full max-w-5xl text-center py-10 px-4 flex flex-col items-center gap-4">
        <p className="text-base text-[#DCC8A8] font-medium">Born from play — designed to keep your sessions flowing.</p>
      </footer>
    </main>
  );
}
