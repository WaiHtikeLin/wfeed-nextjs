import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { format } from "date-fns"
import { verifyToken } from "@/lib/auth"

export default async function HomePage() {
  // Check if user is authenticated
  const cookieStore = await cookies()
  const authToken = cookieStore.get("auth-token")?.value

  let isAuthenticated = false

  if (authToken) {
    const user = verifyToken(authToken)
    isAuthenticated = !!user
  }

  const today = new Date()
  const todayFormatted = format(today, "dd-MM-yyyy")

  if (isAuthenticated) {
    // Authenticated users go to their personalized feed
    redirect("/feed")
  } else {
    // Unauthenticated users go to public date posts
    redirect(`/date/${todayFormatted}/posts`)
  }
}
