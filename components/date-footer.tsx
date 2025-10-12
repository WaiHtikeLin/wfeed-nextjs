import React from "react"

export function DateFooter({ lastUpdated }: { lastUpdated: string }) {
  return (
    <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
      <p>
        Articles are automatically collected from top news sources and updated regularly.
        <br />
        Last updated: {lastUpdated}
      </p>
    </div>
  )
}

export default DateFooter
