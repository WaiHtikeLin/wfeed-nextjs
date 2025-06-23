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
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get posts from the specific source
    const [posts] = await db.execute(
      `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.summary,
        p.url,
        p.author,
        p.published_at,
        p.image_url,
        s.title as source_title,
        s.icon_url as source_icon_url,
        s.website_url as source_website_url
      FROM posts p
      JOIN rss_sources s ON p.source_id = s.id
      WHERE s.id = ?
      ORDER BY p.published_at DESC
      LIMIT ? OFFSET ?
    `,
      [sourceId, limit, offset],
    )

    const formattedPosts = Array.isArray(posts)
      ? posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          summary: post.summary,
          url: post.url,
          author: post.author,
          publishedAt: post.published_at,
          imageUrl: post.image_url,
          source: {
            title: post.source_title,
            iconUrl: post.source_icon_url,
            websiteUrl: post.source_website_url,
          },
        }))
      : []

    return NextResponse.json({ posts: formattedPosts })
  } catch (error) {
    console.error("Get source posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
