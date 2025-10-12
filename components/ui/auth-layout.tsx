import React from "react"
import PageContainer from "@/components/ui/page-container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Rss } from "lucide-react"
import { cn } from "@/lib/utils"

export function AuthLayout({
  title,
  description,
  children,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <PageContainer>
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Rss className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </PageContainer>
  )
}

export default AuthLayout
