#!/usr/bin/env node

/**
 * Background job to fetch posts from top RSS sources (marked with is_top = TRUE)
 */

const mysql = require("mysql2/promise")
const Parser = require("rss-parser")
const cheerio = require("cheerio")
const he = require("he")
const { v4: uuidv4 } = require("uuid")

// Database connection
const createConnection = async () => {
  return mysql.createConnection({
    host: process.env.DATABASE_HOST || "localhost",
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "rss_reader",
  })
}

// Create RSS parser
const createParser = () => {
  return new Parser({
    timeout: 10000,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; RSS Reader Bot/1.0)",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
    customFields: {
      feed: ["language", "lastBuildDate", "ttl", "image"],
      item: [
        "creator",
        "summary",
        "content:encoded",
        "dc:creator",
        "media:content",
        "media:thumbnail",
        "enclosure",
        "guid",
        "categories",
      ],
    },
    requestOptions: {
      rejectUnauthorized: false,
    },
  })
}

// Parse RSS feed
const parseRSSFeed = async (feedUrl) => {
  try {
    console.log(`🔍 Parsing RSS feed: ${feedUrl}`)

    let cleanUrl = feedUrl.trim()
    if (!cleanUrl.startsWith("http")) {
      cleanUrl = "https://" + cleanUrl
    }

    const parser = createParser()
    const feed = await parser.parseURL(cleanUrl)

    console.log(`✅ Successfully parsed: ${feed.title}`)
    console.log(`📄 Found ${feed.items?.length || 0} items`)

    if (!feed.items || feed.items.length === 0) {
      return {
        title: feed.title || "Unknown Feed",
        description: feed.description,
        items: [],
      }
    }

    const processedItems = feed.items.map((item) => {
      const content = getItemContent(item)
      const description = getItemDescription(item)
      const author = getItemAuthor(item)
      const pubDate = getItemPubDate(item)

      return {
        title: cleanText(item.title || "Untitled"),
        link: item.link || "",
        description: description,
        content: content,
        pubDate: pubDate,
        author: author,
        guid: item.guid || item.link,
        categories: item.categories || [],
      }
    })

    return {
      title: cleanText(feed.title || "Unknown Feed"),
      description: cleanText(feed.description),
      items: processedItems,
    }
  } catch (error) {
    console.error(`❌ RSS parsing error for: ${feedUrl}`, error.message)
    return null
  }
}

// Helper functions (same as before)
function getItemContent(item) {
  const contentSources = [item["content:encoded"], item.content, item.summary, item.contentSnippet, item.description]

  for (const source of contentSources) {
    if (source && typeof source === "string" && source.trim()) {
      return cleanHtmlContent(source)
    }
  }
  return undefined
}

function getItemDescription(item) {
  const descSources = [item.summary, item.contentSnippet, item.description, item["content:encoded"], item.content]

  for (const source of descSources) {
    if (source && typeof source === "string" && source.trim()) {
      const cleaned = cleanHtmlContent(source)
      return cleaned.length > 500 ? cleaned.substring(0, 500) + "..." : cleaned
    }
  }
  return undefined
}

function getItemAuthor(item) {
  const authorSources = [item["dc:creator"], item.creator, item.author]

  for (const source of authorSources) {
    if (source && typeof source === "string" && source.trim()) {
      return cleanText(source)
    }
  }
  return undefined
}

function getItemPubDate(item) {
  if (item.isoDate) {
    return item.isoDate
  }

  if (item.pubDate) {
    try {
      const date = new Date(item.pubDate)
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    } catch (error) {
      console.warn(`Invalid date format: ${item.pubDate}`)
    }
  }

  return new Date().toISOString()
}

function extractImageFromContent(content) {
  if (!content) return null

  try {
    const $ = cheerio.load(content)

    const selectors = [
      'img[src*="featured"]',
      'img[class*="featured"]',
      ".featured-image img",
      ".post-thumbnail img",
      "img[width][height]",
      "img",
    ]

    for (const selector of selectors) {
      const img = $(selector).first()
      const src = img.attr("src")

      if (src && isValidImageUrl(src)) {
        if (src.startsWith("//")) {
          return "https:" + src
        } else if (src.startsWith("http")) {
          return src
        }
      }
    }

    const imageUrlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s]*)?)/gi
    const matches = content.match(imageUrlRegex)
    if (matches && matches.length > 0) {
      return matches[0]
    }
  } catch (error) {
    console.warn("Error extracting image:", error.message)
  }

  return null
}

