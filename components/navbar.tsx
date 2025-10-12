"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Search, Bookmark, LogOut, Rss, List } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo and WFeed */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="WFeed Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-900">WFeed</span>
            </Link>
          </div>
          {/* Right: Home, Search, Bar icon (bar icon only on mobile) */}
          <div className="flex items-center space-x-4">
            {user && (
              <Link
                href="/feed"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/feed" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            )}
            {user && (
              <Link
                href="/settings"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/settings" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <List className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            )}
            <Link
              href="/search"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/search"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Link>
            {/* Bar icon for mobile nav, only show if authenticated and on mobile */}
            {user && (
              <button
                className="p-2 rounded-md hover:bg-gray-100 md:hidden"
                aria-label="Open menu"
                onClick={() => window.dispatchEvent(new CustomEvent("open-mobile-nav"))}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
