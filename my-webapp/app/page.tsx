import { Button } from "@/app/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import Link from "next/link";
import { Package, Wand2, BookOpen, ChevronRight, Sparkles } from "lucide-react";

export const dynamic = 'force-static';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-10 bg-gradient-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF] overflow-hidden">
      
      {/* Hero Section */}
      <section className="w-full max-w-5xl text-center mb-16 pt-8">
        <div className="inline-block mb-4 px-4 py-2 bg-[#5C1A1A]/10 border-2 border-[#5C1A1A]/30 rounded-full">
          <span className="text-sm font-semibold text-[#5C1A1A] flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Your Ultimate RPG Inventory Manager
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 text-[#3D1409]">
          Trailblazers' Vault
        </h1>
        
        <p className="text-xl sm:text-2xl text-[#5C1A1A] mb-4 font-medium">
          "Your party's loot, safely stashed."
        </p>

        <p className="max-w-3xl mx-auto text-base sm:text-lg text-[#5C4A2F] mb-10 leading-relaxed">
          Organize shared inventories for tabletop RPGs with a simple drag-and-drop interface,
          customizable item templates, and tools built for players and Game Masters.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <Link href="/vaults" className="group">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 border-4 border-[#3D1409] flex items-center justify-center gap-2">
              <Package className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              Manage Vaults
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>
          
          <Link href="/dm-tools" className="group">
            <button className="w-full sm:w-auto px-8 py-4 bg-[#F5EFE0] hover:bg-white text-[#5C1A1A] font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 border-4 border-[#8B6F47] hover:border-[#5C1A1A] flex items-center justify-center gap-2">
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              DM Tools
            </button>
          </Link>
          
          <Link href="/guides" className="group">
            <button className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-[#F5EFE0]/50 text-[#5C1A1A] font-bold text-lg rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 active:scale-95 transition-all duration-300 border-4 border-[#8B6F47] hover:border-[#5C1A1A] flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Quick Start
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-[#3D1409]">Key Features</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8] rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8B6F47] to-[#A0845A] rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#3D1409] mb-3">
                Shared Vaults
              </h3>
              <p className="text-sm text-[#5C4A2F] leading-relaxed">
                Keep party inventories synchronized across players and campaigns with real-time updates.
              </p>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8] rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8B6F47] to-[#A0845A] rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#3D1409] mb-3">
                Drag & Drop
              </h3>
              <p className="text-sm text-[#5C4A2F] leading-relaxed">
                Move, stack and sort items quickly with an intuitive drag-and-drop interface.
              </p>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8] rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8B6F47] to-[#A0845A] rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#3D1409] mb-3">
                Library & Templates
              </h3>
              <p className="text-sm text-[#5C4A2F] leading-relaxed">
                Import community templates or save your own item presets for quick access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="w-full max-w-5xl mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-[#3D1409]">Get Started</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Link href="/dm-tools" className="group block">
            <Card className="h-full hover:shadow-2xl hover:scale-105 transition-all duration-300 border-4 border-[#8B6F47] hover:border-[#5C1A1A] bg-[#F5EFE0] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5C1A1A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg font-bold text-[#3D1409] group-hover:text-[#5C1A1A] transition-colors">
                    Create a Campaign
                  </CardTitle>
                  <ChevronRight className="w-5 h-5 text-[#5C1A1A] group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                <CardDescription className="text-base">
                  Set up players, vaults and permissions in minutes.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/vaults" className="group block">
            <Card className="h-full hover:shadow-2xl hover:scale-105 active:scale-100 transition-all duration-300 border-4 border-[#8B6F47] hover:border-[#5C1A1A] bg-[#F5EFE0] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5C1A1A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg font-bold text-[#3D1409] group-hover:text-[#5C1A1A] transition-colors">
                    Manage Vaults
                  </CardTitle>
                  <ChevronRight className="w-5 h-5 text-[#5C1A1A] group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                <CardDescription className="text-base">
                  Create and manage your party's inventory vaults.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dm-tools" className="group block">
            <Card className="h-full hover:shadow-2xl hover:scale-105 active:scale-100 transition-all duration-300 border-4 border-[#8B6F47] hover:border-[#5C1A1A] bg-[#F5EFE0] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5C1A1A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg font-bold text-[#3D1409] group-hover:text-[#5C1A1A] transition-colors">
                    Import Templates
                  </CardTitle>
                  <ChevronRight className="w-5 h-5 text-[#5C1A1A] group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                <CardDescription className="text-base">
                  Browse the Vault Library and import templates into your campaigns.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="w-full max-w-4xl mb-16 bg-[#F5EFE0] border-4 border-[#3D1409] rounded-2xl p-8 sm:p-12 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-8 text-[#3D1409] text-center">
          About the Project
        </h2>
        
        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-4 text-[#3D1409] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#5C1A1A]" />
            What it does
          </h3>
          <ul className="space-y-3 text-[#5C4A2F]">
            <li className="flex items-start gap-3 group">
              <div className="w-2 h-2 bg-[#5C1A1A] rounded-full mt-2 group-hover:scale-150 transition-transform duration-300"></div>
              <span className="text-base">Streamlined party and campaign inventory management</span>
            </li>
            <li className="flex items-start gap-3 group">
              <div className="w-2 h-2 bg-[#5C1A1A] rounded-full mt-2 group-hover:scale-150 transition-transform duration-300"></div>
              <span className="text-base">Drag-and-drop item organization and sorting</span>
            </li>
            <li className="flex items-start gap-3 group">
              <div className="w-2 h-2 bg-[#5C1A1A] rounded-full mt-2 group-hover:scale-150 transition-transform duration-300"></div>
              <span className="text-base">Shared vaults so players and GMs stay in sync</span>
            </li>
            <li className="flex items-start gap-3 group">
              <div className="w-2 h-2 bg-[#5C1A1A] rounded-full mt-2 group-hover:scale-150 transition-transform duration-300"></div>
              <span className="text-base">Import/export and template item library</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-6 text-[#3D1409]">Quick Links</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <a href="/guides" className="group block p-6 rounded-xl bg-white/50 border-4 border-[#8B6F47] hover:border-[#5C1A1A] hover:bg-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <h4 className="font-bold text-lg text-[#3D1409] mb-2 group-hover:text-[#5C1A1A] flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Guides & Tutorials
              </h4>
              <p className="text-sm text-[#5C4A2F]">Onboarding, drag-and-drop walkthroughs, and usage tips.</p>
            </a>
            
            <a href="/vaults" className="group block p-6 rounded-xl bg-white/50 border-4 border-[#8B6F47] hover:border-[#5C1A1A] hover:bg-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <h4 className="font-bold text-lg text-[#3D1409] mb-2 group-hover:text-[#5C1A1A] flex items-center gap-2">
                <Package className="w-5 h-5" />
                Vaults
              </h4>
              <p className="text-sm text-[#5C4A2F]">Create and manage your party's inventory vaults.</p>
            </a>
            
            <a href="/dm-tools" className="group block p-6 rounded-xl bg-white/50 border-4 border-[#8B6F47] hover:border-[#5C1A1A] hover:bg-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <h4 className="font-bold text-lg text-[#3D1409] mb-2 group-hover:text-[#5C1A1A] flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Library
              </h4>
              <p className="text-sm text-[#5C4A2F]">Shared item templates and community catalog.</p>
            </a>
            
            <a href="/support" className="group block p-6 rounded-xl bg-white/50 border-4 border-[#8B6F47] hover:border-[#5C1A1A] hover:bg-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <h4 className="font-bold text-lg text-[#3D1409] mb-2 group-hover:text-[#5C1A1A] flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Support
              </h4>
              <p className="text-sm text-[#5C4A2F]">Report bugs, request features, or find help.</p>
            </a>
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#5C1A1A]/10 to-transparent border-4 border-[#8B6F47] rounded-xl p-6">
          <h3 className="text-2xl font-bold mb-3 text-[#3D1409]">Why We Built It</h3>
          <p className="text-base text-[#5C4A2F] leading-relaxed">
            Born from experience at the table, we wanted a simple, reliable way to track and share gear so the game
            stays focused on play instead of spreadsheet management.
          </p>
        </section>
      </section>

      <footer className="w-full max-w-5xl text-center py-8">
        <p className="text-base text-[#5C4A2F] font-medium">Born from play — designed to keep your sessions flowing.</p>
      </footer>
    </main>
  );
}
