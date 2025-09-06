"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname();

  const noSidebarPaths = ["/", "/login", "/privacy-policy"];
  const showSidebar = !noSidebarPaths.includes(pathname);

  return (
    <>
      {showSidebar && <Sidebar />}
      <main className={showSidebar ? "lg:pl-64" : ""}>{children}</main>
    </>
  );
}