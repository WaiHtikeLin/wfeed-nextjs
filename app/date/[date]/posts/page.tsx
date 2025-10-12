import React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { format, subDays, addDays } from "date-fns"
import { getPostsForDate as fetchPostsForDate, PublicPost } from "@/lib/posts"
import { PublicPostCard } from "@/components/public-post-card"
import DateHeader from "@/components/date-header"
import DateFooter from "@/components/date-footer"
// import { PublicNavbar } from "@/components/public-navbar"
import { getTopSources } from "@/lib/top-sources"
import { SafeImage } from "@/components/safe-image"
import SourcesList from "@/components/sources-list"
import EmptyState from "@/components/ui/empty-state"
import EmptyArticlesIcon from "@/components/icons/empty-articles"
import PostsList from "@/components/ui/posts-list"
import { AdsenseAd } from "@/components/adsense-ad"
import PostWithAds from "@/components/post-with-ads"
import { parseUrlDate, formatDateForDb, formatDateForUrl, getAdjacentDates } from "@/lib/date"
import { buildDateStructuredData, generateMetadataForDate, generateStaticParams } from "@/lib/metadata"
import { t } from "@/lib/i18n"


interface PageProps {
  params: Promise<{
    date: string
  }>
}

// ... helpers moved to lib/date.ts

type PublicPostType = PublicPost

// Generate metadata for SEO
export { generateMetadataForDate as generateMetadata }

export default async function DatePostsPage({ params }: PageProps) {
  const { date: dateParam } = await params
  const date = parseUrlDate(dateParam)

  if (!date) {
    notFound()
  }

  const posts = await fetchPostsForDate(date)
  const topSources = (await getTopSources()) as any[]
  const formattedDate = format(date, "EEEE, MMMM d, yyyy")

  // Calculate adjacent dates and flags
  const { previousDate, nextDate, isToday, isFuture } = getAdjacentDates(date)

  return (
    <>
      <div className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        <DateHeader
          formattedDate={formattedDate}
          isToday={isToday}
          isFuture={isFuture}
          date={date}
          previousDate={previousDate}
          nextDate={nextDate}
        />

        <SourcesList sources={topSources} />

        {/* Posts */}
        {posts.length === 0 ? (
          <EmptyState
            icon={<EmptyArticlesIcon />}
            title={t("empty.noArticlesTitle")}
            description={isFuture ? t("empty.noArticlesFuture") : t("empty.noArticlesDefault")}
          />
        ) : (
          <PostsList>
            {posts.map((post, idx) => (
              <div key={post.id}>
                <PostWithAds post={post as PublicPostType} showAd={(idx + 1) % 5 === 0} />
              </div>
            ))}
          </PostsList>
        )}

        <DateFooter lastUpdated={format(new Date(), "PPpp")} />
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildDateStructuredData(formattedDate, posts, dateParam, formatDateForDb(date))),
        }}
      />
    </>
  )
}

// Generate static params for common dates (optional, for better performance)
export { generateStaticParams }
