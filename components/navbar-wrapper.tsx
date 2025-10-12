"use client"

import { Navbar } from "@/components/navbar"
import { usePathname } from "next/navigation"

export function NavbarWrapper() {
  const pathname = usePathname()
  // Hide navbar only on landing page
  if (pathname === "/") return null
  return <Navbar />
}
