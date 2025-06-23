"use client"

import { useState, useEffect, useCallback } from "react"
import { PostCard } from "@/components/post-card"
import { PostSkeleton } from "@/components/post-skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, Bookmark } from "lucide-react"
import { useInView } from "react-intersection-observer"

interface Post {
  id: string
  title: string
  content?: string
  summary?: string
  url: string
  author?: string
  publishedAt: string
  imageUrl?: string
  savedAt: string
  source: {
    title: string
    iconUrl?: string
    websiteUrl?: string
  }
}

export default function SavedPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  })

  useEffect(() => {
    loadSavedPosts(1, true)
  }, [])

  const loadSavedPosts = useCallback(
    async (pageNum: number, reset = false) => {
      try {
        if (pageNum === 1) {
          setLoading(true)
        } else {
          setLoadingMore(true)
        }

        setError("")

        const response = await fetch(`/api/posts/saved?page=${pageNum}&limit=10`)
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
          setError("Failed to load saved posts. Please try again.")
        }
      } catch (err) {
        setError("An error occurred while loading saved posts.")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [setPosts, setPage, setHasMore],
  )

  useEffect(() => {
    if (inView && hasMore && !loadingMore && !loading) {
      const nextPage = page + 1
      loadSavedPosts(nextPage)
    }
  }, [inView, hasMore, loadingMore, loading, page, loadSavedPosts])

  const handleRefresh = () => {
    loadSavedPosts(1, true)
  }

  const handleSaveToggle = (postId: string, isSaved: boolean) => {
    if (!isSaved) {
      // Remove from saved posts list
      setPosts((prev) => prev.filter((post) => post.id !== postId))
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Posts</h1>
            <p className="text-gray-600">Your bookmarked articles</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Posts</h1>
          <p className="text-gray-600">Your bookmarked articles</p>
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
          <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No saved posts yet</h3>
          <p className="text-gray-600 mb-6">
            Start saving posts by clicking the "Save" button on articles you want to read later
          </p>
          <Button asChild>
            <a href="/">Browse Posts</a>
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} isSaved={true} onSaveToggle={handleSaveToggle} />
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
          <p>{"You've reached the end of your saved posts"}</p>
        </div>
      )}
    </div>
  )
}
