import React from "react"
import { cn } from "@/lib/utils"

export function ContentWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("pt-20 pb-8 px-4 max-w-4xl mx-auto", className)}>{children}</div>
}

export default ContentWrapper
