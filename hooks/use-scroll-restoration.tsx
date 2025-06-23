"use client"

import { useEffect, useRef, useCallback } from "react"
import { useScrollRestoration } from "@/lib/store"

export function usePageScrollRestoration(storeName: "search" | "home", dependencies: any[] = []) {
  const { saveScrollPosition, restoreScrollPosition } = useScrollRestoration(storeName)
  const hasRestored = useRef(false)
  const isInitialized = useRef(false)
  const lastScrollPosition = useRef(0)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  // Restore scroll position when component mounts or dependencies change
  useEffect(() => {
    if (!hasRestored.current && dependencies.every((dep) => dep !== undefined && dep !== null)) {
      const timer = setTimeout(() => {
        restoreScrollPosition()
        hasRestored.current = true
        isInitialized.current = true
      }, 100) // Small delay to ensure content is rendered

      return () => clearTimeout(timer)
    }
  }, dependencies)

  // Optimized scroll handler with debouncing and position checking
  const handleScroll = useCallback(() => {
    if (!isInitialized.current) return

    const currentPosition = window.scrollY

    // Only save if position has changed significantly (more than 10px)
    if (Math.abs(currentPosition - lastScrollPosition.current) > 10) {
      lastScrollPosition.current = currentPosition

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Debounce the save operation
      scrollTimeoutRef.current = setTimeout(() => {
        saveScrollPosition()
      }, 150)
    }
  }, [saveScrollPosition])

  // Save scroll position on scroll and before navigation
  useEffect(() => {
    if (!isInitialized.current) return

    const handleBeforeUnload = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      saveScrollPosition()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
        saveScrollPosition()
      }
    }

    // Use passive listener for better performance
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      saveScrollPosition()
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [handleScroll, saveScrollPosition])

  return { saveScrollPosition, restoreScrollPosition }
}
