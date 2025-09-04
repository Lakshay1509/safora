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
  
  return (
    <>
      {!isLandingPage && <Sidebar />}
      <main className={!isLandingPage ? "lg:pl-64" : ""}>
        {children}
      </main>
    </>
  );
}