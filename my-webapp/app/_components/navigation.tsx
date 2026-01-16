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
        {Icon && <Icon className={cn("w-5 h-5", !isMobile && "xl:block hidden")} />}
        <span>{page.title}</span>
      </Link>
    </li>
  );
}

export function Navigation() {
  const currentPath = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  console.log('Navigation isOpen:', isOpen); // Debug

  return (
    <div>
      {/* Mobile Header */}
      <div 
        className="md:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b-4 border-[#3D1409] shadow-xl"
        style={{
          background: isOpen 
            ? 'linear-gradient(to right, #5C1A1A, #7A2424)' 
            : 'rgba(245, 239, 224, 0.95)',
          transition: 'background 0.3s ease-in-out'
        }}
      >
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="group flex items-center gap-4 transition-all duration-300">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center border-4 shadow-lg"
              style={{
                background: isOpen 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'linear-gradient(to bottom right, #5C1A1A, #7A2424)',
                borderColor: isOpen ? 'rgba(255, 255, 255, 0.2)' : '#3D1409',
                backdropFilter: isOpen ? 'blur(4px)' : 'none',
                transition: 'all 0.4s ease-in-out'
              }}
            >
              <Scroll className="w-6 h-6 text-white" />
            </div>
            <h1 
              className="text-xl font-extrabold"
              style={{ 
                fontFamily: 'var(--font-archivo-black)',
                color: isOpen ? '#ffffff' : '#3D1409',
                transition: 'color 0.4s ease-in-out'
              }}
            >
              Trailblazers' Vault
            </h1>
          </Link>
          
          {/* Hamburger Button with X Animation - Always on Top */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsOpen(prev => !prev);
            }}
            className="w-12 h-12 flex flex-col items-center justify-center gap-1.5 rounded-lg fixed top-4 right-4 z-[100]"
            style={{
              background: isOpen 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'transparent',
              backdropFilter: isOpen ? 'blur(4px)' : 'none',
              boxShadow: isOpen 
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)' 
                : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.4s ease-in-out'
            }}
            aria-label="Toggle menu"
          >
            <span className={cn(
              "block w-7 h-1 rounded-full transition-all duration-300 ease-in-out",
              isOpen ? "rotate-45 translate-y-2.5 bg-white" : "bg-[#3D1409]"
            )} />
            <span className={cn(
              "block w-7 h-1 rounded-full transition-all duration-300 ease-in-out",
              isOpen ? "opacity-0 bg-white" : "bg-[#3D1409]"
            )} />
            <span className={cn(
              "block w-7 h-1 rounded-full transition-all duration-300 ease-in-out",
              isOpen ? "-rotate-45 -translate-y-2.5 bg-white" : "bg-[#3D1409]"
            )} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-20 pt-24"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          style={{ top: '0', pointerEvents: 'auto' }}
        />
      )}
      
      <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <SheetTrigger asChild className="hidden">
          <button aria-label="Toggle menu" />
        </SheetTrigger>
        <SheetContent 
          side="top" 
          className="w-full h-auto bg-gradient-to-br from-[#F5EFE0] via-[#E8D5B7] to-[#DCC8A8] border-none p-0 pb-6 pt-24 z-30"
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>

          {/* Navigation */}
          <nav className="px-6">
            <p className="text-xs font-bold text-[#5C4A2F] uppercase tracking-wider mb-4">Navigation</p>
            <ul className="space-y-2">
              {pages.map((page, index) => (
                <div key={index} onClick={() => setIsOpen(false)}>
                  {processPage(page, index, currentPath, true)}
                </div>
              ))}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-[#F5EFE0]/95 backdrop-blur-md border-b-4 border-[#3D1409] shadow-xl z-50">
        <div className="max-w-7xl mx-auto px-3 md:px-4 xl:px-6">
          <div className="flex items-center h-20 gap-2 xl:gap-6">
            {/* Brand Logo - Left */}
            <Link href="/" className="group flex items-center gap-2 xl:gap-3 flex-shrink-0 transition-all duration-300 w-auto xl:w-64">
              <div className="w-12 h-12 xl:w-14 xl:h-14 flex-shrink-0 aspect-square bg-gradient-to-br from-[#5C1A1A] to-[#7A2424] group-hover:from-[#4A1515] group-hover:to-[#5C1A1A] rounded-2xl flex items-center justify-center border-4 border-[#3D1409] shadow-lg hover:rotate-6 transition-all duration-300">
                <Scroll className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#3D1409] hidden xl:block" style={{ fontFamily: 'var(--font-archivo-black)' }}>Trailblazers' Vault</h1>
            </Link>
            
            {/* Navigation Links - Center */}
            <ul className="flex gap-1.5 md:gap-2 xl:gap-3 items-center flex-1 justify-center">
              {pages.filter(page => page.path !== "/login").map((page, index) => processPage(page, index, currentPath, false))}
            </ul>

            {/* Login - Right */}
            <div className="flex-shrink-0 w-auto xl:w-64 flex justify-end">
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