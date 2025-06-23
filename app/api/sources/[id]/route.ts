import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sourceId = params.id

    // Get source details with subscription info
    const [sources] = await db.execute(
      `
      SELECT 
        s.id,
        s.feedly_id,
        s.title,
        s.description,
        s.website_url,
        s.feed_url,
        s.icon_url,
        s.created_at,
        COUNT(p.id) as post_count,
        us.priority,
        CASE WHEN us.id IS NOT NULL THEN 1 ELSE 0 END as is_following
      FROM rss_sources s
      LEFT JOIN posts p ON s.id = p.source_id
      LEFT JOIN user_subscriptions us ON s.id = us.source_id AND us.user_id = ?
      WHERE s.id = ?
      GROUP BY s.id, us.priority, us.id
    `,
      [user.id, sourceId],
    )

    if (!Array.isArray(sources) || sources.length === 0) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 })
    }

    const source = sources[0] as any

    const formattedSource = {
      id: source.id,
      feedlyId: source.feedly_id,
      title: source.title,
      description: source.description,
      websiteUrl: source.website_url,
      feedUrl: source.feed_url,
      iconUrl: source.icon_url,
      createdAt: source.created_at,
      postCount: Number(source.post_count),
      isFollowing: Boolean(source.is_following),
      priority: source.priority,
    }

    return NextResponse.json({ source: formattedSource })
  } catch (error) {
    console.error("Get source error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