function isValidImageUrl(url) {
  if (!url || url.length < 10) return false

  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i
  if (imageExtensions.test(url)) return true

  const imageHosts = ["imgur.com", "i.redd.it", "cdn.", "images.", "img.", "static.", "media.", "assets."]
  return imageHosts.some((host) => url.includes(host))
}

function cleanHtmlContent(html) {
  if (!html) return ""

  try {
    const $ = cheerio.load(html)
    $("script, style, noscript, iframe, embed, object").remove()

    let text = $.text()
    text = he.decode(text)
    text = text
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim()

    return text
  } catch (error) {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim()
  }
}

function cleanText(text) {
  if (!text) return ""

  try {
    let cleaned = he.decode(text)
    cleaned = cleaned.replace(/<[^>]*>/g, "")
    cleaned = cleaned.replace(/\s+/g, " ").trim()
    return cleaned
  } catch (error) {
    return text.replace(/\s+/g, " ").trim()
  }
}

// Main job function
const runTopPostsFetchJob = async () => {
  let connection

  try {
    console.log("🚀 Starting top RSS sources fetch job...")
    const startTime = Date.now()

    connection = await createConnection()
    console.log("✅ Database connected")

    // Get all top RSS sources (is_top = TRUE)
    const [sources] = await connection.execute(`
      SELECT id, title, feed_url, website_url, icon_url, description
      FROM rss_sources
      WHERE is_top = TRUE
      ORDER BY title
    `)

    if (!sources.length) {
      console.log("ℹ️ No top RSS sources found")
      return
    }

    console.log(`📡 Processing ${sources.length} top RSS sources`)

    let totalNewPosts = 0
    let processedSources = 0
    let errorSources = 0

    for (const source of sources) {
      try {
        console.log(`\n🔍 Processing: ${source.title}`)
        processedSources++

        const feed = await parseRSSFeed(source.feed_url)
        if (!feed || !feed.items.length) {
          console.log(`⚠️ No posts found`)
          continue
        }

        console.log(`📄 Processing ${feed.items.length} posts`)

        let newPostsForSource = 0
        for (const item of feed.items) {
          try {
            // Check if post exists
            const [existingPosts] = await connection.execute("SELECT id FROM posts WHERE url = ? AND source_id = ?", [
              item.link,
              source.id,
            ])

            if (existingPosts.length > 0) {
              continue
            }

            const postId = uuidv4()
            const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date()
            const imageUrl = extractImageFromContent(item.content || item.description || "")
            const summary = item.description || ""

            await connection.execute(
              `
              INSERT INTO posts (id, source_id, title, content, summary, url, author, published_at, image_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
              [
                postId,
                source.id,
                item.title,
                item.content,
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
            console.error(`❌ Error inserting post: ${item.title}`, postError.message)
          }
        }

        console.log(`✅ Added ${newPostsForSource} new posts`)
      } catch (feedError) {
        errorSources++
        console.error(`❌ Error processing ${source.title}:`, feedError.message)
      }
    }

    const duration = Date.now() - startTime
    const successRate = (((processedSources - errorSources) / processedSources) * 100).toFixed(1)

    console.log(`\n🎉 Top RSS sources fetch completed!`)
    console.log(`📊 Stats:`)
    console.log(`   • Processed: ${processedSources}/${sources.length} sources`)
    console.log(`   • Success rate: ${successRate}%`)
    console.log(`   • New posts: ${totalNewPosts}`)
    console.log(`   • Duration: ${(duration / 1000).toFixed(2)}s`)
  } catch (error) {
    console.error("❌ Job failed:", error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log("🔌 Database connection closed")
    }
  }
}

// Run the job
if (require.main === module) {
  runTopPostsFetchJob()
    .then(() => {
      console.log("✅ Top RSS sources fetch completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Job failed:", error)
      process.exit(1)
    })
}

module.exports = { runTopPostsFetchJob }
