import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import db from "@/lib/db"
import { Post } from "@/lib/types"
import { is } from "date-fns/locale"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit
    const since = searchParams.get("since")
    const anchorDate = searchParams.get("anchorDate")
    const maxDate = searchParams.get("maxDate")

    let formattedPosts: Array<any> = []

    if (anchorDate && maxDate) {
      // Fetch new posts (published_at > maxDate) and old posts (published_at < anchorDate)
      let newPosts: any[] = [];
      let olderPosts: any[] = [];
      const [np] = await db.execute(`
        SELECT 
          p.id,
          p.title,
          p.content,
          p.summary,
          p.url,
          p.author,
          p.published_at,
          p.image_url,
          CASE WHEN ui.id IS NOT NULL THEN 1 ELSE 0 END as is_saved,
          s.id as source_id,
          s.title as source_title,
          s.icon_url as source_icon_url,
          s.website_url as source_website_url,
          us.priority,
          CASE 
            WHEN us.priority = 'see_first' THEN 3
            WHEN us.priority = 'normal' THEN 2
            WHEN us.priority = 'see_less' THEN 1
            ELSE 2
          END as priority_weight
        FROM posts p
        JOIN rss_sources s ON p.source_id = s.id
        JOIN user_subscriptions us ON s.id = us.source_id
        LEFT JOIN user_interactions ui ON p.id = ui.post_id AND ui.user_id = us.user_id
        WHERE us.user_id = ? AND p.published_at > ?
        ORDER BY p.published_at DESC, priority_weight DESC
      `, [user.id, maxDate]);
      newPosts = Array.isArray(np) ? np : [];

      const [op] = await db.execute(`
        SELECT 
          p.id,
          p.title,
          p.content,
          p.summary,
          p.url,
          p.author,
          p.published_at,
          p.image_url,
          CASE WHEN ui.id IS NOT NULL THEN 1 ELSE 0 END as is_saved,
          s.id as source_id,
          s.title as source_title,
          s.icon_url as source_icon_url,
          s.website_url as source_website_url,
          us.priority,
          CASE 
            WHEN us.priority = 'see_first' THEN 3
            WHEN us.priority = 'normal' THEN 2
            WHEN us.priority = 'see_less' THEN 1
            ELSE 2
          END as priority_weight
        FROM posts p
        JOIN rss_sources s ON p.source_id = s.id
        JOIN user_subscriptions us ON s.id = us.source_id
        LEFT JOIN user_interactions ui ON p.id = ui.post_id AND ui.user_id = us.user_id
        WHERE us.user_id = ? AND p.published_at < ?
        ORDER BY p.published_at DESC, priority_weight DESC
        LIMIT ? OFFSET ?
      `, [user.id, anchorDate, limit, offset]);
      olderPosts = Array.isArray(op) ? op : [];

      // Merge and deduplicate by id
      const allPosts = [
        ...(newPosts || []),
        ...(olderPosts || [])
      ];
      const seenIds = new Set();
      formattedPosts = allPosts.filter((post: any) => {
        if (seenIds.has(post.id)) return false;
        seenIds.add(post.id);
        return true;
      }).map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        summary: post.summary,
        url: post.url,
        author: post.author,
        publishedAt: post.published_at,
        imageUrl: post.image_url,
        isSaved: Boolean(post.is_saved),
        source: {
          id: post.source_id,
          title: post.source_title,
          iconUrl: post.source_icon_url,
          websiteUrl: post.source_website_url,
          priority: post.priority,
          priorityWeight: post.priority_weight,
        },
      }));
    } else {
      // Default: fetch paginated posts and set anchorDate and maxDate
      const postsQuery = `
        SELECT 
          p.id,
          p.title,
          p.content,
          p.summary,
          p.url,
          p.author,
          p.published_at,
          p.image_url,
          CASE WHEN ui.id IS NOT NULL THEN 1 ELSE 0 END as is_saved,
          s.id as source_id,
          s.title as source_title,
          s.icon_url as source_icon_url,
          s.website_url as source_website_url,
          us.priority,
          CASE 
            WHEN us.priority = 'see_first' THEN 3
            WHEN us.priority = 'normal' THEN 2
            WHEN us.priority = 'see_less' THEN 1
            ELSE 2
          END as priority_weight
        FROM posts p
        JOIN rss_sources s ON p.source_id = s.id
        JOIN user_subscriptions us ON s.id = us.source_id
        LEFT JOIN user_interactions ui ON p.id = ui.post_id AND ui.user_id = us.user_id
        WHERE us.user_id = ?
        ORDER BY p.published_at DESC, priority_weight DESC
        LIMIT ? OFFSET ?
      `;
      const queryParams = [user.id, limit, offset];
      const [posts] = await db.execute(postsQuery, queryParams);
      formattedPosts = Array.isArray(posts)
        ? posts.map((post: any) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            summary: post.summary,
            url: post.url,
            author: post.author,
            publishedAt: post.published_at,
            imageUrl: post.image_url,
            isSaved: Boolean(post.is_saved),
            source: {
              id: post.source_id,
              title: post.source_title,
              iconUrl: post.source_icon_url,
              websiteUrl: post.source_website_url,
              priority: post.priority,
              priorityWeight: post.priority_weight,
            },
          }))
        : [];
    }

    // Always recalculate maxPublishedAt from the current batch
    let maxPublishedAt = null;
    if (formattedPosts.length > 0) {
      maxPublishedAt = formattedPosts
        .map((post) => new Date(post.publishedAt))
        .reduce((max, date) => (date > max ? date : max), new Date(formattedPosts[0].publishedAt))
        .toISOString();
    }
    // anchorDate should be the maxPublishedAt from the first page (frontend responsibility)
    return NextResponse.json({ posts: formattedPosts, maxPublishedAt });
  } catch (error) {
    console.error("Get posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
