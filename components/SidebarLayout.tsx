"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname();
  
  // Don't show sidebar on landing page
  const isLandingPage = pathname === "/";
  const isSignup = pathname === '/login'
  const islegal = pathname === '/privacy-policy'
  
  return (
    <>
      {!isLandingPage && !isSignup && !islegal && <Sidebar />}
      <main className={!isLandingPage  && !isSignup && !islegal ? "lg:pl-64" : ""}>
        {children}
      </main>
    </>
  );
}