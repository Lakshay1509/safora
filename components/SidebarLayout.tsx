"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const noSidebarPaths = ["/", "/login", "/privacy-policy"];
  const showSidebar = !noSidebarPaths.includes(pathname);

  return (
    <>
      {isClient && showSidebar && <Sidebar />}
      <main className={isClient && showSidebar ? "lg:pl-64" : ""}>{children}</main>
    </>
  );
}