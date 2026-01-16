"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/app/components/ui/sheet";
import { Menu, Scroll, Home, Wand2, BookOpen, HelpCircle, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

type Page = {
  title: string;
  path: `/${string}`;
  icon?: React.ComponentType<{ className?: string }>;
};

/**
 * pages is an array of objects representing the pages in the web app.
 * Each object contains a title and a path. This array is used to generate the navigation menu.
 *
 * We hardcode pages here, but in real app you want to store and read this information from some external source (e.g. CMS, DB, config file, etc).
 */
const pages: Page[] = [
  { title: "Home", path: "/", icon: Home },
  {
    title: "GM Tools",
    path: "/gm-tools",
    icon: Wand2,
  },
  {
    title: "Guides",
    path: "/guides",
    icon: BookOpen,
  },
  {
    title: "Support",
    path: "/support",
    icon: HelpCircle,
  },
  {
    title: "Login",
    path: "/login",
    icon: LogIn,
  },
];

/**
 * Render a page list item.
 * @param page - { title, path } for the page
 * @param index - array index used for key
 * @returns JSX element for a list item
 */
function processPage(page: Page, index: number, currentPath?: string, isMobile: boolean = false) {
  const isActive = page.path === "/" ? currentPath === page.path : currentPath?.startsWith(page.path);
  const Icon = page.icon;
  
  return (
    <li key={index} className={isMobile ? "w-full" : ""}>
      <Link 
        href={page.path} 
        className={cn(
          "inline-flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 font-semibold border-3 transform hover:-translate-y-0.5 active:scale-95 whitespace-nowrap",
          isMobile ? "w-full justify-start px-5 py-4" : "justify-center",
          isActive 
            ? "bg-gradient-to-r from-[#5C1A1A] to-[#7A2424] text-white border-[#3D1409] shadow-lg" 
            : "text-[#3D1409] bg-white/60 border-[#8B6F47] hover:bg-white hover:border-[#5C1A1A] hover:shadow-md"
        )}
      >
        {Icon && <Icon className="w-5 h-5" />}
        <span>{page.title}</span>
      </Link>
    </li>
  );
}

export function Navigation() {
  const currentPath = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#F5EFE0]/95 backdrop-blur-md border-b-4 border-[#3D1409] shadow-xl">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="group flex items-center gap-3 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#5C1A1A] to-[#7A2424] group-hover:from-[#4A1515] group-hover:to-[#5C1A1A] rounded-xl flex items-center justify-center border-4 border-[#3D1409] shadow-lg transition-all duration-300">
              <Scroll className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-extrabold text-[#3D1409]">Trailblazers' Vault</h1>
          </Link>
        </div>
      </div>

      {/* Hamburger Button - Fixed Above Everything */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "md:hidden w-12 h-12 flex flex-col items-center justify-center gap-1.5 rounded-lg transition-all duration-300",
          isOpen && "bg-white border-2 border-[#5C1A1A] shadow-md"
        )}
        style={{
          position: 'fixed',
          top: '12px',
          right: '16px',
          zIndex: 100
        }}
        aria-label="Toggle menu"
      >
        <span className={cn(
          "block w-7 h-1 bg-[#3D1409] rounded-full transition-all duration-300 ease-in-out",
          isOpen && "rotate-45 translate-y-2.5"
        )} />
        <span className={cn(
          "block w-7 h-1 bg-[#3D1409] rounded-full transition-all duration-300 ease-in-out",
          isOpen && "opacity-0"
        )} />
        <span className={cn(
          "block w-7 h-1 bg-[#3D1409] rounded-full transition-all duration-300 ease-in-out",
          isOpen && "-rotate-45 -translate-y-2.5"
        )} />
      </button>

      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="hidden">
          <button aria-label="Toggle menu" />
        </SheetTrigger>
        <SheetContent side="left" className="w-80 bg-gradient-to-br from-[#F5EFE0] via-[#E8D5B7] to-[#DCC8A8] border-r-4 border-[#3D1409] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#5C1A1A] to-[#7A2424] p-6 border-b-4 border-[#3D1409]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border-4 border-white/20 shadow-xl">
                <Scroll className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-extrabold">Trailblazers'</h2>
                <p className="text-white/80 text-sm font-semibold">Vault</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-6">
            <p className="text-xs font-bold text-[#5C4A2F] uppercase tracking-wider mb-4">Navigation</p>
            <ul className="space-y-2">
              {pages.map((page, index) => (
                <div key={index} onClick={() => setIsOpen(false)}>
                  {processPage(page, index, currentPath, true)}
                </div>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#DCC8A8]/50 to-transparent">
            <p className="text-xs text-[#5C4A2F] text-center">© 2026 Trailblazers' Vault</p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-[#F5EFE0]/95 backdrop-blur-md border-b-4 border-[#3D1409] shadow-xl z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-20 gap-8">
            {/* Brand Logo - Left */}
            <Link href="/" className="group flex items-center gap-3 flex-shrink-0 transition-all duration-300 w-64">
              <div className="w-14 h-14 bg-gradient-to-br from-[#5C1A1A] to-[#7A2424] group-hover:from-[#4A1515] group-hover:to-[#5C1A1A] rounded-2xl flex items-center justify-center border-4 border-[#3D1409] shadow-lg hover:rotate-6 transition-all duration-300">
                <Scroll className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#3D1409] hidden xl:block">Trailblazers' Vault</h1>
            </Link>
            
            {/* Navigation Links - Center */}
            <ul className="flex gap-3 items-center flex-1 justify-center">
              {pages.filter(page => page.path !== "/login").map((page, index) => processPage(page, index, currentPath, false))}
            </ul>

            {/* Login - Right */}
            <div className="flex-shrink-0 w-64 flex justify-end">
              <ul>
                {processPage(pages.find(page => page.path === "/login")!, pages.length - 1, currentPath, false)}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}