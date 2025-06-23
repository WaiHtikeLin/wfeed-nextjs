import Parser from "rss-parser"
import * as cheerio from "cheerio"
import he from "he"

interface CustomFeed {
  title?: string
  description?: string
  link?: string
  language?: string
  lastBuildDate?: string
  pubDate?: string
  ttl?: string
  image?: {
    url?: string
    title?: string
    link?: string
  }
}

interface CustomItem {
  title?: string
  link?: string
  pubDate?: string
  creator?: string
  summary?: string
  content?: string
  contentSnippet?: string
  guid?: string
  categories?: string[]
  isoDate?: string
  description?: string
  author?: string
  enclosure?: {
    url: string
    type?: string
    length?: string
  }
  itunes?: {
    image?: string
    duration?: string
    summary?: string
  }
  "media:content"?: {
    $: {
      url: string
      type?: string
      medium?: string
    }
  }
  "content:encoded"?: string
  "dc:creator"?: string
  "media:thumbnail"?: {
    $: {
      url: string
    }
  }
}

type CustomParser = Parser<CustomFeed, CustomItem>

interface RSSItem {
  title: string
  link: string
  description?: string
  pubDate?: string
  author?: string
  content?: string
  guid?: string
  categories?: string[]
  enclosure?: {
    url: string
    type: string
  }
}

interface RSSFeed {
  title: string
  description?: string
  link?: string
  items: RSSItem[]
  lastBuildDate?: string
  language?: string
}

// Create parser with custom options
const createParser = (): CustomParser => {
  return new Parser({
    timeout: 10000, // 10 second timeout
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
        "description",
        "author",
      ],
    },
    requestOptions: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  })
}

export async function parseRSSFeed(feedUrl: string): Promise<RSSFeed | null> {
  try {
    console.log(`🔍 Parsing RSS feed: ${feedUrl}`)

    // Clean up the feed URL
    let cleanUrl = feedUrl.trim()
    if (!cleanUrl.startsWith("http")) {
      cleanUrl = "https://" + cleanUrl
    }

    const parser = createParser()
    const feed = await parser.parseURL(cleanUrl)

    console.log(`✅ Successfully parsed feed: ${feed.title}`)
    console.log(`📄 Found ${feed.items?.length || 0} items`)

    if (!feed.items || feed.items.length === 0) {
      console.log(`⚠️ No items found in feed: ${cleanUrl}`)
      return {
        title: feed.title || "Unknown Feed",
        description: feed.description,
        link: feed.link,
        items: [],
        lastBuildDate: feed.lastBuildDate,
        language: feed.language,
      }
    }

    // Process and clean up items
    const processedItems: RSSItem[] = feed.items.map((item) => {
      // Get the best available content
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
        enclosure: item.enclosure
          ? {
              url: item.enclosure.url,
              type: item.enclosure.type || "unknown",
            }
          : undefined,
      }
    })

    return {
      title: cleanText(feed.title || "Unknown Feed"),
      description: cleanText(feed.description),
      link: feed.link,
      items: processedItems,
      lastBuildDate: feed.lastBuildDate,
      language: feed.language,
    }
  } catch (error) {
    console.error(`❌ RSS parsing error for URL: ${feedUrl}`, error)

    // Try alternative parsing methods for problematic feeds
    if (error instanceof Error && error.message.includes("Non-whitespace before first tag")) {
      console.log(`🔄 Trying alternative parsing method for: ${feedUrl}`)
      return await parseWithFetch(feedUrl)
    }

    return null
  }
}

// Alternative parsing method using fetch + manual parsing
async function parseWithFetch(feedUrl: string): Promise<RSSFeed | null> {
  try {
    console.log(`🔄 Using fetch method for: ${feedUrl}`)

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RSS Reader Bot/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    let xmlText = await response.text()

    // Clean up common XML issues
    xmlText = xmlText.trim()
    xmlText = xmlText.replace(/^\uFEFF/, "") // Remove BOM
    xmlText = xmlText.replace(/^[^<]*</, "<") // Remove content before first tag

    const parser = createParser()
    const feed = await parser.parseString(xmlText)

    console.log(`✅ Alternative parsing successful: ${feed.title}`)

    return {
      title: cleanText(feed.title || "Unknown Feed"),
      description: cleanText(feed.description),
      link: feed.link,
      items:
        feed.items?.map((item) => ({
          title: cleanText(item.title || "Untitled"),
          link: item.link || "",
          description: getItemDescription(item),
          content: getItemContent(item),
          pubDate: getItemPubDate(item),
          author: getItemAuthor(item),
          guid: item.guid || item.link,
          categories: item.categories || [],
        })) || [],
      lastBuildDate: feed.lastBuildDate,
      language: feed.language,
    }
  } catch (error) {
    console.error(`❌ Alternative parsing also failed for: ${feedUrl}`, error)
    return null
  }
}

// Helper functions to extract the best available data
function getItemContent(item: CustomItem): string | undefined {
  // Priority order for content
  const contentSources = [item["content:encoded"], item.content, item.summary, item.contentSnippet, item.description]

  for (const source of contentSources) {
    if (source && typeof source === "string" && source.trim()) {
      return cleanHtmlContent(source)
    }
  }

  return undefined
}

function getItemDescription(item: CustomItem): string | undefined {
  // Priority order for description
  const descSources = [item.summary, item.contentSnippet, item.description, item["content:encoded"], item.content]

  for (const source of descSources) {
    if (source && typeof source === "string" && source.trim()) {
      const cleaned = cleanHtmlContent(source)
      return cleaned.length > 500 ? cleaned.substring(0, 500) + "..." : cleaned
    }
  }

  return undefined
}

