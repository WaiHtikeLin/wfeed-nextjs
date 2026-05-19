"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useHomeStore } from "@/lib/store"
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
  Star,
  EyeOff,
  Eye,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Post } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { id } from "date-fns/locale"

interface PostCardProps {
  post: Post
  sourceId?: string
  isSaved?: boolean
  onSaveToggle?: (postId: string, isSaved: boolean) => void
}

export function PostCard({ post, sourceId, isSaved = false, onSaveToggle }: PostCardProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(isSaved || post.isSaved || false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [actualSourceId, setActualSourceId] = useState<string | null>(post.source.id || null)
  const timeAgo = formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
  const followStatus = post.source.priority || "not_following"
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

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
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    if (!actualSourceId) {
      console.error("❌ No source ID available for follow action")
      return;
    }
    setFollowLoading(true);
    try {
      // ...existing code...
      if (followStatus === action) {
        // ...existing code...
        const response = await fetch(`/api/subscriptions/${actualSourceId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          useHomeStore.getState().updateSourcePriority(actualSourceId, "not_following");
        }
      } else {
        const feedId = post.source.feedlyId || null;
        if (!feedId) return;
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
        });
        if (response.ok) {
          useHomeStore.getState().updateSourcePriority(actualSourceId, action);
        }
      }
    } catch (error) {
      // ...existing code...
    } finally {
      setFollowLoading(false);
    }
  }

  const handleSave = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/posts/save", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      if (response.ok) {
        setSaved(!saved);
        if (onSaveToggle) {
          onSaveToggle(post.id, !saved);
        }
      }
    } catch (error) {
      // ...existing code...
    } finally {
      setSaving(false);
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

   let priorityIcon = null;
  if (followStatus === "see_first") priorityIcon = <Star className="h-4 w-4 text-yellow-500 inline ml-1" fill="#facc15" />;
  else if (followStatus === "see_less") priorityIcon = <EyeOff className="h-4 w-4 text-gray-400 inline ml-1" />;

  return (
    <>
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
                  {priorityIcon}
                  {post.author && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span
                        className="text-sm text-gray-600 break-words max-w-[240px] block align-middle whitespace-normal"
                        title={post.author}
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      >
                        {post.author.length > 60
                          ? post.author.slice(0, 57) + "..."
                          : post.author}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500">{timeAgo}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleFollowAction("see_first")}
                  className={followStatus === "see_first" ? "font-semibold text-yellow-600" : ""}
                  disabled={followLoading}
                >
                  {followLoading? "...": (<><Star className="h-4 w-4 mr-2 text-yellow-500" fill="#facc15" />
                  See First</>)}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFollowAction("normal")}
                  className={followStatus === "normal" ? "font-semibold text-blue-600" : ""}
                  disabled={followLoading}
                >
                  {followLoading? "...": (
                    <>
                    <Eye className="h-4 w-4 mr-2 text-blue-500" />
                  {followStatus === "normal" ? "Following" : "Follow"}
                  </>)}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFollowAction("see_less")}
                  className={followStatus === "see_less" ? "font-semibold text-gray-500" : ""}
                  disabled={followLoading}
                >
                 {followLoading? "...":
                 <>
                  <EyeOff className="h-4 w-4 mr-2 text-gray-500" />
                  See Less
                  </>}
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

            {post.url && post.url.includes("youtube.com") && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <iframe
                  src={post.url.replace("watch?v=", "embed/")}
                  title={post.title}
                  className="w-full h-full"
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
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>This feature requires authentication</DialogTitle>
            <DialogDescription>
              Please login or register to save posts, follow sources, and manage your feed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAuthDialog(false); router.push("/register"); }}>Register</Button>
            <Button onClick={() => { setShowAuthDialog(false); router.push("/login"); }}>Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
