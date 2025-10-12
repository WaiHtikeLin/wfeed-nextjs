import React from "react"
import { DateNavigation } from "@/components/date-navigation"

export function DateHeader({
  formattedDate,
  isToday,
  isFuture,
  date,
  previousDate,
  nextDate,
}: {
  formattedDate: string
  isToday: boolean
  isFuture: boolean
  date: Date
  previousDate: Date
  nextDate: Date
}) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        News for {formattedDate}
        {isToday && <span className="text-blue-600 ml-2">(Today)</span>}
      </h1>
      <p className="text-lg text-gray-600 mb-6">Latest articles from top news sources</p>

      <DateNavigation
        currentDate={date}
        previousDate={previousDate}
        nextDate={nextDate}
        isToday={isToday}
        isFuture={isFuture}
      />
    </div>
  )
}

export default DateHeader
