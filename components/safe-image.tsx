"use client"

import { useState } from "react"

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
}

export function SafeImage({ src, alt, className, fallbackSrc = "/placeholder.svg" }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
    }
  }

  return <img src={imgSrc || "/placeholder.svg"} alt={alt} className={className} onError={handleError} />
}
