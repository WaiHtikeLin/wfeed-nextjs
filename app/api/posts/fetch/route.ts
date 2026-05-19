import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { parseRSSFeed, extractImageFromContent, cleanHtmlContent } from "@/lib/rss-parser"
import db from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

function convertFeedlyIdToRssUrl(feedlyId: string): string {
  // Convert Feedly ID to actual RSS feed URL
  if (feedlyId.startsWith("feed/")) {
    return feedlyId.replace("feed/", "")
  }
  return feedlyId
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all user's subscriptions
    const [subscriptions] = await db.execute(
      `
      SELECT s.id, s.feed_url, s.feedly_id, s.title as source_title
      FROM user_subscriptions us
      JOIN rss_sources s ON us.source_id = s.id
      WHERE us.user_id = ?
    `,
      [user.id],
    )

    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return NextResponse.json({ message: "No subscriptions found" })
    }

    let totalNewPosts = 0
    let updatedSources = 0

    // Fetch posts from each subscription
    for (const subscription of subscriptions as any[]) {
      try {
        console.log(`Processing: ${subscription.source_title}`)

        // Determine the correct feed URL
        let feedUrl = subscription.feed_url

        // If feed_url is the same as feedly_id or starts with "feed/", convert it
        if (!feedUrl || feedUrl === subscription.feedly_id || feedUrl.startsWith("feed/")) {
          feedUrl = convertFeedlyIdToRssUrl(subscription.feedly_id)

          // Update the database with the correct feed URL
          await db.execute("UPDATE rss_sources SET feed_url = ? WHERE id = ?", [feedUrl, subscription.id])
          updatedSources++
          console.log(`Updated feed URL for ${subscription.source_title}: ${feedUrl}`)
        }

        console.log(`Fetching posts from: ${subscription.source_title} (${feedUrl})`)

        const feed = await parseRSSFeed(feedUrl)
        if (!feed || !feed.items.length) {
          console.log(`No posts found for: ${subscription.source_title}`)
          continue
        }

        console.log(`Found ${feed.items.length} posts for: ${subscription.source_title}`)

        // Insert new posts
        for (const item of feed.items.slice(0, 10)) {
          // Limit to 10 most recent posts
          try {
            const postId = uuidv4()
            const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date()
            const imageUrl = extractImageFromContent(item.content || item.description || "") || null
            const summary = cleanHtmlContent(item.description || "").substring(0, 500)
            const titleVal = item.title || item.link || "Untitled"
            const contentVal = item.content || item.description || null
            const urlVal = item.link || null
            const authorVal = item.author || null

            // Check if post already exists
            const [existingPosts] = await db.execute("SELECT id FROM posts WHERE url = ? AND source_id = ?", [
              item.link,
              subscription.id,
            ])

            if (Array.isArray(existingPosts) && existingPosts.length > 0) {
              continue // Skip if post already exists
            }

            await db.execute(
              `
              INSERT INTO posts (id, source_id, title, content, summary, url, author, published_at, image_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
              [postId, subscription.id, titleVal, contentVal, summary, urlVal, authorVal, publishedAt, imageUrl],
            )

            totalNewPosts++
            console.log(`Added post: ${item.title}`)
          } catch (postError) {
            console.error(`Error inserting post: ${item.title}`, postError)
          }
        }
      } catch (feedError) {
        console.error(`Error fetching feed: ${subscription.source_title}`, feedError)
        console.error("Feed error details:", feedError)
      }
    }

    return NextResponse.json({
      message: `Successfully fetched ${totalNewPosts} new posts from ${subscriptions.length} sources. Updated ${updatedSources} feed URLs.`,
      newPosts: totalNewPosts,
      updatedSources,
    })
  } catch (error) {
    console.error("Fetch posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
