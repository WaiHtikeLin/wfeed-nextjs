import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
    // Helper to convert ISO string to MySQL TIMESTAMP format (YYYY-MM-DD HH:MM:SS)
    function toMySQLTimestamp(dateString: string | null): string | null {
      if (!dateString) return null;
      const d = new Date(dateString);
      // Pad with zeros for month, day, hour, minute, second
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
    }
  try {

    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit
    const anchorDate = searchParams.get("anchorDate")
    const maxDate = searchParams.get("maxDate")

    let formattedPosts: Array<any> = []
    let maxPublishedAt = null;

    if (anchorDate && maxDate) {
      // Fetch new posts (published_at > maxDate) and old posts (published_at <= anchorDate)
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
        WHERE us.user_id = ? AND p.published_at <= ?
        ORDER BY p.published_at DESC, priority_weight DESC
        LIMIT ? OFFSET ?
      `, [user.id, anchorDate, limit, offset]);
      olderPosts = Array.isArray(op) ? op : [];

      // Merge and deduplicate by id
      const allPosts = [
        ...(newPosts || []),
        ...(olderPosts || [])
      ];
    
      formattedPosts = allPosts.map((post: any) => ({
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

      if (newPosts.length > 0) {
      maxPublishedAt = newPosts
        .map((post) => post.published_at)
        .reduce((max, date) => (date > max ? date : max), newPosts[0].published_at);
     }

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
          s.feedly_id as source_feedly_id,
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
              feedlyId: post.source_feedly_id,
              iconUrl: post.source_icon_url,
              websiteUrl: post.source_website_url,
              priority: post.priority,
              priorityWeight: post.priority_weight,
            },
          }))
        : [];

         if (formattedPosts.length > 0) {
            let maxPublishedAt = formattedPosts[0].publishedAt;
            formattedPosts.forEach((post) => {
              if(post.publishedAt > maxPublishedAt)
                  maxPublishedAt = post.publishedAt;
            })

            // console.log('Max Date '+ maxDate)

            // maxPublishedAt = formattedPosts
            //   .map((post) => new Date(post.publishedAt))
            //   .reduce((max, date) => (date > max ? date : max), new Date(formattedPosts[0].publishedAt))
            //   .toISOString();

            // console.log('Max Published Date '+ maxPublishedAt)
        }
    }
   
    // anchorDate should be the maxPublishedAt from the first page (frontend responsibility)
    return NextResponse.json({ posts: formattedPosts, maxPublishedAt });
  } catch (error) {
    console.error("Get posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
