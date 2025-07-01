"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

const publicRoutes = [
  "/login",
  "/register",
  /^\/date\/[^/]+\/posts$/
]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      const isPublicRoute = publicRoutes.some((route) =>
        typeof route === "string" ? route === pathname : route.test(pathname)
      )

      if (!user && !isPublicRoute) {
        router.push("/login")
      } else if (user && isPublicRoute) {
        router.push("/")
      }
    }
  }, [user, loading, pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return <>{children}</>
}
