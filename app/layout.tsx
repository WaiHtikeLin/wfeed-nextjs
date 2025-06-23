import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth-guard"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RSS Reader - Modern Feed Reader",
  description: "A beautiful, modern RSS reader with priority-based feed management",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthGuard>
            <Navbar />
            <main className="min-h-screen bg-gray-50">{children}</main>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
