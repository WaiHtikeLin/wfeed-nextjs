import React from "react"
import { cn } from "@/lib/utils"

export function PostsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-6", className)}>{children}</div>
}

export default PostsList
