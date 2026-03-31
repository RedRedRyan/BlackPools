import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { headers } from 'next/headers' // added
import ContextProvider from '@/context'
import Particles from "@/components/Particles";

import { MorphSVGPlugin, ScrambleTextPlugin, ScrollTrigger, SplitText, ScrollSmoother, DrawSVGPlugin, Flip } from 'gsap/all'
import gsap from 'gsap'
import Footer from "@/components/Footer";

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

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersObj = await headers()
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en">
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} ${inter.variable} min-h-screen antialiased`}
      >
                  <div className="absolute inset-0 w-full h-full ">
          
          <Particles
            particleColors={["#a4f4a1"]}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover
            alphaParticles={false}
            disableRotation={false}
            pixelRatio={1}
        />
        </div>
           

      <ContextProvider cookies={cookies}>
        <Navbar />
        {children}
      <Footer/>
  </ContextProvider>
      </body>
    </html>
  );
}
