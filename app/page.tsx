
import { cookies } from "next/headers"
import { format } from "date-fns"
import { verifyToken } from "@/lib/auth"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import PageContainer from "@/components/ui/page-container"
import PageHeader from "@/components/ui/page-header"
import PageContent, { FeatureGrid } from "@/components/ui/page-content"

export default async function HomePage() {
  // Check if user is authenticated
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth-token")?.value;
  let isAuthenticated = false;
  if (authToken) {
    const user = verifyToken(authToken);
    isAuthenticated = !!user;
  }
  const today = new Date();
  const todayFormatted = format(today, "dd-MM-yyyy");

  return (
    <PageContainer>
      <PageContent>
        <PageHeader>
          <Image src="/logo.png" alt="WFeed Logo" width={72} height={72} className="rounded-xl shadow-md" />
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">WFeed</h1>
          <p className="text-lg text-gray-600 text-center max-w-xl mt-2">
            The modern RSS reader for the information age. <br />
            <span className="font-semibold text-gray-800">Stay ahead, stay organized.</span>
          </p>
        </PageHeader>

        {/* Standout Features */}
        <FeatureGrid>
          <div className="flex items-start gap-3">
            <Image src="/globe.svg" alt="Discover" width={32} height={32} />
            <div>
              <h3 className="font-semibold text-gray-800">Smart Feed Discovery</h3>
              <p className="text-gray-600 text-sm">Find and follow the best sources with smart search and newsfeed.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Image src="/window.svg" alt="Modern UI" width={32} height={32} />
            <div>
              <h3 className="font-semibold text-gray-800">Modern, Clean UI</h3>
              <p className="text-gray-600 text-sm">Enjoy a distraction-free, beautiful reading experience on any device.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Image src="/file.svg" alt="Save Posts" width={32} height={32} />
            <div>
              <h3 className="font-semibold text-gray-800">Save & Organize</h3>
              <p className="text-gray-600 text-sm">Bookmark your favorite posts and manage your subscriptions easily.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Image src="/calendar.svg" alt="Browse by Date" width={32} height={32} />
            <div>
              <h3 className="font-semibold text-gray-800">Browse by Date</h3>
              <p className="text-gray-600 text-sm">Jump to any day’s news and never miss an update.</p>
            </div>
          </div>
        </FeatureGrid>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          {isAuthenticated ? (
            <Link href="/feed">
              <Button size="lg" className="px-8 text-lg">My Feed</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="lg" className="px-8 text-lg">Login</Button>
            </Link>
          )}
          <Link href={`/date/${todayFormatted}/posts`}>
            <Button variant="outline" size="lg" className="px-8 text-lg">Browse by Date</Button>
          </Link>
        </div>
      </PageContent>
    </PageContainer>
  )
}
