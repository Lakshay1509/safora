import {QueryProviders} from "@/providers/query-providers"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarLayout } from "@/components/SidebarLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Safe or Not | Community-Driven Safety Insights",
    template: "%s | Safe or Not",
  },
  description:
    "Discover subtle safety insights powered by community feedback and AI. Safe or Not helps travelers and locals assess places with real experiences, ratings, and tips for a safer journey.",
  keywords: [
  "safety insights",
  "safe or not",
  "travel safety",
  "community safety ratings",
  "AI safety tips",
  "women safety travel",
  "city safety insights",
  "neighborhood safety",
  "local safety ratings",
  "is this place safe",
  "safe travel destinations",
  "public safety awareness",
  "AI powered travel safety",
  "safety tips for travelers",
  "solo travel safety",
  "night travel safety",
  "urban safety insights",
  "community safety reviews",
  "real-time safety updates",
  "safe places for women",
  "safety map insights",
  "tourist safety guide",
  "community-driven safety tips",
  "location safety reviews",
  "safety checker for cities",
],
  openGraph: {
    title: "Safe or Not | Community-Driven Safety Insights",
    description:
      "Get real safety ratings and AI-powered insights before you go. A platform built by the community, for the community.",
    url: "https://safeornot.space",
    siteName: "Safe or Not",
    images: [
      {
        url: "/og.webp",
        width: 1200,
        height: 630,
        alt: "Safe or Not - Community-Driven Safety Insights",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Safe or Not | Community-Driven Safety Insights",
    description:
      "Check subtle safety insights powered by real experiences and AI before you travel or explore.",
    images: ["/og.webp"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
        <QueryProviders>
          <Toaster richColors theme="light"/>
          <Navbar/>
        <SidebarLayout>

          {children}
        </SidebarLayout>
        </QueryProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
