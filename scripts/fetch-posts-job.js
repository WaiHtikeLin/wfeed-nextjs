#!/usr/bin/env node

/**
 * Background RSS Fetch Job with improved RSS parsing
 *
 * This script fetches posts from all RSS sources in the database using
 * the rss-parser library for better reliability and accuracy.
 */

// Load environment variables from .env when running the script manually
try { require('dotenv').config() } catch (e) {}

const mysql = require("mysql2/promise")
const Parser = require("rss-parser")
const cheerio = require("cheerio")
const he = require("he")
const { v4: uuidv4 } = require("uuid")
const pLimit = require('p-limit')

// Database pool
const createPool = () => {
  const limit = parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10)
  return mysql.createPool({
    host: process.env.DATABASE_HOST || "localhost",
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "rss_reader",
    waitForConnections: true,
    connectionLimit: limit,
  })
}

// Create RSS parser with custom options
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

// Enhanced RSS parsing function
const parseRSSFeed = async (feedUrl) => {
  try {
    console.log(`🔍 Parsing RSS feed: ${feedUrl}`)

    let cleanUrl = feedUrl.trim()
    if (!cleanUrl.startsWith("http")) {
      cleanUrl = "https://" + cleanUrl
    }

    // If reddit feed, fetch manually to avoid CORS issues and parse the content
    if (cleanUrl.includes("reddit.com") && cleanUrl.endsWith("/.rss")) {
      return await parseRedditFeed(cleanUrl)
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

    // Process items with better content extraction
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

async function parseRedditFeed(feedUrl) {
  try {
    console.log(`🔍 Parsing Reddit feed: ${feedUrl}`)
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RSS Reader Bot/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const xmlText = await response.text()
    const parser = createParser()
    const feed = await parser.parseString(xmlText)
    console.log(`✅ Successfully parsed Reddit feed: ${feed.title}`)
    return {
      title: cleanText(feed.title || "Unknown Feed"),
      description: cleanText(feed.description),
      items: feed.items?.map((item) => ({
        title: cleanText(item.title || "Untitled"),
        link: item.link || "",
        description: getItemDescription(item),
        content: getItemContent(item),
        pubDate: getItemPubDate(item),
        author: getItemAuthor(item),
        guid: item.guid || item.link,
        categories: item.categories || [],
      })) || []
    }
  } catch (error) {
    console.error(`❌ Error parsing Reddit feed: ${feedUrl}`, error)
    return null
  }
}

// Helper functions
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
      return cleanHtmlContent(source)
      // return cleaned.length > 500 ? cleaned.substring(0, 500) + "..." : cleaned
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

  return new Date().toISOString() // Fallback to current time
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

    // Fallback: regex search
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

const convertFeedlyIdToRssUrl = (feedlyId) => {
  if (feedlyId.startsWith("feed/")) {
    return feedlyId.replace("feed/", "")
  }
  return feedlyId
}

// Main job function
const runFetchJob = async () => {
  let connection

  try {
    console.log("🚀 Starting enhanced RSS fetch job...")
    const startTime = Date.now()

    connection = await createConnection()
    console.log("✅ Database connected")

    const [sources] = await connection.execute(`
      SELECT id, feed_url, feedly_id, title as source_title, website
      FROM rss_sources where last_fetched_at IS NULL OR last_fetched_at < NOW() - INTERVAL 5 MINUTE
      ORDER BY created_at DESC LIMIT 100
    `)

    if (!sources.length) {
      console.log("ℹ️ No RSS sources found")
      return
    }

    console.log(`📡 Processing ${sources.length} RSS sources`)

    let totalNewPosts = 0
    let updatedSources = 0
    let processedSources = 0
    let errorSources = 0

    // configure web-push if VAPID keys are present
    let webpush = null
    try {
      const vp = process.env.VAPID_PUBLIC_KEY
      const vk = process.env.VAPID_PRIVATE_KEY
      const vs = process.env.VAPID_SUBJECT || process.env.VAPID_VAPID_SUBJECT || 'mailto:admin@example.com'
      if (vp && vk) {
        webpush = require('web-push')
        webpush.setVapidDetails(vs, vp, vk)
        console.log('🔐 web-push configured with VAPID keys')
      } else {
        console.warn('web-push VAPID keys missing in environment; push notifications will be skipped')
      }
    } catch (e) {
      console.warn('web-push initialization failed, push notifications will be skipped', e && e.message)
      webpush = null
    }

    // extract per-source processing so we can run in parallel with controlled concurrency
    const processSource = async (source, pool, webpush) => {
      console.log(`\n🔍 Processing: ${source.source_title}`)
      processedSources++

      try {
        let feedUrl = source.feed_url

        if (!feedUrl || feedUrl === source.feedly_id || feedUrl.startsWith("feed/")) {
          feedUrl = convertFeedlyIdToRssUrl(source.feedly_id)
          await pool.execute("UPDATE rss_sources SET feed_url = ? WHERE id = ?", [feedUrl, source.id])
          console.log(`✅ Updated feed URL: ${feedUrl}`)
          return { newPosts: 0, updated: 1, error: 0 }
        }

        // If the website is a YouTube channel, convert it to the corresponding feed URL
        if (source.website && source.website.includes("youtube.com/playlist")) {
          const playlistIdMatch = source.website.match(/youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/)  
          if (playlistIdMatch && playlistIdMatch[1]) {
            feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistIdMatch[1]}`
            console.log(`🔄 Converted YouTube playlist URL to feed URL: ${feedUrl}`)
          }
        }

        const feed = await parseRSSFeed(feedUrl)
        if (!feed || !feed.items.length) {
          console.log(`⚠️ No posts found`)
          return { newPosts: 0, updated: 0, error: 0 }
        }

        console.log(`📄 Processing ${feed.items.length} posts`)

        let newPostsForSource = 0

        // get Max pubDate from existing posts to avoid duplicates
        const [maxPostDateRows] = await pool.execute(
          "SELECT MAX(published_at) as max_date FROM posts WHERE source_id = ?",
          [source.id]
        )

        const maxDate = maxPostDateRows[0]?.max_date ? new Date(maxPostDateRows[0].max_date) : null
        let postError = null
        
        for (const item of feed.items) {
          try {
            const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date()
            if (maxDate && publishedAt <= maxDate) {
              continue
            }

            const postId = uuidv4()
            const imageUrl = extractImageFromContent(item.content || item.description || "")
            const summary = item.description || ""

            await pool.execute(
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
          } catch (postError) {
            console.error(`❌ Error inserting post: ${item.title}`, postError.message)
          }
        }

        if (!postError)
          await pool.execute("UPDATE rss_sources SET last_fetched_at = ? WHERE id = ?", [new Date(), source.id])

        console.log(`✅ Added ${newPostsForSource} new posts`)

        // Send web push notifications to followers of this source
        if (webpush && newPostsForSource > 0) {
          try {
            // get follower user_ids for this source (adjust table name if different)
            const [followers] = await pool.execute('SELECT user_id FROM user_subscriptions WHERE allow_noti is true and source_id = ?', [source.id])
            console.log(`👥 Notifying ${followers.length} followers`)
            if (followers.length > 0) {
              const userIds = followers.map(f => f.user_id)
              // fetch subscriptions for these users
              const placeholders = userIds.map(() => '?').join(',')
              const [subs] = await pool.execute(
                `SELECT id, user_id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id IN (${placeholders})`,
                userIds
              )

              const payload = {
                title: `New posts from ${source.source_title}`,
                body: `${newPostsForSource} new post${newPostsForSource > 1 ? 's' : ''}`,
                url: `/source/${source.id}`,
                icon: '/logo.png'
              }

              console.log(`🚀 Sending notifications to ${subs.length} subscriptions`)
              for (const s of subs) {
                const pushSubscription = {
                  endpoint: s.endpoint,
                  keys: { p256dh: s.p256dh, auth: s.auth }
                }
                try {
                  await webpush.sendNotification(pushSubscription, JSON.stringify(payload))
                } catch (err) {
                  console.warn('Push send error', err && err.statusCode ? err.statusCode : err, s.id)
                  // remove invalid subscriptions
                  const statusCode = err && err.statusCode
                  if (statusCode === 410 || statusCode === 404) {
                    await pool.execute('DELETE FROM push_subscriptions WHERE id = ?', [s.id])
                  }
                }
              }
            }
          } catch (notifyErr) {
            console.error('Error sending notifications for source', source.id, notifyErr)
          }
        }

        return { newPosts: newPostsForSource, updated: 0, error: 0 }
      } catch (feedError) {
        console.error(`❌ Error processing ${source.source_title}:`, feedError.message)
        return { newPosts: 0, updated: 0, error: 1 }
      }
    }

    // run sources with limited concurrency
    const concurrency = 10
    const limit = pLimit(concurrency)
    const tasks = sources.map(s => limit(() => processSource(s, pool, webpush)))
    const results = await Promise.all(tasks)

    for (const r of results) {
      totalNewPosts += r.newPosts || 0
      updatedSources += r.updated || 0
      errorSources += r.error || 0
    }

    const duration = Date.now() - startTime
    const successRate = (((processedSources - errorSources) / processedSources) * 100).toFixed(1)

    console.log(`\n🎉 Enhanced RSS fetch completed!`)
    console.log(`📊 Stats:`)
    console.log(`   • Processed: ${processedSources}/${sources.length} sources`)
    console.log(`   • Success rate: ${successRate}%`)
    console.log(`   • New posts: ${totalNewPosts}`)
    console.log(`   • Updated URLs: ${updatedSources}`)
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
  runFetchJob()
    .then(() => {
      console.log("✅ Enhanced RSS fetch completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Job failed:", error)
      process.exit(1)
    })
}

module.exports = { runFetchJob }
