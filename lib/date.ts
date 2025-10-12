import { parseISO, isValid, format as formatDateFn, subDays, addDays } from "date-fns"

// Parse URL date in DD-MM-YYYY format and return a Date or null
export function parseUrlDate(dateParam: string): Date | null {
  try {
    const parts = dateParam.split("-")
    if (parts.length !== 3) return null

    const day = Number.parseInt(parts[0], 10)
    const month = Number.parseInt(parts[1], 10)
    const year = Number.parseInt(parts[2], 10)

    if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2020 || year > 2030) return null

    const isoDateString = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`
    const date = parseISO(isoDateString)
    return isValid(date) ? date : null
  } catch {
    return null
  }
}

export function formatDateForDb(date: Date): string {
  return formatDateFn(date, "yyyy-MM-dd")
}

export function formatDateForUrl(date: Date): string {
  return formatDateFn(date, "dd-MM-yyyy")
}

export function getAdjacentDates(date: Date) {
  const previousDate = subDays(date, 1)
  const nextDate = addDays(date, 1)
  const today = new Date()
  const isToday = formatDateFn(date, "yyyy-MM-dd") === formatDateFn(today, "yyyy-MM-dd")
  const isFuture = date > today
  return { previousDate, nextDate, isToday, isFuture }
}
