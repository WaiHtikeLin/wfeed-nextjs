"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface DateNavigationProps {
  currentDate: Date
  previousDate: Date
  nextDate: Date
  isToday: boolean
  isFuture: boolean
}

// Format date for URL (DD-MM-YYYY)
function formatDateForUrl(date: Date): string {
  return format(date, "dd-MM-yyyy")
}

export function DateNavigation({ currentDate, previousDate, nextDate, isToday, isFuture }: DateNavigationProps) {
  const [customDate, setCustomDate] = useState("")

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customDate) {
      // Convert from YYYY-MM-DD to DD-MM-YYYY
      const [year, month, day] = customDate.split("-")
      const urlDate = `${day}-${month}-${year}`
      window.location.href = `/date/${urlDate}/posts`
    }
  }

  const todayUrl = formatDateForUrl(new Date())

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
      {/* Previous Day */}
      <Link href={`/date/${formatDateForUrl(previousDate)}/posts`}>
        <Button variant="outline" className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          {format(previousDate, "MMM d")}
        </Button>
      </Link>

      {/* Today Button */}
      {!isToday && (
        <Link href={`/date/${todayUrl}/posts`}>
          <Button variant="default" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Today
          </Button>
        </Link>
      )}

      {/* Custom Date Picker */}
      <form onSubmit={handleDateSubmit} className="flex items-center gap-2">
        <Input
          type="date"
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          className="w-40"
          max={format(new Date(), "yyyy-MM-dd")} // Prevent future dates
        />
        <Button type="submit" variant="outline" size="sm">
          Go
        </Button>
      </form>

      {/* Next Day */}
      {!isFuture && (
        <Link href={`/date/${formatDateForUrl(nextDate)}/posts`}>
          <Button variant="outline" className="flex items-center gap-2">
            {format(nextDate, "MMM d")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  )
}
