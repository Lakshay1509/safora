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
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if the not-found page content is rendered
    if (document.querySelector(".not-found-page")) {
      setIsNotFound(true);
    } else {
      setIsNotFound(false);
    }
  }, [pathname]); // Re-run this check on path change

  const noSidebarPaths = ["/", "/login", "/privacy-policy"];
  // Show sidebar if it's not a no-sidebar path AND it's not the 404 page
  const showSidebar = !noSidebarPaths.includes(pathname) && !isNotFound;

  return (
    <>
      {isClient && showSidebar && <Sidebar />}
      <main className={isClient && showSidebar ? "lg:pl-64" : ""}>{children}</main>
    </>
  );
}