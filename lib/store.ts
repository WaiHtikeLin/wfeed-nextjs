"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { useCallback } from "react"

interface SearchResult {
  id: string
  title: string
  description?: string
  website?: string
  feedId: string
  iconUrl?: string
  subscribers?: number
}

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

interface SearchState {
  query: string
  results: SearchResult[]
  hasSearched: boolean
  followingIds: Set<string>
  setQuery: (query: string) => void
  setResults: (results: SearchResult[]) => void
  setHasSearched: (hasSearched: boolean) => void
  setFollowingIds: (ids: Set<string>) => void
  addFollowingId: (id: string) => void
  clearSearch: () => void
}

interface HomeState {
  posts: Post[]
  page: number
  hasMore: boolean
  scrollPosition: number
  lastFetchTime: number
  navigationId: string
  followStatusVersion: number
  setPosts: (posts: Post[]) => void
  addPosts: (posts: Post[]) => void
  setPage: (page: number) => void
  setHasMore: (hasMore: boolean) => void
  setScrollPosition: (position: number) => void
  setLastFetchTime: (time: number) => void
  setNavigationId: (id: string) => void
  setFollowStatusVersion: (version: number) => void
  resetPosts: () => void
  clearOnReload: () => void
  shouldRefreshData: () => boolean
}

// Simple search store without persistence
export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  results: [],
  hasSearched: false,
  followingIds: new Set<string>(),

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setHasSearched: (hasSearched) => set({ hasSearched }),
  setFollowingIds: (ids) => set({ followingIds: ids }),
  addFollowingId: (id) =>
    set((state) => ({
      followingIds: new Set([...state.followingIds, id]),
    })),
  clearSearch: () =>
    set({
      query: "",
      results: [],
      hasSearched: false,
    }),
}))

// Define createNavigationAwareStorage (replace with your actual implementation)
const createNavigationAwareStorage = () => {
  // Implement your navigation-aware storage logic here
  // This is a placeholder, replace it with your actual implementation
  return {
    getItem: (name: string) => {
      try {
        const item = localStorage.getItem(name)
        return item ? JSON.parse(item) : null
      } catch (e) {
        console.warn(`Error getting stored value for ${name}.`, e)
        return null
      }
    },
    setItem: (name: string, value: any) => {
      try {
        localStorage.setItem(name, JSON.stringify(value))
      } catch (e) {
        console.warn(`Error setting stored value for ${name}.`, e)
      }
    },
    removeItem: (name: string) => localStorage.removeItem(name),
  }
}

export const useHomeStore = create<HomeState>()(
  persist(
    (set, get) => ({
      posts: [],
      page: 1,
      hasMore: true,
      scrollPosition: 0,
      lastFetchTime: 0,
      navigationId: "",
      followStatusVersion: 0,

      setPosts: (posts) => set({ posts, lastFetchTime: Date.now() }),
      addPosts: (posts) =>
        set((state) => ({
          posts: [...state.posts, ...posts],
          lastFetchTime: Date.now(),
        })),
      setPage: (page) => {
        const current = get()
        if (current.page !== page) {
          set({ page })
        }
      },
      setHasMore: (hasMore) => {
        const current = get()
        if (current.hasMore !== hasMore) {
          set({ hasMore })
        }
      },
      setScrollPosition: (position) => {
        const current = get()
        if (Math.abs(current.scrollPosition - position) > 10) {
          set({ scrollPosition: position })
        }
      },
      setLastFetchTime: (time) => {
        const current = get()
        if (current.lastFetchTime !== time) {
          set({ lastFetchTime: time })
        }
      },
      setNavigationId: (id) => {
        const current = get()
        if (current.navigationId !== id) {
          set({ navigationId: id })
        }
      },
      setFollowStatusVersion: (version) => {
        const current = get()
        if (current.followStatusVersion !== version) {
          set({ followStatusVersion: version })
        }
      },
      resetPosts: () =>
        set({
          posts: [],
          page: 1,
          hasMore: true,
          scrollPosition: 0,
          lastFetchTime: 0,
        }),
      clearOnReload: () =>
        set({
          posts: [],
          page: 1,
          hasMore: true,
          scrollPosition: 0,
          lastFetchTime: 0,
          navigationId: "",
          followStatusVersion: 0,
        }),
      shouldRefreshData: () => {
        const state = get()
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000
        return now - state.lastFetchTime > fiveMinutes || state.posts.length === 0
      },
    }),
    {
      name: "rss-home-store",
      storage: createJSONStorage(() => createNavigationAwareStorage()),
      partialize: (state) => ({
        posts: state.posts,
        page: state.page,
        hasMore: state.hasMore,
        scrollPosition: state.scrollPosition,
        lastFetchTime: state.lastFetchTime,
        navigationId: state.navigationId,
        followStatusVersion: state.followStatusVersion,
      }),
    },
  ),
)

// Hook for scroll restoration with navigation awareness
// export const useScrollRestoration = (storeName: "search" | "home") => {
//   const searchStore = useSearchStore()
//   const homeStore = useHomeStore()

//   const store = storeName === "search" ? searchStore : homeStore

//   const saveScrollPosition = useCallback(() => {
//     const position = window.scrollY
//     store.setScrollPosition(position)
//   }, [store])

//   const restoreScrollPosition = useCallback(() => {
//     const position = store.scrollPosition
//     if (position > 0) {
//       // Use requestAnimationFrame to ensure DOM is ready
//       requestAnimationFrame(() => {
//         window.scrollTo({
//           top: position,
//           behavior: "instant",
//         })
//       })
//     }
//   }, [store.scrollPosition])

//   return { saveScrollPosition, restoreScrollPosition }
// }
