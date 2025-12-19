"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type Page = {
  title: string;
  path: `/${string}`;
};

/**
 * pages is an array of objects representing the pages in the web app.
 * Each object contains a title and a path. This array is used to generate the navigation menu.
 *
 * We hardcode pages here, but in real app you want to store and read this information from some external source (e.g. CMS, DB, config file, etc).
 */
const pages: Page[] = [
  { title: "Home", path: "/" },
  {
    title: "About",
    path: "/about",
  },
  {
    title: "Blog Posts",
    path: "/posts",
  },
  {
    title: "Guides",
    path: "/guides",
  },
  {
    title: "Demos",
    path: "/demos",
  },
  {
    title: "Library",
    path: "/library",
  },
  {
    title: "DM Tools",
    path: "/dm-tools",
  },
  {
    title: "Support",
    path: "/support",
  },
];

/**
 * Render a page list item.
 * @param page - { title, path } for the page
 * @param index - array index used for key
 * @returns JSX element for a list item
 */
function processPage(page: Page, index: number, currentPath?: string) {
  const isActive = currentPath === page.path;
  return (
    <li key={index} className="w-full">
      <Link
        href={page.path}
        className={`block w-full px-3 py-1.5 rounded-lg transition-colors duration-200 ${
          isActive 
            ? "bg-indigo-200 text-indigo-900 font-semibold" 
            : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
        }`}
      >
        {page.title}
      </Link>
    </li>
  );
}

export function Navigation() {
  const currentPath = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        navRef.current && 
        buttonRef.current &&
        !navRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      {/* Hamburger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg focus:outline-none md:hidden"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-0.5 bg-gray-600 mb-1.5 transition-all"></div>
        <div className="w-6 h-0.5 bg-gray-600 mb-1.5 transition-all"></div>
        <div className="w-6 h-0.5 bg-gray-600 transition-all"></div>
      </button>

      {/* Navigation Menu - Mobile Sidebar */}
      <div ref={navRef} className="block md:hidden">
        <nav className={`fixed top-0 left-0 h-full bg-indigo-600 w-64 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Menu</h2>
            <ul className="space-y-1">
              {pages.map((page, index) => processPage(page, index, currentPath))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Navigation Menu - Desktop Top Bar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-indigo-700 shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6">
          <ul className="flex space-x-1 h-[3.5rem] items-center">
            {pages.map((page, index) => processPage(page, index, currentPath))}
          </ul>
        </div>
      </nav>
    </div>
  );
}