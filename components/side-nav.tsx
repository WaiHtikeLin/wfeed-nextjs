"use client";
import { useAuth } from "../hooks/use-auth";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LogOut, List, Bookmark, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function SideNav() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg flex flex-col items-center py-8 z-40">
      <div className="flex flex-col items-center mb-8">
        <Avatar className="size-16">
          {/* If you add image support, add <AvatarImage src={user.image} alt={user.name || user.email} /> here */}
          <AvatarFallback>
            {user.name ? user.name[0] : user.email[0]}
          </AvatarFallback>
        </Avatar>
        <span className="mt-2 font-semibold text-lg">{user.name || user.email}</span>
      </div>
      <nav className="flex flex-col gap-4 w-full px-8">
        <Link href="/mysources" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
          <List className="h-5 w-5" />
          My Sources
        </Link>
        <Link href="/saved" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
          <Bookmark className="h-5 w-5" />
          Saved Posts
        </Link>
         <Link href={`/date/${format(new Date(), 'dd-MM-yyyy')}`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
          <Calendar className="h-5 w-5" />
          Browse by Date
        </Link>
        <button onClick={logout} className="flex items-center gap-2 text-gray-700 hover:text-red-600 mt-8">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </nav>
    </aside>
  );
}
