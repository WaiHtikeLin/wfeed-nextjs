import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { format, parseISO, isValid, subDays, addDays } from "date-fns"
import db from "@/lib/db"
import { PublicPostCard } from "@/components/public-post-card"
import { DateNavigation } from "@/components/date-navigation"
import { PublicNavbar } from "@/components/public-navbar"
import { getTopSources } from "@/lib/top-sources"
import { SafeImage } from "@/components/safe-image"

interface PublicPost {
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

interface PageProps {
  params: Promise<{
    date: string
  }>
}

// Validate and parse date from URL parameter (DD-MM-YYYY format)
function parseUrlDate(dateParam: string): Date | null {
  try {
    // Expected format: DD-MM-YYYY
    const parts = dateParam.split("-")
    if (parts.length !== 3) return null

    const day = Number.parseInt(parts[0], 10)
    const month = Number.parseInt(parts[1], 10)
    const year = Number.parseInt(parts[2], 10)

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2020 || year > 2030) {
      return null
    }

    // Create date in YYYY-MM-DD format for parsing
    const isoDateString = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
    const date = parseISO(isoDateString)

    return isValid(date) ? date : null
  } catch {
    return null
  }
}

// Format date for database query (YYYY-MM-DD)
function formatDateForDb(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

// Format date for URL (DD-MM-YYYY)
function formatDateForUrl(date: Date): string {
  return format(date, "dd-MM-yyyy")
}

// Get posts for a specific date from top sources
async function getPostsForDate(date: Date): Promise<PublicPost[]> {
  try {
    const dateStr = formatDateForDb(date)

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
        s.id as source_id,
        s.title as source_title,
        s.icon_url as source_icon_url,
        s.website_url as source_website_url,
        s.description as source_description
      FROM posts p
      JOIN rss_sources s ON p.source_id = s.id
      WHERE s.is_top = TRUE 
        AND DATE(p.published_at) = ?
      ORDER BY p.published_at DESC
    `,
      [dateStr],
    )

    return Array.isArray(posts)
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
            id: post.source_id,
            title: post.source_title,
            iconUrl: post.source_icon_url,
            websiteUrl: post.source_website_url,
            description: post.source_description,
          },
        }))
      : []
  } catch (error) {
    console.error("Error fetching posts:", error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date: dateParam } = await params
  const date = parseUrlDate(dateParam)

  if (!date) {
    return {
      title: "Invalid Date - WFeed",
      description: "The requested date is invalid.",
    }
  }

  const posts = await getPostsForDate(date)
  const topSources = await getTopSources()
  const formattedDate = format(date, "MMMM d, yyyy")
  const dateStr = formatDateForDb(date)

  const title = `News for ${formattedDate} - WFeed`
  const description = `Latest news and articles from top sources for ${formattedDate}. ${posts.length} articles from ${topSources
    .map((s: any) => s.title)
    .slice(0, 3)
    .join(", ")} and more.`

  const sourceNames = topSources.map((s: any) => s.title).join(", ")

  return {
    title,
    description,
    keywords: `news, rss, ${formattedDate}, ${sourceNames}`,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/date/${dateParam}/posts`,
      siteName: "WFeed",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `News for ${formattedDate}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `/date/${dateParam}/posts`,
    },
    other: {
      "article:published_time": dateStr,
      "article:section": "News",
      "article:tag": sourceNames,
    },
  }
}

export default async function DatePostsPage({ params }: PageProps) {
  const { date: dateParam } = await params
  const date = parseUrlDate(dateParam)

  if (!date) {
    notFound()
  }

  const posts = await getPostsForDate(date)
  const topSources = await getTopSources()
  const formattedDate = format(date, "EEEE, MMMM d, yyyy")

  // Calculate previous and next dates
  const previousDate = subDays(date, 1)
  const nextDate = addDays(date, 1)
  const today = new Date()
  const isToday = formatDateForDb(date) === formatDateForDb(today)
  const isFuture = date > today

  return (
    <>
      <PublicNavbar />
      <div className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            News for {formattedDate}
            {isToday && <span className="text-blue-600 ml-2">(Today)</span>}
          </h1>
          <p className="text-lg text-gray-600 mb-6">Latest articles from top news sources • {posts.length} articles</p>

          {/* Date Navigation */}
          <DateNavigation
            currentDate={date}
            previousDate={previousDate}
            nextDate={nextDate}
            isToday={isToday}
            isFuture={isFuture}
          />
        </div>

        {/* Source List */}
        <div className="mb-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sources</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {topSources.map((source: any) => (
              <div key={source.id} className="flex items-center space-x-2 text-sm">
                <SafeImage src={source.icon_url || "/placeholder.svg"} alt={source.title} className="w-4 h-4 rounded" />
                <span className="text-gray-700 truncate">{source.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">
              {isFuture
                ? "No articles available for future dates."
                : "No articles were published on this date from our top sources."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PublicPostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            Articles are automatically collected from top news sources and updated regularly.
            <br />
            Last updated: {format(new Date(), "PPpp")}
          </p>
        </div>
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `News for ${formattedDate}`,
            description: `Latest news and articles from top sources for ${formattedDate}`,
            url: `/date/${dateParam}/posts`,
            datePublished: formatDateForDb(date),
            publisher: {
              "@type": "Organization",
              name: "WFeed",
              url: "/",
            },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: posts.length,
              itemListElement: posts.map((post, index) => ({
                "@type": "NewsArticle",
                position: index + 1,
                headline: post.title,
                description: post.summary,
                url: post.url,
                datePublished: post.publishedAt,
                author: post.author
                  ? {
                      "@type": "Person",
                      name: post.author,
                    }
                  : undefined,
                publisher: {
                  "@type": "Organization",
                  name: post.source.title,
                  url: post.source.websiteUrl,
                },
                image: post.imageUrl,
              })),
            },
          }),
        }}
      />
    </>
  )
}

// Generate static params for common dates (optional, for better performance)
export async function generateStaticParams() {
  const today = new Date()
  const dates = []

  // Generate params for last 7 days and today
  for (let i = -7; i <= 0; i++) {
    const date = addDays(today, i)
    dates.push({
      date: formatDateForUrl(date),
    })
  }

  return dates
}
