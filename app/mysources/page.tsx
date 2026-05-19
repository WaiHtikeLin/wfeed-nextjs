"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchResultCard } from "@/components/search-result-card";
// Define the type for a followed source (from /api/subscriptions GET response)
interface FollowedSource {
  feedly_id: string;
  title: string;
  description?: string;
  website_url?: string;
  icon_url?: string;
  priority: string;
  id?: string; // internal source id for unfollow
}
import { useAuth } from "@/hooks/use-auth";
import { Loader2, List, SortAsc, SortDesc } from "lucide-react";
import ContentWrapper from "@/components/ui/content-wrapper"


const SORT_OPTIONS = [
  { value: "priority", label: "By Priority" },
  { value: "date_followed", label: "By Date Followed" },
  { value: "name", label: "By Name" },
];

export default function MySourcesPage() {
  const { user } = useAuth();
  const [sources, setSources] = useState<FollowedSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState("");
  const lastSearchQuery = useRef<string>("");
  const [sort, setSort] = useState("priority");

  useEffect(() => {
    if (!user) return;
    fetchSources();
    // eslint-disable-next-line
  }, [user]);

  // Debounced search effect (like /search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed.length >= 3 && trimmed !== lastSearchQuery.current) {
        lastSearchQuery.current = trimmed;
        setSearch(trimmed);
        fetchSources(trimmed);
      } else if (trimmed.length === 0) {
        setSearch("");
        fetchSources("");
        setError("");
        lastSearchQuery.current = "";
      } else if (trimmed.length > 0 && trimmed.length < 3) {
        setError("");
      }
    }, 400);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line
  }, [searchInput]);

  async function fetchSources(searchOverride?: string) {
    setLoading(true);
    const q = typeof searchOverride === "string" ? searchOverride : search;
    const res = await fetch(`/api/subscriptions?sort=${sort}&search=${encodeURIComponent(q)}`);
    if (res.ok) {
      const data = await res.json();
      setSources(data.subscriptions || []);
    }
    setLoading(false);
  }

  // Change follow priority for a source
  async function handlePriorityChange(feedly_id: string, newPriority: string) {
    const src = sources.find(s => s.feedly_id === feedly_id);
    if (!src) return;
    const res = await fetch(`/api/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feedId: feedly_id,
        title: src.title,
        description: src.description || null,
        website: src.website_url || null,
        iconUrl: src.icon_url || null,
        priority: newPriority
      }),
    });
    if (res.ok) {
      setSources((prev) =>
        prev.map((s) =>
          s.feedly_id === feedly_id ? { ...s, priority: newPriority } : s
        )
      );
    }
  }

  // Unfollow a source
  async function handleUnfollow(feedly_id: string) {
    const src = sources.find(s => s.feedly_id === feedly_id);
    if (!src) return;
    const sourceId = src.id || feedly_id;
    const res = await fetch(`/api/subscriptions/${sourceId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setSources((prev) => prev.filter((s) => s.feedly_id !== feedly_id));
    }
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSort(e.target.value);
    setTimeout(() => fetchSources(), 0);
  }

  function handleSearchInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchInput(e.target.value);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSearch(searchInput.trim());
    fetchSources(searchInput.trim());
  }

  return (
    <ContentWrapper>
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <List className="h-7 w-7 text-blue-600" /> My Sources
          </h1>
        </div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          placeholder="Search sources... (min 3 characters)"
          value={searchInput}
          onChange={handleSearchInputChange}
          className="flex-1"
        />
        <Button type="submit" variant="outline" disabled={searchInput.trim().length < 2 && searchInput.trim().length !== 0}>Search</Button>
        <select value={sort} onChange={handleSortChange} className="border rounded px-2 py-1">
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </form>
      {searchInput.trim().length > 0 && searchInput.trim().length < 3 && (
        <div className="text-sm text-gray-500 mb-4">Type at least 3 characters to search</div>
      )}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
      ) : sources.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No followed sources found.</div>
      ) : (
        <div className="space-y-4">
          {sources.map(source => (
            <SearchResultCard
              key={source.feedly_id}
              result={{
                id: source.feedly_id,
                feedId: source.feedly_id,
                title: source.title,
                description: source.description,
                website: source.website_url,
                iconUrl: source.icon_url,
              }}
              isFollowing={{ id: source.feedly_id, priority: source.priority }}
              isLoading={false}
              onFollow={(_feedId, priority) => handlePriorityChange(source.feedly_id, priority)}
              onUnfollow={() => handleUnfollow(source.feedly_id)}
              showFollowActions
              followPriority={source.priority as any}
            />
          ))}
        </div>
      )}
      </div>
    </ContentWrapper>
  );
}
