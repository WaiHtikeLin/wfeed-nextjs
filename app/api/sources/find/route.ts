import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import db from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    // const user = getUserFromRequest(request)
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { feedId, title, description, website, iconUrl } = await request.json()

    if (!feedId || !title) {
      return NextResponse.json({ error: "Feed ID and title are required" }, { status: 400 })
    }

    // Convert Feedly ID to actual RSS feed URL
    let actualFeedUrl = feedId
    if (feedId.startsWith("feed/")) {
      actualFeedUrl = feedId.replace("feed/", "")
    }

    // Check if source already exists
    const [existingSources] = await db.execute("SELECT id FROM rss_sources WHERE feedly_id = ?", [feedId])

    let sourceId: string

    if (Array.isArray(existingSources) && existingSources.length > 0) {
      // Source exists, return its ID
      sourceId = (existingSources[0] as any).id
    } else {
      // Create new source - ensure no undefined values are passed to SQL
      sourceId = uuidv4()
      await db.execute(
        `
        INSERT INTO rss_sources (id, feedly_id, title, description, website_url, feed_url, icon_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          sourceId,
          feedId,
          title,
          description || null, // Convert undefined to null
          website || null, // Convert undefined to null
          actualFeedUrl,
          iconUrl || null, // Convert undefined to null
        ],
      )

      // Fetch posts for the new source
      try {
        const { parseRSSFeed, extractImageFromContent } = await import("@/lib/rss-parser")
        const feed = await parseRSSFeed(actualFeedUrl)
        if (feed && feed.items && feed.items.length > 0) {
          for (const item of feed.items) {
            // Check if post exists
            const [existingPosts] = await db.execute(
              "SELECT id FROM posts WHERE url = ? AND source_id = ?",
              [item.link, sourceId]
            )
            if (Array.isArray(existingPosts) && existingPosts.length > 0) continue
            const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date()
            const imageUrl = item.content ? extractImageFromContent(item.content) : null
            await db.execute(
              `INSERT INTO posts (id, source_id, title, content, summary, url, author, published_at, image_url)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                uuidv4(),
                sourceId,
                item.title,
                item.content,
                item.description || null,
                item.link,
                item.author || null,
                publishedAt,
                imageUrl,
              ]
            )
          }
        }
      } catch (fetchErr) {
        console.error("Error fetching posts for new source:", fetchErr)
      }
    }

    return NextResponse.json({ sourceId })
  } catch (error) {
    console.error("Find/create source error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
