"use client";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LogOut, List, Bookmark, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function MobileSideNav({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end md:hidden">
      <aside className="w-64 h-full bg-white shadow-lg flex flex-col items-center py-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
          aria-label="Close menu"
          onClick={onClose}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div className="flex flex-col items-center mb-8 mt-8">
          <Avatar className="size-16">
            <AvatarFallback>
              {user.name ? user.name[0] : user.email[0]}
            </AvatarFallback>
          </Avatar>
          <span className="mt-2 font-semibold text-lg">{user.name || user.email}</span>
        </div>
        <nav className="flex flex-col gap-4 w-full px-8">
          <Link href="/mysources" className="flex items-center gap-2 text-gray-700 hover:text-blue-600" onClick={onClose}>
            <List className="h-5 w-5" />
            My Sources
          </Link>
          <Link href="/saved" className="flex items-center gap-2 text-gray-700 hover:text-blue-600" onClick={onClose}>
            <Bookmark className="h-5 w-5" />
            Saved Posts
          </Link>
          <Link href={`/date/${format(new Date(), 'dd-MM-yyyy')}`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <Calendar className="h-5 w-5" />
            Browse by Date
          </Link>
          <button onClick={() => { logout(); onClose(); }} className="flex items-center gap-2 text-gray-700 hover:text-red-600 mt-8">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </nav>
      </aside>
    </div>
  );
}
