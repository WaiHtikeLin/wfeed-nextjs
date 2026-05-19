"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Loader2, X } from "lucide-react"
import { SearchResultCard } from "@/components/search-result-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchStore } from "@/lib/store"
import ContentWrapper from "@/components/ui/content-wrapper"
import SectionHeader from "@/components/ui/section-header"

interface SearchResult {
  id: string
  title: string
  description?: string
  website?: string
  feedId: string
  iconUrl?: string
  subscribers?: number
  priority?: "see_first" | "normal" | "see_less";
}

export default function SearchPage() {
  const {
    query,
    results,
    hasSearched,
    followingIds,
    setQuery,
    setResults,
    setHasSearched,
    setFollowingIds,
    addFollowingId,
    clearSearch,
  } = useSearchStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [followLoading, setFollowLoading] = useState<Set<string>>(new Set())
  const lastSearchQuery = useRef<string>("")

  useEffect(() => {
    loadSubscriptions()
    lastSearchQuery.current = query
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedQuery = query.trim()

      if (trimmedQuery.length >= 3 && trimmedQuery !== lastSearchQuery.current) {
        console.log("Performing new search for:", trimmedQuery)
        lastSearchQuery.current = trimmedQuery
        performSearch(trimmedQuery)
      } else if (trimmedQuery.length === 0) {
        setResults([])
        setHasSearched(false)
        setError("")
        lastSearchQuery.current = ""
      } else if (hasSearched && trimmedQuery.length > 0 && trimmedQuery.length < 3) {
        setResults([])
        setError("")
        setHasSearched(true)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query, hasSearched])

  const loadSubscriptions = async () => {
    try {
      const response = await fetch("/api/subscriptions")
      if (response.ok) {
        const data = await response.json()
        const ids = data.subscriptions.map((sub: any) => ({ id: sub.feedly_id, priority: sub.priority }))
        setFollowingIds(ids)
      }
    } catch (error) {
      console.error("Failed to load subscriptions:", error)
    }
  }

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) return

    setLoading(true)
    setError("")
    setHasSearched(true)

    try {
      console.log("Searching for:", searchQuery)
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        console.log("Search results:", data.results?.length || 0, "feeds found")
        setResults(data.results || [])
        lastSearchQuery.current = searchQuery

        if (data.results && data.results.length === 0) {
          // Don't set error here, just show no results state
        }
      } else {
        setError("Failed to search feeds. Please try again.")
        setResults([])
      }
    } catch (err) {
      setError("An error occurred while searching. Please try again.")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (trimmedQuery.length >= 3) {
      lastSearchQuery.current = trimmedQuery
      performSearch(trimmedQuery)
    }
  }

  const handleClearSearch = () => {
    console.log("Clearing search")
    clearSearch()
    setError("")
    lastSearchQuery.current = ""
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleFollow = async (feedId: string, priority: "see_first" | "normal" | "see_less") => {
    const result = results.find((r) => r.feedId === feedId)
    if (!result) return

    setFollowLoading((prev) => {
      const newSet = new Set(prev)
      newSet.add(feedId)
      return newSet
    })

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedId: result.feedId,
          title: result.title,
          description: result.description,
          website: result.website,
          iconUrl: result.iconUrl,
          priority,
        }),
      })

      if (response.ok) {
        addFollowingId(feedId, priority)
        setResults(results.map((r) =>
          r.feedId === feedId ? { ...r, priority } : r
        ))
      } else {
        setError("Failed to follow feed. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setFollowLoading((prev) => {
        const newSet = new Set(prev)
        newSet.delete(feedId)
        return newSet
      })
    }
  }

    // Unfollow a source
   async function handleUnfollow(feedId: string) {
    const src = results.find(s => s.feedId === feedId);
    if (!src) return;
    const sourceId = src.id || feedId;
    const res = await fetch(`/api/subscriptions/${encodeURIComponent(sourceId)}`, {
      method: "DELETE",
    });
    if (res.ok) {
        setResults(results.map((r) =>
          r.feedId === feedId ? { ...r, priority: null } : r
        ))
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    console.log("Suggestion clicked:", suggestion)
    setQuery(suggestion)
    lastSearchQuery.current = suggestion
    performSearch(suggestion)
  }

  const showNoResults = hasSearched && !loading && results.length === 0 && query.trim().length >= 3 && !error
  const showMinLengthMessage = hasSearched && query.trim().length > 0 && query.trim().length < 3 && !loading

  return (
    <ContentWrapper>
      <SectionHeader title={"Search RSS Feeds"} subtitle={"Discover and follow your favorite RSS sources"} />

      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search for RSS feeds, websites, or topics... (min 3 characters)"
                value={query}
                onChange={handleQueryChange}
                className="w-full pr-10"
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button type="submit" disabled={loading || query.trim().length < 3}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </form>

          {query.trim().length > 0 && query.trim().length < 3 && (
            <p className="text-sm text-gray-500 mt-2">Type at least 3 characters to search</p>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching for "{query}"...
          </div>
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2 mt-4">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showMinLengthMessage && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keep typing...</h3>
            <p className="text-gray-600">Enter at least 3 characters to start searching</p>
          </CardContent>
        </Card>
      )}

      {showNoResults && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">No RSS feeds found for "{query}". Try searching with different keywords.</p>
          </CardContent>
        </Card>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Found {results.length} feed{results.length !== 1 ? "s" : ""} for "{query}"
            </h2>
            {query && (
              <Button variant="outline" size="sm" onClick={handleClearSearch}>
                <X className="h-4 w-4 mr-2" />
                Clear search
              </Button>
            )}
          </div>
          {results.map((result) => (
            <SearchResultCard
              key={result.id}
              result={result}
              onFollow={handleFollow}
              isFollowing={followingIds.find((f) => f.id === result.feedId)}
              isLoading={followLoading.has(result.feedId)}
              followPriority={(result as any).priority}
              onUnfollow={() => handleUnfollow(result.feedId)}
            />
          ))}
        </div>
      )}

      {!hasSearched && !query && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search for RSS feeds</h3>
            <p className="text-gray-600 mb-4">
              Start typing to discover RSS feeds from your favorite websites and blogs
            </p>
            <div className="text-sm text-gray-500">
              <p>Try searching for:</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {["BBC News", "TechCrunch", "The Verge", "Hacker News", "Reddit"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </ContentWrapper>
  )
}
