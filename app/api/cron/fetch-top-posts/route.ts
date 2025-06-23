import { NextResponse } from "next/server"
import { parseRSSFeed, extractImageFromContent } from "@/lib/rss-parser"
import db from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    console.log("🔄 Starting top RSS sources fetch job...")
    const startTime = Date.now()

    // Get all top RSS sources (is_top = TRUE)
    const [sources] = await db.execute(`
      SELECT id, title, feed_url, website_url, icon_url, description
      FROM rss_sources
      WHERE is_top = TRUE
      ORDER BY title
    `)

    if (!Array.isArray(sources) || sources.length === 0) {
      console.log("ℹ️ No top RSS sources found")
      return NextResponse.json({
        message: "No top RSS sources found",
        sources: 0,
        newPosts: 0,
        duration: Date.now() - startTime,
      })
    }

    console.log(`📡 Found ${sources.length} top RSS sources to process`)

    let totalNewPosts = 0
    let processedSources = 0
    let errorSources = 0

    // Process each RSS source
    for (const source of sources as any[]) {
      try {
        console.log(`🔍 Processing: ${source.title}`)
        processedSources++

        const feed = await parseRSSFeed(source.feed_url)
        if (!feed || !feed.items.length) {
          console.log(`⚠️ No posts found for: ${source.title}`)
          continue
        }

        console.log(`📄 Found ${feed.items.length} posts for: ${source.title}`)

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

        console.log(`✅ Added ${newPostsForSource} new posts from ${source.title}`)
      } catch (feedError) {
        errorSources++
        console.error(`❌ Error fetching feed: ${source.title}`, feedError)
      }
    }

    const duration = Date.now() - startTime
    const successRate = (((processedSources - errorSources) / processedSources) * 100).toFixed(1)

    console.log(`🎉 Top RSS sources fetch completed:`)
    console.log(`   📊 Processed: ${processedSources}/${sources.length} sources`)
    console.log(`   ✅ Success rate: ${successRate}%`)
    console.log(`   📝 New posts: ${totalNewPosts}`)
    console.log(`   ⏱️ Duration: ${duration}ms`)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processedSources} top sources and fetched ${totalNewPosts} new posts`,
      stats: {
        totalSources: sources.length,
        processedSources,
        errorSources,
        successRate: `${successRate}%`,
        newPosts: totalNewPosts,
        duration: `${duration}ms`,
      },
    })
  } catch (error) {
    console.error("❌ Top RSS sources fetch job failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Top RSS sources fetch job failed",
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
