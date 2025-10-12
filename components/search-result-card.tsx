"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { Star, Eye, EyeOff, MoreVertical } from "lucide-react"
import { ExternalLink, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"

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
  onUnfollow?: () => void
  showFollowActions?: boolean
}

export function SearchResultCard(props: SearchResultCardProps & { followPriority?: "see_first" | "normal" | "see_less" }) {
  const { result, onFollow, isFollowing, isLoading, onUnfollow, showFollowActions, followPriority: followPriorityProp } = props;
  const router = useRouter();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);

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

  // Determine follow priority for icon and dropdown
  const followPriority = (typeof followPriorityProp !== 'undefined' ? followPriorityProp : (result as any).priority);

  let priorityIcon = null;
  if (followPriority === "see_first") priorityIcon = <Star className="h-4 w-4 text-yellow-500 inline ml-1" fill="#facc15" />;
  else if (followPriority === "see_less") priorityIcon = <EyeOff className="h-4 w-4 text-gray-400 inline ml-1" />;

  // Helper to wrap follow actions with auth check
  const handleFollowWithAuth = (priority: "see_first" | "normal" | "see_less") => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    onFollow(result.feedId, priority);
  };

  return (
    <>
      <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <button onClick={handleSourceClick} className="flex-shrink-0">
            <Avatar className="h-12 w-12 hover:ring-2 hover:ring-blue-500 transition-all">
              <AvatarImage src={result.iconUrl || "/placeholder.svg"} alt={result.title} />
              <AvatarFallback>{result.title.charAt(0)}</AvatarFallback>
            </Avatar>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 min-w-0">
                <button
                  onClick={handleSourceClick}
                  className="font-semibold text-lg truncate hover:text-blue-600 transition-colors text-left"
                >
                  {result.title}
                </button>
                {priorityIcon}
                   {result.website && (
              <Link href={result.website} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="p-1">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => followPriority === "see_first" ? onUnfollow && onUnfollow() : handleFollowWithAuth("see_first")}
                    className={followPriority === "see_first" ? "font-semibold text-yellow-600" : ""}
                  >
                    <Star className="h-4 w-4 mr-2 text-yellow-500" fill="#facc15" />
                    See First
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => followPriority === "normal" ? onUnfollow && onUnfollow() : handleFollowWithAuth("normal")}
                    className={followPriority === "normal" ? "font-semibold text-blue-600" : ""}
                  >
                    <Eye className="h-4 w-4 mr-2 text-blue-500" />
                    {followPriority === "normal" ? "Following" : "Follow"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => followPriority === "see_less" ? onUnfollow && onUnfollow() : handleFollowWithAuth("see_less")}
                    className={followPriority === "see_less" ? "font-semibold text-gray-500" : ""}
                  >
                    <EyeOff className="h-4 w-4 mr-2 text-gray-500" />
                    See Less
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
        {result.description && (
          <p className="text-sm text-gray-600 mb-1 line-clamp-2">{result.description}</p>
        )}
      </CardContent>
      </Card>
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>This feature requires authentication</DialogTitle>
            <DialogDescription>
              Please login or register to follow sources and manage your feed.
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
