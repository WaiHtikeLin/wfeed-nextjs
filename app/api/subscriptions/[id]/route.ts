import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import db from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let sourceId = params.id
    console.log(`🗑️ API: Unsubscribing from source ${sourceId} - User: ${user.email}`)

    if (sourceId.startsWith("feed/")) {
      type SourceRow = { id: string }
      const [source] = await db.execute("SELECT id FROM rss_sources WHERE feedly_id = ?", [sourceId]) as [SourceRow[], any]
      if (Array.isArray(source) && source.length > 0) {
        sourceId = source[0].id
      } else {
        console.log(`⚠️ Source not found for feedly_id: ${sourceId}`)
        return NextResponse.json({ error: "Source not found" }, { status: 404 })
      }
    }

    // Verify the subscription exists before deleting
    const [existing] = await db.execute("SELECT id FROM user_subscriptions WHERE user_id = ? AND source_id = ?", [
      user.id,
      sourceId,
    ])

    if (!Array.isArray(existing) || existing.length === 0) {

      console.log(`⚠️ No subscription found for source ${sourceId}`)
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Delete the subscription
    const [result] = await db.execute("DELETE FROM user_subscriptions WHERE user_id = ? AND source_id = ?", [
      user.id,
      sourceId,
    ])

    console.log(`✅ API: Unsubscribed successfully from source ${sourceId}`)

    const response = NextResponse.json({ success: true })
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")

    return response
  } catch (error) {
    console.error("❌ Unsubscribe error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
