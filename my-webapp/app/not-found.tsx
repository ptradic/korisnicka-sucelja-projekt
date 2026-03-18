"use client";

import Link from "next/link";
import { Home, ChevronRight, Sparkles } from "lucide-react";
import { GiDiceTwentyFacesTwenty } from "react-icons/gi";

export default function NotFound() {
  return (
    <main className="h-screen flex flex-col items-center justify-center bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF] overflow-hidden px-4 py-4">
      
      {/* Content container - vertically centered */}
      <section className="w-full max-w-lg text-center flex flex-col items-center">
        
        {/* Badge - like home page */}
        <div className="inline-block mb-2 sm:mb-3 px-3 py-1.5 bg-[#5C1A1A]/10 border-2 border-[#5C1A1A]/30 rounded-full">
          <span className="text-xs sm:text-sm font-semibold text-[#5C1A1A] flex items-center gap-2">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Oops! Page Not Found
          </span>
        </div>

        {/* 404 with D20 inline */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-4">
          <h1 
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#3D1409] leading-none"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            4
          </h1>
          
          {/* D20 Dice showing Nat 20 */}
          <div className="relative group">
            <GiDiceTwentyFacesTwenty 
              className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 text-[#5C1A1A] drop-shadow-xl transform group-hover:rotate-12 transition-transform duration-500"
              aria-label="D20 dice showing natural 20"
            />
          </div>
          
          <h1 
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#3D1409] leading-none"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            4
          </h1>
        </div>

        {/* Page Not Found subtitle */}
        <h2 
          className="text-lg sm:text-xl font-bold text-[#5C1A1A] mb-3 sm:mb-4"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          Page Not Found
        </h2>

        {/* Funny 5e or 5.5e message - with About Us style background */}
        <div className="bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8] rounded-2xl p-4 sm:p-6 shadow-lg w-full mb-4 sm:mb-6">
          <p className="text-[#3D1409] text-sm sm:text-base mb-1" style={{ fontFamily: 'var(--font-averia)' }}>
            The page you're looking for rolled a <strong>Nat 20</strong> on its Stealth check.
          </p>
          <p className="text-[#8B6F47] text-xs sm:text-sm" style={{ fontFamily: 'var(--font-averia)' }}>
            It's so well hidden, even the Game Master can't find it!
          </p>
        </div>

        {/* Action Buttons - matching home page style */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 w-full mb-3 sm:mb-4">
          <Link href="/" className="btn-primary group flex-1 sm:flex-none w-full sm:w-auto text-sm sm:text-base">
            <Home className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            Return to Home
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="btn-secondary group w-full sm:w-auto text-sm sm:text-base text-[#5C1A1A] font-bold"
          >
            Go Back
          </button>
        </div>

        {/* Footer joke */}
        <p className="text-xs sm:text-sm text-[#8B6F47]/70 italic" style={{ fontFamily: 'var(--font-averia)' }}>
          "I swear I put that page right here..." — Every GM ever
        </p>
      </section>
    </main>
  );
}
