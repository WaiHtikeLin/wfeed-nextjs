"use client"

import { useState, useEffect, useCallback } from "react"
import { PostCard } from "@/components/post-card"
import { PostSkeleton } from "@/components/post-skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import ContentWrapper from "@/components/ui/content-wrapper"
import SectionHeader from "@/components/ui/section-header"
import EmptyState from "@/components/ui/empty-state"
import PostsList from "@/components/ui/posts-list"
import { RefreshCw, Rss } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { useHomeStore } from "@/lib/store"
import type { Post } from "@/lib/types"

export default function FeedPage() {
  const {
    posts,
    page,
    hasMore,
    setPosts,
    addPosts,
    setPage,
    setHasMore,
    resetPosts
  } = useHomeStore()

  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")
  // maxPublishedAt is always updated from every response
  // anchorDate is set from the first page's maxPublishedAt and never changes after
  const [maxPublishedAt, setMaxPublishedAt] = useState<string | null>(null)
  const [anchorDate, setAnchorDate] = useState<string | null>(null)

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  })

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

        let url = `/api/posts?page=${pageNum}&limit=10`
        if (pageNum > 1 && anchorDate && maxPublishedAt) {
          url += `&anchorDate=${encodeURIComponent(anchorDate)}&maxDate=${encodeURIComponent(maxPublishedAt)}`
        }

        console.log(`📡 Fetching posts - Page ${pageNum}`)
        const response = await fetch(url, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (response.ok) {
          const data = await response.json()
          const newPosts = data.posts || []
          const newMaxPublishedAt = data.maxPublishedAt || null

          console.log(`✅ Received ${newPosts.length} posts`)
          console.log(`📅 New maxPublishedAt: ${newMaxPublishedAt}`)

          if (reset || pageNum === 1) {
            setPosts(newPosts)
            setPage(1)
            setMaxPublishedAt(newMaxPublishedAt)
            setAnchorDate(newMaxPublishedAt) // anchorDate is set from first page's maxPublishedAt
          } else {
            addPosts(newPosts)
            setPage(pageNum)
            if(newMaxPublishedAt) 
              setMaxPublishedAt(newMaxPublishedAt)
          }

          setHasMore(newPosts.length >= 10)
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
    [setPosts, addPosts, setPage, setHasMore, maxPublishedAt, anchorDate, posts],
  )

  useEffect(() => {
    loadPosts(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loadingMore && !loading && posts.length > 0) {
      const nextPage = page + 1
      loadPosts(nextPage, false)
    }
  }, [inView, hasMore, loadingMore, loading, page, posts.length, anchorDate, loadPosts])

  // Optionally, you can add a polling or button to fetch new posts using:
  // loadPosts(1, false, 'newer')

  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered")
    resetPosts()
    setAnchorDate(null)
    setMaxPublishedAt(null)
    loadPosts(1, true)
  }

  if (loading && posts.length === 0) {
    return (
      <ContentWrapper>
        <SectionHeader title="Your Feed" subtitle="Latest posts from your subscriptions" />

        <PostsList>
          {[...Array(5)].map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </PostsList>
      </ContentWrapper>
    )
  }

  return (
    <ContentWrapper>
      <SectionHeader
        title="Your Feed"
        subtitle="Latest posts from your subscriptions"
        actions={
          <Button variant="outline" onClick={handleRefresh} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {posts.length === 0 && !loading && (
        <EmptyState
          icon={<Rss className="h-16 w-16 text-gray-400 mx-auto mb-4" />}
          title="No posts in your feed"
          description={
            "Start following RSS sources to see posts here. Search for your favorite websites and blogs."
          }
          actions={<Button asChild><a href="/search">Find RSS Sources</a></Button>}
        />
      )}

      <PostsList>
        {posts.map((post) => (
          <PostCard key={post.id} post={post as Post} />
        ))}
      </PostsList>

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
    </ContentWrapper>
  )
}
