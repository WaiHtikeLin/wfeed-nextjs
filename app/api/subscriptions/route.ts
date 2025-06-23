import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import db from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { feedId, title, description, website, iconUrl, priority } = await request.json()

    if (!feedId || !title) {
      return NextResponse.json({ error: "Feed ID and title are required" }, { status: 400 })
    }

    console.log(`➕ API: Adding/updating subscription "${title}" with priority "${priority}" - User: ${user.email}`)

    // Convert Feedly ID to actual RSS feed URL
    let actualFeedUrl = feedId
    if (feedId.startsWith("feed/")) {
      actualFeedUrl = feedId.replace("feed/", "")
    }

    // First, ensure the RSS source exists
    const sourceId = uuidv4()

    // Try to insert the source, or get existing one
    try {
      await db.execute(
        `
        INSERT INTO rss_sources (id, feedly_id, title, description, website_url, feed_url, icon_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = COALESCE(VALUES(description), description),
          website_url = COALESCE(VALUES(website_url), website_url),
          icon_url = COALESCE(VALUES(icon_url), icon_url),
          feed_url = VALUES(feed_url)
      `,
        [sourceId, feedId, title, description || null, website || null, actualFeedUrl, iconUrl || null],
      )
    } catch (sourceError) {
      console.error("Source insert error:", sourceError)
    }

    // Get the actual source ID
    const [sources] = await db.execute("SELECT id FROM rss_sources WHERE feedly_id = ?", [feedId])
    const actualSourceId = Array.isArray(sources) && sources.length > 0 ? (sources[0] as any).id : sourceId

    console.log(`📝 Using source ID: ${actualSourceId}`)

    // Now handle the subscription - either insert or update
    const subscriptionId = uuidv4()

    try {
      await db.execute(
        `
        INSERT INTO user_subscriptions (id, user_id, source_id, priority)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          priority = VALUES(priority)
      `,
        [subscriptionId, user.id, actualSourceId, priority || "normal"],
      )

      console.log(`✅ API: Subscription updated successfully with priority: ${priority}`)
    } catch (subscriptionError) {
      console.error("Subscription error:", subscriptionError)
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
    }

    // Verify the subscription was created/updated
    const [verification] = await db.execute(
      "SELECT priority FROM user_subscriptions WHERE user_id = ? AND source_id = ?",
      [user.id, actualSourceId],
    )

    if (Array.isArray(verification) && verification.length > 0) {
      const actualPriority = (verification[0] as any).priority
      console.log(`✅ Verified subscription priority: ${actualPriority}`)
    }

    // No caching for subscription changes
    const response = NextResponse.json({
      success: true,
      sourceId: actualSourceId,
      priority: priority || "normal",
    })
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")

    return response
  } catch (error) {
    console.error("❌ Subscription error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`📋 API: Getting subscriptions - User: ${user.email}`)

    const [subscriptions] = await db.execute(
      `
      SELECT 
        s.feedly_id,
        s.title,
        s.description,
        s.website_url,
        s.icon_url,
        us.priority
      FROM user_subscriptions us
      JOIN rss_sources s ON us.source_id = s.id
      WHERE us.user_id = ?
      ORDER BY us.created_at DESC
    `,
      [user.id],
    )

    console.log(`✅ API: Returning ${Array.isArray(subscriptions) ? subscriptions.length : 0} subscriptions`)

    // Short cache for subscriptions (they don't change often)
    const response = NextResponse.json({ subscriptions })
    response.headers.set("Cache-Control", "private, max-age=60") // 1 minute cache

    return response
  } catch (error) {
    console.error("Get subscriptions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Disable caching for subscription modifications
export const dynamic = "force-dynamic"
export const revalidate = 0
