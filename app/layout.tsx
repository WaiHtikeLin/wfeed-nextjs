
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { NavbarWrapper } from "@/components/navbar-wrapper"
import { AuthGuard } from "@/components/auth-guard"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RSS Reader - Modern Feed Reader",
  description: "A beautiful, modern RSS reader with priority-based feed management",
}


// Helper to check if current segment is the root (landing page)
function isRootPath() {
  if (typeof window !== "undefined") {
    return window.location.pathname === "/";
  }
  // On server, Next.js always renders the root layout for / and / (with or without slash)
  return true;
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use Next.js usePathname hook (client only)
    return (
        <html lang="en">
            <head>
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
                    crossOrigin="anonymous"
                ></script>
            </head>
            <body className={inter.className}>
                <AuthProvider>
                    <AuthGuard>
                        <NavbarWrapper />
                        <AuthContent>{children}</AuthContent>
                    </AuthGuard>
                </AuthProvider>
            </body>
        </html>
    );

}

// Client component to conditionally show SideNav only for authenticated user
// ...existing code...
import AuthContent from "@/components/auth-content";
