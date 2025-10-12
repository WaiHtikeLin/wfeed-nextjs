import { format } from "date-fns"
import { getTopSources } from "./top-sources"
import { getPostsForDate } from "./posts"
import { parseUrlDate } from "./date"
import type { Metadata } from "next"

export async function buildDatePageMetadata(date: Date, dateParam: string) {
  const posts = await getPostsForDate(date)
  const topSources = await getTopSources()
  const formattedDate = format(date, "MMMM d, yyyy")
  const dateStr = format(date, "yyyy-MM-dd")

  const title = `News for ${formattedDate} - WFeed`
  const description = `Latest news and articles from top sources for ${formattedDate}. ${posts.length} articles from ${topSources
    .map((s: any) => s.title)
    .slice(0, 3)
    .join(", ")} and more.`

  const sourceNames = topSources.map((s: any) => s.title).join(", ")

  return {
    title,
    description,
    dateStr,
    formattedDate,
    sourceNames,
    posts,
  }
}

export function buildDateStructuredData(formattedDate: string, posts: any[], dateParam: string, dateForDb: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `News for ${formattedDate}`,
    description: `Latest news and articles from top sources for ${formattedDate}`,
    url: `/date/${dateParam}/posts`,
    datePublished: dateForDb,
    publisher: {
      "@type": "Organization",
      name: "WFeed",
      url: "/",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post: any, index: number) => ({
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
  }
}

// Reusable generateMetadata implementation for date pages
export async function generateMetadataForDate({ params }: { params: { date: string } }): Promise<Metadata> {
  const { date: dateParam } = params
  const date = parseUrlDate(dateParam)

  if (!date) {
    return {
      title: "Invalid Date - WFeed",
      description: "The requested date is invalid.",
    }
  }

  const md = await buildDatePageMetadata(date, dateParam)

  return {
    title: md.title,
    description: md.description,
    keywords: `news, rss, ${md.formattedDate}, ${md.sourceNames}`,
    openGraph: {
      title: md.title,
      description: md.description,
      type: "website",
      url: `/date/${dateParam}/posts`,
      siteName: "WFeed",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `News for ${md.formattedDate}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: md.title,
      description: md.description,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `/date/${dateParam}/posts`,
    },
    other: {
      "article:published_time": md.dateStr,
      "article:section": "News",
      "article:tag": md.sourceNames,
    },
  }
}

// Generate static params for date pages (optional)
export async function generateStaticParams() {
  const today = new Date()
  const dates: Array<{ date: string }> = []

  // Generate params for last 7 days and today
  for (let i = -7; i <= 0; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const dd = String(date.getDate()).padStart(2, "0")
    dates.push({ date: `${yyyy}-${mm}-${dd}` })
  }

  return dates
}
