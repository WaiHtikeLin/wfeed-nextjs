"use client"

import { useState, useEffect, useCallback } from "react"
import { PostCard } from "@/components/post-card"
import { PostSkeleton } from "@/components/post-skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, Rss } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { useHomeStore } from "@/lib/store"

interface Post {
  id: string
  title: string
  content?: string
  summary?: string
  url: string
  author?: string
  publishedAt: string
  imageUrl?: string
  source: {
    title: string
    iconUrl?: string
    websiteUrl?: string
  }
}

export default function FeedPage() {
  const {
    posts,
    page,
    hasMore,
    setPosts,
    addPosts,
    setPage,
    setHasMore,
    resetPosts,
    shouldRefreshData,
    setFollowStatusVersion,
    followStatusVersion,
  } = useHomeStore()

  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")
  const [followStatusChanged, setFollowStatusChanged] = useState(0)

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  })

  // Load posts on mount or when follow status changes
  useEffect(() => {
    if (shouldRefreshData() || followStatusChanged > followStatusVersion) {
      console.log("🔄 Loading fresh posts (initial load or follow status changed)")
      loadPosts(1, true)
      setFollowStatusVersion(followStatusChanged)
     } 
  }, [followStatusChanged])

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loadingMore && !loading && posts.length > 0) {
      const nextPage = page + 1
      console.log(`📄 Loading more posts - Page ${nextPage}`)
      loadPosts(nextPage)
    }
  }, [inView, hasMore, loadingMore, loading, page, posts.length])

  const loadPosts = useCallback(
    async (pageNum: number, reset = false) => {
      try {
        if (pageNum === 1) {
          setLoading(true)
          if (reset) {
            console.log("🔄 Resetting posts and loading fresh data")
          }
        } else {
          setLoadingMore(true)
        }

        setError("")

        console.log(`📡 Fetching posts - Page ${pageNum}`)
        const response = await fetch(`/api/posts?page=${pageNum}&limit=10`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (response.ok) {
          const data = await response.json()
          const newPosts = data.posts || []

          console.log(`✅ Received ${newPosts.length} posts`)

          if (reset || pageNum === 1) {
            setPosts(newPosts)
            setPage(1)
          } else {
            addPosts(newPosts)
            setPage(pageNum)
          }

          setHasMore(newPosts.length === 10)
        } else {
          console.error("❌ Failed to fetch posts:", response.status)
          setError("Failed to load posts. Please try again.")
        }
      } catch (err) {
        console.error("❌ Error loading posts:", err)
        setError("An error occurred while loading posts.")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [setPosts, addPosts, setPage, setHasMore],
  )

  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered")
    resetPosts()
    loadPosts(1, true)
  }

  const handleFollowStatusChange = () => {
    console.log("🔄 Follow status changed, will refresh on next load")
    setFollowStatusChanged((prev) => prev + 1)
  }

  const handleSaveToggle = (postId: string, isSaved: boolean) => {
    console.log(`💾 Post ${postId} ${isSaved ? "saved" : "unsaved"}`)
  }

  if (loading && posts.length === 0) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Feed</h1>
            <p className="text-gray-600">Latest posts from your subscriptions</p>
          </div>
        </div>

        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Feed</h1>
          <p className="text-gray-600">Latest posts from your subscriptions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Rss className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No posts in your feed</h3>
          <p className="text-gray-600 mb-6">
            Start following RSS sources to see posts here. Search for your favorite websites and blogs.
          </p>
          <Button asChild>
            <a href="/search">Find RSS Sources</a>
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onSaveToggle={handleSaveToggle}
            onFollowStatusChange={handleFollowStatusChange}
          />
        ))}
      </div>

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
          <p>{"You've reached the end of your feed"}</p>
        </div>
      )}
    </div>
  )
}
