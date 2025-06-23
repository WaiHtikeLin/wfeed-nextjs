"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: string
  title: string
  description?: string
  website?: string
  feedId: string
  iconUrl?: string
  subscribers?: number
}

interface SearchResultCardProps {
  result: SearchResult
  onFollow: (feedId: string, priority: "see_first" | "normal" | "see_less") => void
  isFollowing?: boolean
  isLoading?: boolean
}

export function SearchResultCard({ result, onFollow, isFollowing, isLoading }: SearchResultCardProps) {
  const router = useRouter()

  const handleSourceClick = async () => {
    // First, we need to get or create the source in our database
    try {
      const response = await fetch("/api/sources/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedId: result.feedId,
          title: result.title,
          description: result.description,
          website: result.website,
          iconUrl: result.iconUrl,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/source/${data.sourceId}`)
      } else {
        console.error("Failed to find/create source")
      }
    } catch (error) {
      console.error("Error navigating to source:", error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <button onClick={handleSourceClick} className="flex-shrink-0">
            <Avatar className="h-12 w-12 hover:ring-2 hover:ring-blue-500 transition-all">
              <AvatarImage src={result.iconUrl || "/placeholder.svg"} alt={result.title} />
              <AvatarFallback>{result.title.charAt(0)}</AvatarFallback>
            </Avatar>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSourceClick}
                className="font-semibold text-lg truncate hover:text-blue-600 transition-colors text-left"
              >
                {result.title}
              </button>
              {result.website && (
                <Link href={result.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="p-1">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
            {result.subscribers && (
              <div className="flex items-center space-x-1 mt-1">
                <Users className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">{result.subscribers.toLocaleString()} subscribers</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {result.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{result.description}</p>}

        <div className="flex flex-wrap gap-2">
          {isFollowing ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Following
            </Badge>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onFollow(result.feedId, "see_first")}
                disabled={isLoading}
                className="text-xs"
              >
                See First
              </Button>
              <Button
                size="sm"
                onClick={() => onFollow(result.feedId, "normal")}
                disabled={isLoading}
                className="text-xs"
              >
                Follow
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onFollow(result.feedId, "see_less")}
                disabled={isLoading}
                className="text-xs"
              >
                See Less
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
