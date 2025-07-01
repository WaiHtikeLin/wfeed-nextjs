"use client"

import Image from "next/image"
import Link from "next/link"
import { useState} from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bookmark,
  Share,
  ExternalLink,
  BookmarkCheck,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  MoreVertical,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Post } from "@/lib/types"

interface PostCardProps {
  post: Post
  sourceId?: string
  isSaved?: boolean
}

export function PostCard({ post, sourceId, isSaved = false }: PostCardProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(isSaved || post.isSaved || false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [followStatus, setFollowStatus] = useState<string>(post.source.priority || "not_following")
  const [followLoading, setFollowLoading] = useState(false)
  const [actualSourceId, setActualSourceId] = useState<string | null>(post.source.id || null)
  const timeAgo = formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })

  const handleSourceClick = async () => {
    if (actualSourceId) {
      router.push(`/source/${actualSourceId}`)
      return
    }

    // If we don't have sourceId, we need to find it
    try {
      const response = await fetch("/api/sources/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedId: `feed/${post.source.title}`,
          title: post.source.title,
          website: post.source.websiteUrl,
          iconUrl: post.source.iconUrl,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setActualSourceId(data.sourceId)
        router.push(`/source/${data.sourceId}`)
      }
    } catch (error) {
      console.error("Error navigating to source:", error)
    }
  }

  const handleFollowAction = async (action: "see_first" | "normal" | "see_less") => {
    if (!actualSourceId) {
      console.error("❌ No source ID available for follow action")
      return
    }

    setFollowLoading(true)
    try {
      console.log(`🔄 Updating follow status to: ${action} for source: ${actualSourceId}`)

      // If clicking the same action that's currently active, unfollow
      if (followStatus === action) {
        console.log(`🔄 Unfollowing (was ${action})`)
        const response = await fetch(`/api/subscriptions/${actualSourceId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          console.log("✅ Unfollowed successfully")
          setFollowStatus("not_following")
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error("❌ Failed to unfollow:", errorData)
        }
      } else {
        // Use post.source data directly for subscription
        const feedId = post.source.websiteUrl ? `feed/${post.source.websiteUrl}` : null
        if (!feedId) {
          console.error("❌ No valid feedId for subscription from post.source")
          return
        }
        const response = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feedId,
            title: post.source.title,
            description: "",
            website: post.source.websiteUrl,
            iconUrl: post.source.iconUrl,
            priority: action,
          }),
        })

        if (response.ok) {
          console.log(`✅ Follow status updated to: ${action}`)
          setFollowStatus(action)
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error("❌ Failed to update follow status:", errorData)
        }
      }
    } catch (error) {
      console.error("❌ Error updating follow status:", error)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/posts/save", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      })

      if (response.ok) {
        const newSavedState = !saved
        setSaved(newSavedState)
      }
    } catch (error) {
      console.error("Error saving post:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(post.url)
    const title = encodeURIComponent(post.title)
    const text = encodeURIComponent(`${post.title} - ${post.source.title}`)

    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
      case "copy":
        navigator.clipboard.writeText(post.url)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
        return
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  const getFollowOptionStyle = (option: string) => {
    if (followStatus === option) {
      switch (option) {
        case "see_first":
          return "text-green-600 font-medium"
        case "normal":
          return "text-blue-600 font-medium"
        case "see_less":
          return "text-red-600 font-medium"
        default:
          return "text-gray-700"
      }
    }
    return "text-gray-700"
  }

  const getFollowOptionText = (option: string) => {
    if (followStatus === option) {
      switch (option) {
        case "see_first":
          return "See First"
        case "normal":
          return "Following"
        case "see_less":
          return "See Less"
        default:
          return ""
      }
    } else {
      switch (option) {
        case "see_first":
          return "See First"
        case "normal":
          return "Follow"
        case "see_less":
          return "See Less"
        default:
          return ""
      }
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <button onClick={handleSourceClick} className="flex-shrink-0">
              <Avatar className="h-10 w-10 hover:ring-2 hover:ring-blue-500 transition-all">
                <AvatarImage src={post.source.iconUrl || "/placeholder.svg"} alt={post.source.title} />
                <AvatarFallback>{post.source.title.charAt(0)}</AvatarFallback>
              </Avatar>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSourceClick}
                  className="font-semibold text-sm hover:text-blue-600 transition-colors truncate"
                >
                  {post.source.title}
                </button>
                {post.author && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600 truncate">{post.author}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">{timeAgo}</p>
            </div>
          </div>

          {/* Three vertical dots menu for follow options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => handleFollowAction("see_first")}
                className={`cursor-pointer ${getFollowOptionStyle("see_first")}`}
                disabled={followLoading}
              >
                {followLoading ? "..." : getFollowOptionText("see_first")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFollowAction("normal")}
                className={`cursor-pointer ${getFollowOptionStyle("normal")}`}
                disabled={followLoading}
              >
                {followLoading ? "..." : getFollowOptionText("normal")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFollowAction("see_less")}
                className={`cursor-pointer ${getFollowOptionStyle("see_less")}`}
                disabled={followLoading}
              >
                {followLoading ? "..." : getFollowOptionText("see_less")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold leading-tight line-clamp-2">{post.title}</h2>

          {post.summary && <p className="text-gray-600 text-sm line-clamp-3">{post.summary}</p>}

          {post.imageUrl && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
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

          <div className="flex items-center justify-center sm:justify-start pt-2">
            <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto">
              {/* Save Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className={`text-gray-600 hover:text-yellow-600 ${saved ? "text-yellow-600" : ""}`}
              >
                {saved ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
                <span className="text-sm">{saving ? "..." : saved ? "Saved" : "Save"}</span>
              </Button>

              {/* Share Button with Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-600">
                    <Share className="h-4 w-4 mr-2" />
                    <span className="text-sm">Share</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem onClick={() => handleShare("facebook")} className="cursor-pointer">
                    <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("twitter")} className="cursor-pointer">
                    <Twitter className="h-4 w-4 mr-2 text-sky-500" />
                    Share on X
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("linkedin")} className="cursor-pointer">
                    <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                    Share on LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("copy")} className="cursor-pointer">
                    {copySuccess ? (
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copySuccess ? "Link Copied!" : "Copy Link"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Visit Button */}
              <Link href={post.url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <span className="text-sm">Visit</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
