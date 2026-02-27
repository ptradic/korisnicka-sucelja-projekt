import type { Metadata } from "next";
import { Geist, Geist_Mono, Averia_Gruesa_Libre, Archivo_Black } from "next/font/google";
import "./globals.css";
import { Navigation } from "./components/Navigation";
import { LayoutContent } from "./components/LayoutContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const averiaGruesaLibre = Averia_Gruesa_Libre({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-averia",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trailblazers' Vault",
  description: "Manage your D&D party's inventory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${averiaGruesaLibre.variable} ${archivoBlack.variable} antialiased`}
        style={{ fontFamily: 'var(--font-averia)' }}
      >
        <Navigation />
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
