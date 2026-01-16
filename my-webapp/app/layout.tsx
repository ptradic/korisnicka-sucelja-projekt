import type { Metadata } from "next";
import { Geist, Geist_Mono, Averia_Gruesa_Libre, Archivo_Black } from "next/font/google";
import "./globals.css";
import { Navigation } from "./_components/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const averiaGruesaLibre = Averia_Gruesa_Libre({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-averia",
});

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${averiaGruesaLibre.variable} ${archivoBlack.variable} antialiased`}
        style={{ fontFamily: 'var(--font-averia)' }}
      >
        <Navigation />
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
