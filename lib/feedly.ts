export interface FeedlySource {
  id: string
  title: string
  description?: string
  website?: string
  feedId: string
  iconUrl?: string
  subscribers?: number
}

export interface FeedlySearchResponse {
  results: FeedlySource[]
}

export async function searchFeedlySources(query: string): Promise<FeedlySource[]> {
  try {
    const response = await fetch(
      `https://cloud.feedly.com/v3/search/feeds?query=${encodeURIComponent(query)}&count=20`,
      {
        headers: {
          "User-Agent": "RSS Reader App",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to search feeds")
    }

    const data: FeedlySearchResponse = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Feedly search error:", error)
    return []
  }
}
