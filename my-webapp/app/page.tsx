"use client";

import { Button } from "@/app/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import Link from "next/link";
import { Package, Wand2, BookOpen, ChevronRight, Sparkles, ChevronDown, Users, Archive, Download } from "lucide-react";
import { useScrollReveal } from "@/app/hooks/useScrollReveal";

export default function HomePage() {
  const featuresRef = useScrollReveal<HTMLElement>();
  const getStartedRef = useScrollReveal<HTMLElement>({ delay: 100 });
  const aboutRef = useScrollReveal<HTMLElement>({ delay: 200 });

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF] overflow-hidden">
      
      {/* Hero Section */}
      <section className="w-full max-w-5xl text-center flex flex-col justify-center items-center min-h-screen px-4 sm:px-10 relative pb-32">
        <div className="inline-block mb-4 px-4 py-2 bg-[#5C1A1A]/10 border-2 border-[#5C1A1A]/30 rounded-full fade-in-up delay-100">
          <span className="text-sm font-semibold text-[#5C1A1A] flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Your Ultimate RPG Inventory Manager
          </span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-10 text-[#3D1409] leading-tight fade-in-up delay-200" style={{ fontFamily: 'var(--font-archivo-black)' }}>
          <span className="block sm:inline">Trailblazers'</span>{' '}
          <span className="block sm:inline">Vault</span>
        </h1>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 fade-in-up delay-300">
          <Link href="/vaults" className="group">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 border-4 border-[#3D1409] flex items-center justify-center gap-2">
              <Package className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              Manage Vaults
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>
          
          <Link href="/gm-tools" className="group">
            <button className="w-full sm:w-auto px-8 py-4 bg-[#F5EFE0] hover:bg-white text-[#5C1A1A] font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 border-4 border-[#8B6F47] hover:border-[#5C1A1A] flex items-center justify-center gap-2">
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              GM Tools
            </button>
          </Link>
          
          <Link href="/guides" className="group">
            <button className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-[#F5EFE0]/50 text-[#5C1A1A] font-bold text-lg rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 active:scale-95 transition-all duration-300 border-4 border-[#8B6F47] hover:border-[#5C1A1A] flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Quick Start
            </button>
          </Link>
        </div>

        <p className="text-xl sm:text-2xl text-[#5C1A1A] font-medium fade-in-up delay-400">
          "Your party's loot, safely stashed."
        </p>

        {/* Scroll Indicator */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce fade-in delay-500">
          <span className="text-sm text-[#5C1A1A] font-medium">Scroll for more</span>
          <ChevronDown className="w-8 h-8 text-[#5C1A1A]" />
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="scroll-reveal w-full max-w-5xl mb-16 px-4 sm:px-10 mt-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-[#3D1409]" style={{ fontFamily: 'var(--font-archivo-black)' }}>Key Features</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8] rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8B6F47] to-[#A0845A] rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#3D1409] mb-3">
                Shared Inventories for Tabletop RPGs
              </h3>
              <p className="text-sm text-[#5C4A2F] leading-relaxed">
                Organize shared inventories for tabletop RPGs. Keep party inventories synchronized across players and campaigns.
              </p>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8] rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8B6F47] to-[#A0845A] rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#3D1409] mb-3">
                Simple Drag-and-Drop Interface
              </h3>
              <p className="text-sm text-[#5C4A2F] leading-relaxed">
                Move, stack and sort items quickly with a simple drag-and-drop interface that makes inventory management effortless.
              </p>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8] rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8B6F47] to-[#A0845A] rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#3D1409] mb-3">
                Customizable Item Templates
              </h3>
              <p className="text-sm text-[#5C4A2F] leading-relaxed">
                Customizable item templates and tools built for players and Game Masters. Create and save your own item presets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section ref={getStartedRef} className="scroll-reveal w-full max-w-5xl mb-16 px-4 sm:px-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-[#3D1409]" style={{ fontFamily: 'var(--font-archivo-black)' }}>Get Started</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Link href="/gm-tools" className="group">
            <div className="h-full bg-[#F5EFE0] border-4 border-[#8B6F47] hover:border-[#5C1A1A] rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8B6F47] to-[#A0845A] rounded-xl flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-[#5C1A1A] group-hover:translate-x-1 transition-transform duration-300 mt-1" />
              </div>
              <h3 className="text-lg font-bold text-[#3D1409] group-hover:text-[#5C1A1A] mb-2 transition-colors">
                Create a Campaign
              </h3>
              <p className="text-sm text-[#5C4A2F] leading-relaxed">
                Set up players, vaults and permissions in minutes.
              </p>
            </div>
          </Link>

          <Link href="/vaults" className="group">
            <div className="h-full bg-[#F5EFE0] border-4 border-[#8B6F47] hover:border-[#5C1A1A] rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8B6F47] to-[#A0845A] rounded-xl flex items-center justify-center shadow-md">
                  <Archive className="w-6 h-6 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-[#5C1A1A] group-hover:translate-x-1 transition-transform duration-300 mt-1" />
              </div>
              <h3 className="text-lg font-bold text-[#3D1409] group-hover:text-[#5C1A1A] mb-2 transition-colors">
                Manage Vaults
              </h3>
              <p className="text-sm text-[#5C4A2F] leading-relaxed">
                Create and manage your party's inventory vaults.
              </p>
            </div>
          </Link>

          <Link href="/gm-tools" className="group">
            <div className="h-full bg-[#F5EFE0] border-4 border-[#8B6F47] hover:border-[#5C1A1A] rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8B6F47] to-[#A0845A] rounded-xl flex items-center justify-center shadow-md">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-[#5C1A1A] group-hover:translate-x-1 transition-transform duration-300 mt-1" />
              </div>
              <h3 className="text-lg font-bold text-[#3D1409] group-hover:text-[#5C1A1A] mb-2 transition-colors">
                Import Templates
              </h3>
              <p className="text-sm text-[#5C4A2F] leading-relaxed">
                Browse the Vault Library and import templates into your campaigns.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="scroll-reveal w-full max-w-5xl mb-16 px-4 sm:px-10">
        <div className="bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8] rounded-2xl p-8 sm:p-12 shadow-lg">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8 text-[#3D1409] text-center" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            About the Project
          </h2>
          
          <section className="mb-8">
            <div className="space-y-4 text-[#5C4A2F] leading-relaxed">
              <p className="text-base">
                Trailblazers' Vault is built to solve the clutter and confusion that often come with managing items and loot in tabletop RPGs like D&D, especially when inventories are shared across multiple players or campaigns.
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
            <h3 className="text-2xl font-bold mb-3 text-[#3D1409]" style={{ fontFamily: 'var(--font-archivo-black)' }}>Why We Built It</h3>
            <p className="text-base text-[#5C4A2F] leading-relaxed">
              Born from experience at the table, we wanted a simple, reliable way to track and share gear so the game
              stays focused on play instead of spreadsheet management.
            </p>
          </section>
        </div>
      </section>

      <footer className="w-full max-w-5xl text-center py-8">
        <p className="text-base text-[#5C4A2F] font-medium">Born from play — designed to keep your sessions flowing.</p>
      </footer>
    </main>
  );
}
