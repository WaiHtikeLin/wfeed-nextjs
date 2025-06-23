"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface PublicPost {
  id: string
  title: string
  content?: string
  summary?: string
  url: string
  author?: string
  publishedAt: string
  imageUrl?: string
  source: {
    id: string
    title: string
    iconUrl?: string
    websiteUrl?: string
    description?: string
  }
}

interface PublicPostCardProps {
  post: PublicPost
}

export function PublicPostCard({ post }: PublicPostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })

  return (
    <Card className="h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      {post.imageUrl && (
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          <Image
            src={post.imageUrl || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = "none"
            }}
          />
        </div>
      )}

      <CardHeader className="pb-3">
        {/* Source Info */}
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.source.iconUrl || "/placeholder.svg"} alt={post.source.title} />
            <AvatarFallback className="text-xs">{post.source.title.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm text-gray-900 truncate">{post.source.title}</span>
              {post.author && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600 truncate">{post.author}</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold leading-tight line-clamp-3 mb-2">{post.title}</h2>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        {/* Summary */}
        {post.summary && <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">{post.summary}</p>}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 mt-auto">
          <Link href={post.url} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Read Article
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
