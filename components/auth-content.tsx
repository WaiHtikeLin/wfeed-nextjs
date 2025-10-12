"use client";
import React, { useState, useEffect } from "react";
import MobileSideNav from "@/components/mobile-side-nav";
import { useAuth } from "@/hooks/use-auth";
import SideNav from "@/components/side-nav";

export default function AuthContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
    const [isMobile, setIsMobile] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    function handleOpenMobileNav() {
      setMobileNavOpen(true);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("open-mobile-nav", handleOpenMobileNav);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("open-mobile-nav", handleOpenMobileNav);
    };
  }, []);

    const isPublicPage = typeof window !== "undefined" && (["/", "/login", "/register"].includes(window.location.pathname) || window.location.pathname.startsWith("/source/"));
    const showDesktopSideNav = user && !isMobile && !isPublicPage;
    const showMobileBarIcon = user && isMobile && !isPublicPage;

    return (
        <>
            {showDesktopSideNav && <SideNav />}
            <main className={`min-h-screen bg-gray-50 flex-1 ${showDesktopSideNav ? 'pl-64' : ''}`}>{children}</main>
          
            {showMobileBarIcon && mobileNavOpen && (
                <MobileSideNav onClose={() => setMobileNavOpen(false)} />
            )}
        </>
    );
}
