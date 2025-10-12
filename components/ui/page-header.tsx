import React from "react"
import { cn } from "@/lib/utils"

export function PageHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {children}
    </div>
  )
}

export default PageHeader
