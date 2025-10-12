import db from "@/lib/db"
import { format } from "date-fns"

export interface PublicPost {
  id: string
  title: string
  content?: string
  summary?: string
  url: string
  author?: string
  publishedAt: string
  imageUrl?: string
  source: {
    id: string
    title: string
    iconUrl?: string
    websiteUrl?: string
    description?: string
  }
}

export async function getPostsForDate(date: Date): Promise<PublicPost[]> {
  const dateStr = format(date, "yyyy-MM-dd")
  try {
    const [rows] = await db.execute(
      `
      SELECT p.id, p.title, p.content, p.summary, p.url, p.author, p.published_at, p.image_url,
             s.id as source_id, s.title as source_title, s.icon_url as source_icon_url,
             s.website_url as source_website_url, s.description as source_description
      FROM posts p
      JOIN rss_sources s ON p.source_id = s.id
      WHERE s.is_top = TRUE
        AND DATE(p.published_at) = ?
      ORDER BY p.published_at DESC
    `,
      [dateStr],
    )

    if (!Array.isArray(rows)) return []

    return rows.map((post: any) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      summary: post.summary,
      url: post.url,
      author: post.author,
      publishedAt: post.published_at,
      imageUrl: post.image_url,
      source: {
        id: post.source_id,
        title: post.source_title,
        iconUrl: post.source_icon_url,
        websiteUrl: post.source_website_url,
        description: post.source_description,
      },
    }))
  } catch (error) {
    console.error("getPostsForDate error:", error)
    return []
  }
}
