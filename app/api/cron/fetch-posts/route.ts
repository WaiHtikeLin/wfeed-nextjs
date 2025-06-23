import { NextResponse } from "next/server"
import { parseRSSFeed, extractImageFromContent } from "@/lib/rss-parser"
import db from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

function convertFeedlyIdToRssUrl(feedlyId: string): string {
  if (feedlyId.startsWith("feed/")) {
    return feedlyId.replace("feed/", "")
  }
  return feedlyId
}

export async function GET() {
  try {
    console.log("🔄 Starting enhanced background RSS fetch job...")
    const startTime = Date.now()

    // Get all RSS sources from the database
    const [sources] = await db.execute(`
      SELECT id, feed_url, feedly_id, title as source_title
      FROM rss_sources
      ORDER BY created_at DESC
    `)

    if (!Array.isArray(sources) || sources.length === 0) {
      console.log("ℹ️ No RSS sources found in database")
      return NextResponse.json({
        message: "No RSS sources found",
        sources: 0,
        newPosts: 0,
        duration: Date.now() - startTime,
      })
    }

    console.log(`📡 Found ${sources.length} RSS sources to process`)

    let totalNewPosts = 0
    let updatedSources = 0
    let processedSources = 0
    let errorSources = 0

    // Process each RSS source
    for (const source of sources as any[]) {
      try {
        console.log(`🔍 Processing: ${source.source_title}`)
        processedSources++

        // Determine the correct feed URL
        let feedUrl = source.feed_url

        // If feed_url is the same as feedly_id or starts with "feed/", convert it
        if (!feedUrl || feedUrl === source.feedly_id || feedUrl.startsWith("feed/")) {
          feedUrl = convertFeedlyIdToRssUrl(source.feedly_id)

          // Update the database with the correct feed URL
          await db.execute("UPDATE rss_sources SET feed_url = ? WHERE id = ?", [feedUrl, source.id])
          updatedSources++
          console.log(`✅ Updated feed URL for ${source.source_title}: ${feedUrl}`)
        }

        console.log(`📥 Fetching posts from: ${source.source_title} (${feedUrl})`)

        const feed = await parseRSSFeed(feedUrl)
        if (!feed || !feed.items.length) {
          console.log(`⚠️ No posts found for: ${source.source_title}`)
          continue
        }

        console.log(`📄 Found ${feed.items.length} posts for: ${source.source_title}`)

        // Insert ALL new posts (not limited to 10)
        let newPostsForSource = 0
        for (const item of feed.items) {
          try {
            const postId = uuidv4()
            const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date()
            const imageUrl = extractImageFromContent(item.content || item.description || "")
            const summary = item.description || ""

            // Check if post already exists
            const [existingPosts] = await db.execute("SELECT id FROM posts WHERE url = ? AND source_id = ?", [
              item.link,
              source.id,
            ])

            if (Array.isArray(existingPosts) && existingPosts.length > 0) {
              continue // Skip if post already exists
            }

            await db.execute(
              `
              INSERT INTO posts (id, source_id, title, content, summary, url, author, published_at, image_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
              [
                postId,
                source.id,
                item.title,
                item.content || item.description,
                summary,
                item.link,
                item.author || null,
                publishedAt,
                imageUrl,
              ],
            )

            newPostsForSource++
            totalNewPosts++
          } catch (postError) {
            console.error(`❌ Error inserting post: ${item.title}`, postError)
          }
        }

        console.log(`✅ Added ${newPostsForSource} new posts from ${source.source_title}`)
      } catch (feedError) {
        errorSources++
        console.error(`❌ Error fetching feed: ${source.source_title}`, feedError)
      }
    }

    const duration = Date.now() - startTime
    const successRate = (((processedSources - errorSources) / processedSources) * 100).toFixed(1)

    console.log(`🎉 Enhanced background fetch completed:`)
    console.log(`   📊 Processed: ${processedSources}/${sources.length} sources`)
    console.log(`   ✅ Success rate: ${successRate}%`)
    console.log(`   📝 New posts: ${totalNewPosts}`)
    console.log(`   🔧 Updated URLs: ${updatedSources}`)
    console.log(`   ⏱️ Duration: ${duration}ms`)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processedSources} sources and fetched ${totalNewPosts} new posts with enhanced RSS parsing`,
      stats: {
        totalSources: sources.length,
        processedSources,
        errorSources,
        successRate: `${successRate}%`,
        newPosts: totalNewPosts,
        updatedSources,
        duration: `${duration}ms`,
        parsingMethod: "rss-parser (enhanced)",
      },
    })
  } catch (error) {
    console.error("❌ Enhanced background fetch job failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Enhanced background fetch job failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Also support POST for manual triggers
export async function POST() {
  return GET()
}