function getItemAuthor(item: CustomItem): string | undefined {
  // Priority order for author
  const authorSources = [item["dc:creator"], item.creator, item.author]

  for (const source of authorSources) {
    if (source && typeof source === "string" && source.trim()) {
      return cleanText(source)
    }
  }

  return undefined
}

function getItemPubDate(item: CustomItem): string | undefined {
  // Use isoDate first (most reliable), then pubDate
  if (item.isoDate) {
    return item.isoDate
  }

  if (item.pubDate) {
    try {
      // Validate and normalize the date
      const date = new Date(item.pubDate)
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    } catch (error) {
      console.warn(`Invalid date format: ${item.pubDate}`)
    }
  }

  return undefined
}

export function extractImageFromContent(content: string): string | null {
  if (!content) return null

  try {
    const $ = cheerio.load(content)

    // Try to find images in order of preference
    const selectors = [
      'img[src*="featured"]',
      'img[class*="featured"]',
      'img[alt*="featured"]',
      ".featured-image img",
      ".post-thumbnail img",
      ".entry-thumbnail img",
      "img[width][height]", // Images with dimensions are usually content images
      "img",
    ]

    for (const selector of selectors) {
      const img = $(selector).first()
      const src = img.attr("src")

      if (src && isValidImageUrl(src)) {
        // Convert relative URLs to absolute
        if (src.startsWith("//")) {
          return "https:" + src
        } else if (src.startsWith("/")) {
          // Would need the base URL to convert relative paths
          continue
        } else if (src.startsWith("http")) {
          return src
        }
      }
    }

    // Fallback: look for image URLs in text content
    const imageUrlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s]*)?)/gi
    const matches = content.match(imageUrlRegex)
    if (matches && matches.length > 0) {
      return matches[0]
    }
  } catch (error) {
    console.warn("Error extracting image from content:", error)
  }

  return null
}

function isValidImageUrl(url: string): boolean {
  if (!url || url.length < 10) return false

  // Check for common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i
  if (imageExtensions.test(url)) return true

  // Check for common image hosting patterns
  const imageHosts = ["imgur.com", "i.redd.it", "cdn.", "images.", "img.", "static.", "media.", "assets.", "uploads."]

  return imageHosts.some((host) => url.includes(host))
}

export function cleanHtmlContent(html: string): string {
  if (!html) return ""

  try {
    // Use cheerio to properly parse and clean HTML
    const $ = cheerio.load(html)

    // Remove unwanted elements
    $("script, style, noscript, iframe, embed, object").remove()

    // Get text content and decode HTML entities
    let text = $.text()

    // Decode HTML entities
    text = he.decode(text)

    // Clean up whitespace
    text = text
      .replace(/\s+/g, " ") // Multiple spaces to single space
      .replace(/\n\s*\n/g, "\n") // Multiple newlines to single newline
      .trim()

    return text
  } catch (error) {
    console.warn("Error cleaning HTML content:", error)
    // Fallback to simple regex cleaning
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, "/")
      .replace(/\s+/g, " ")
      .trim()
  }
}

function cleanText(text: string | undefined): string {
  if (!text) return ""

  try {
    // Decode HTML entities
    let cleaned = he.decode(text)

    // Remove any remaining HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, "")

    // Clean up whitespace
    cleaned = cleaned.replace(/\s+/g, " ").trim()

    return cleaned
  } catch (error) {
    console.warn("Error cleaning text:", error)
    return text.replace(/\s+/g, " ").trim()
  }
}

// Utility function to validate RSS feed URL
export function isValidRSSUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === "http:" || urlObj.protocol === "https:"
  } catch {
    return false
  }
}

// Utility function to discover RSS feeds from a website
export async function discoverRSSFeeds(websiteUrl: string): Promise<string[]> {
  try {
    console.log(`🔍 Discovering RSS feeds for: ${websiteUrl}`)

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(websiteUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RSS Reader Bot/1.0)",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const feeds: string[] = []

    // Look for RSS feed links in the HTML
    $('link[type="application/rss+xml"], link[type="application/atom+xml"]').each((_, element) => {
      const href = $(element).attr("href")
      if (href) {
        const absoluteUrl = new URL(href, websiteUrl).toString()
        feeds.push(absoluteUrl)
      }
    })

    // Common RSS feed paths to try
    const commonPaths = ["/rss", "/rss.xml", "/feed", "/feed.xml", "/atom.xml", "/feeds/all.atom.xml"]

    for (const path of commonPaths) {
      try {
        const feedUrl = new URL(path, websiteUrl).toString()

        // Create AbortController for each test request
        const testController = new AbortController()
        const testTimeoutId = setTimeout(() => testController.abort(), 3000)

        const testResponse = await fetch(feedUrl, {
          method: "HEAD",
          signal: testController.signal,
        })

        clearTimeout(testTimeoutId)

        if (testResponse.ok) {
          feeds.push(feedUrl)
        }
      } catch {
        // Ignore errors for common path testing
      }
    }

    console.log(`✅ Found ${feeds.length} potential RSS feeds`)
    return [...new Set(feeds)] // Remove duplicates
  } catch (error) {
    console.error(`❌ Error discovering RSS feeds for ${websiteUrl}:`, error)
    return []
  }
}
