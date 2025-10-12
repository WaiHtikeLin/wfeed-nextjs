import React from "react"
import { PublicPostCard } from "@/components/public-post-card"
import { AdsenseAd } from "@/components/adsense-ad"

export default function PostWithAds({ post, showAd }: { post: any; showAd?: boolean }) {
  return (
    <>
      <PublicPostCard post={post} />
      {showAd && <AdsenseAd />}
    </>
  )
}
