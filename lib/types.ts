export interface Post {
  id: string
  title: string
  content?: string
  summary?: string
  url: string
  author?: string
  publishedAt: string
  imageUrl?: string
  isSaved?: boolean
  source: {
    id: string
    title: string
    iconUrl?: string
    websiteUrl?: string
    priority?: string
    priorityWeight?: number
  }
}