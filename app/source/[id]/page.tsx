"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { PostCard } from "@/components/post-card"
import { PostSkeleton } from "@/components/post-skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Users, Calendar, RefreshCw, Settings } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { formatDistanceToNow } from "date-fns"
import { Post } from "@/lib/types"

interface SourceProfile {
  id: string
  feedlyId?: string
  title: string
  description?: string
  websiteUrl?: string
  feedUrl: string
  iconUrl?: string
  createdAt: string
  postCount: number
  isFollowing: boolean
  priority?: "see_first" | "normal" | "see_less"
}

export default function SourceProfilePage() {
  const params = useParams()
  const router = useRouter()
  const sourceId = params.id as string

  const [source, setSource] = useState<SourceProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  })

  useEffect(() => {
    if (sourceId) {
      loadSourceProfile()
      loadPosts(1, true)
    }
  }, [sourceId])

  useEffect(() => {
    if (inView && hasMore && !loadingMore && !loading) {
      const nextPage = page + 1
      loadPosts(nextPage)
    }
  }, [inView, hasMore, loadingMore, loading, page])

  const loadSourceProfile = async () => {
    try {
      const response = await fetch(`/api/sources/${sourceId}`)
      if (response.ok) {
        const data = await response.json()
        setSource(data.source)
      } else if (response.status === 404) {
        setError("Source not found")
      } else {
        setError("Failed to load source profile")
      }
    } catch (err) {
      setError("An error occurred while loading the source profile")
    }
  }

  const loadPosts = async (pageNum: number, reset = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await fetch(`/api/sources/${sourceId}/posts?page=${pageNum}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        const newPosts = data.posts || []

        if (reset) {
          setPosts(newPosts)
          setPage(1)
        } else {
          setPosts((prev) => [...prev, ...newPosts])
          setPage(pageNum)
        }

        setHasMore(newPosts.length === 10)
      } else {
        setError("Failed to load posts")
      }
    } catch (err) {
      setError("An error occurred while loading posts")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleFollow = async (priority: "see_first" | "normal" | "see_less") => {
    if (!source) return

    setFollowLoading(true)
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedId: source.feedlyId || `feed/${source.feedUrl}`,
          title: source.title,
          description: source.description,
          website: source.websiteUrl,
          iconUrl: source.iconUrl,
          priority,
        }),
      })

      if (response.ok) {
        setSource((prev) => (prev ? { ...prev, isFollowing: true, priority } : null))
      } else {
        setError("Failed to follow source")
      }
    } catch (err) {
      setError("An error occurred while following the source")
    } finally {
      setFollowLoading(false)
    }
  }

  const handleUnfollow = async () => {
    if (!source) return

    setFollowLoading(true)
    try {
      const response = await fetch(`/api/subscriptions/${sourceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSource((prev) => (prev ? { ...prev, isFollowing: false, priority: undefined } : null))
      } else {
        setError("Failed to unfollow source")
      }
    } catch (err) {
      setError("An error occurred while unfollowing the source")
    } finally {
      setFollowLoading(false)
    }
  }

  const handleRefresh = () => {
    loadPosts(1, true)
  }

  if (loading && !source) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-6">
            <div className="flex items-start space-x-4">
              <div className="h-20 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error && !source) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!source) return null

  return (
    <div className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Source Profile Header */}
      <Card className="mb-8">
        <CardHeader className="pb-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={source.iconUrl || "/placeholder.svg"} alt={source.title} />
              <AvatarFallback className="text-2xl">{source.title.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 truncate">{source.title}</h1>
                  {source.description && <p className="text-gray-600 mb-4 line-clamp-2">{source.description}</p>}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Added {formatDistanceToNow(new Date(source.createdAt), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{source.postCount} posts</span>
                    </div>
                    {source.websiteUrl && (
                      <a
                        href={source.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Visit website</span>
                      </a>
                    )}
                  </div>

                  {source.isFollowing && (
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Following
                      </Badge>
                      {source.priority && (
                        <Badge variant="outline">
                          {source.priority === "see_first"
                            ? "See First"
                            : source.priority === "see_less"
                              ? "See Less"
                              : "Normal"}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {source.isFollowing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleUnfollow}
                        disabled={followLoading}
                        className="min-w-[100px]"
                      >
                        {followLoading ? "..." : "Unfollow"}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => handleFollow("normal")} disabled={followLoading} className="min-w-[100px]">
                        {followLoading ? "..." : "Follow"}
                      </Button>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFollow("see_first")}
                          disabled={followLoading}
                        >
                          See First
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFollow("see_less")}
                          disabled={followLoading}
                        >
                          See Less
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Posts Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {posts.length === 0 && !loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Users className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">This source hasn't published any posts recently.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post as Post} />
          ))}
        </div>
      )}

      {loadingMore && (
        <div className="space-y-6 mt-6">
          {[...Array(3)].map((_, i) => (
            <PostSkeleton key={`loading-${i}`} />
          ))}
        </div>
      )}

      {hasMore && !loadingMore && <div ref={ref} className="h-10" />}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>{"You've reached the end of this source's posts"}</p>
        </div>
      )}
    </div>
  )
}
