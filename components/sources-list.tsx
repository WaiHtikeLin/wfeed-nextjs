import React from "react"
import { SafeImage } from "@/components/safe-image"

export default function SourcesList({ sources }: { sources: any[] }) {
  return (
    <div className="mb-8 bg-gray-50 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Sources</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {sources.map((source) => (
          <div key={source.id} className="flex items-center space-x-2 text-sm">
            <SafeImage src={source.icon_url || "/placeholder.svg"} alt={source.title} className="w-4 h-4 rounded" />
            <span className="text-gray-700 truncate">{source.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
