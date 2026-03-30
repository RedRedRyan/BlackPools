import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

import { MorphSVGPlugin, ScrambleTextPlugin, ScrollTrigger, SplitText, ScrollSmoother, DrawSVGPlugin, Flip } from 'gsap/all'
import gsap from 'gsap'

gsap.registerPlugin(ScrollTrigger, SplitText, MorphSVGPlugin, ScrambleTextPlugin, ScrollSmoother, DrawSVGPlugin, Flip)

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Blackpools",
  description: "Confidential Lending",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} ${inter.variable} min-h-screen antialiased`}
      >

        
        <Navbar />
        {children}
      
      
      </body>
    </html>
  );
}
