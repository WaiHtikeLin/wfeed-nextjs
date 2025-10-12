import React from "react"
import { cn } from "@/lib/utils"

export function PageContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("w-full max-w-2xl flex flex-col items-center gap-8 py-12", className)}>
      {children}
    </div>
  )
}

export function FeatureGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mt-4", className)}>
      {children}
    </div>
  )
}

export default PageContent
