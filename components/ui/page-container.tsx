import React from "react"
import { cn } from "@/lib/utils"

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main
      className={cn(
        "min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4",
        className
      )}
    >
      {children}
    </main>
  )
}

export default PageContainer
