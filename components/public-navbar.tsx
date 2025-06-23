import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PublicNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="WFeed Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-900">WFeed</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/register">
              <Button variant="outline">Register</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

