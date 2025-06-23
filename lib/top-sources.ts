// Top 10 news RSS sources for public feed
export const TOP_RSS_SOURCES = [
  {
    id: "bbc-news",
    title: "BBC News",
    feedUrl: "http://feeds.bbci.co.uk/news/rss.xml",
    website: "https://www.bbc.com/news",
    iconUrl: "https://static.files.bbci.co.uk/ws/simorgh-assets/public/news/images/metadata/poster-1024x576.png",
    description: "Breaking news, sport, TV, radio and a whole lot more from the BBC",
  },
  {
    id: "cnn",
    title: "CNN",
    feedUrl: "http://rss.cnn.com/rss/edition.rss",
    website: "https://www.cnn.com",
    iconUrl: "https://cdn.cnn.com/cnn/.e/img/3.0/global/misc/cnn-logo.png",
    description: "CNN.com delivers the latest breaking news and information",
  },
  {
    id: "reuters",
    title: "Reuters",
    feedUrl: "https://feeds.reuters.com/reuters/topNews",
    website: "https://www.reuters.com",
    iconUrl: "https://www.reuters.com/pf/resources/images/reuters/reuters-default.png",
    description: "Reuters, the news and media division of Thomson Reuters",
  },
  {
    id: "ap-news",
    title: "Associated Press",
    feedUrl: "https://feeds.apnews.com/rss/apf-topnews",
    website: "https://apnews.com",
    iconUrl: "https://apnews.com/apple-touch-icon.png",
    description: "The Associated Press is an independent global news organization",
  },
  {
    id: "guardian",
    title: "The Guardian",
    feedUrl: "https://www.theguardian.com/world/rss",
    website: "https://www.theguardian.com",
    iconUrl: "https://assets.guim.co.uk/images/favicons/fee5e2d638d1c35f6d501fa397e53329/152x152.png",
    description: "Latest news, sport and comment from the Guardian",
  },
  {
    id: "techcrunch",
    title: "TechCrunch",
    feedUrl: "https://techcrunch.com/feed/",
    website: "https://techcrunch.com",
    iconUrl: "https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png",
    description: "Startup and Technology News",
  },
  {
    id: "ars-technica",
    title: "Ars Technica",
    feedUrl: "http://feeds.arstechnica.com/arstechnica/index",
    website: "https://arstechnica.com",
    iconUrl: "https://cdn.arstechnica.net/favicon.ico",
    description: "Technology news and analysis",
  },
  {
    id: "hacker-news",
    title: "Hacker News",
    feedUrl: "https://hnrss.org/frontpage",
    website: "https://news.ycombinator.com",
    iconUrl: "https://news.ycombinator.com/favicon.ico",
    description: "Hacker News RSS",
  },
  {
    id: "wired",
    title: "Wired",
    feedUrl: "https://www.wired.com/feed/rss",
    website: "https://www.wired.com",
    iconUrl: "https://www.wired.com/favicon.ico",
    description: "Technology, science, culture and business news",
  },
  {
    id: "engadget",
    title: "Engadget",
    feedUrl: "https://www.engadget.com/rss.xml",
    website: "https://www.engadget.com",
    iconUrl: "https://www.engadget.com/favicon.ico",
    description: "Technology news and reviews",
  },
] as const

export type TopRSSSource = (typeof TOP_RSS_SOURCES)[number]

// Get top sources from database
export async function getTopSources() {
  const db = (await import("@/lib/db")).default

  try {
    const [sources] = await db.execute(`
      SELECT id, title, feed_url, website_url, icon_url, description
      FROM rss_sources
      WHERE is_top = TRUE
      ORDER BY title
    `)

    return Array.isArray(sources) ? sources : []
  } catch (error) {
    console.error("Error fetching top sources:", error)
    return TOP_RSS_SOURCES // Fallback to static list
  }
}
