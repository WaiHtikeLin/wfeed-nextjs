import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import db from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    // Check if post exists
    const [posts] = await db.execute("SELECT id FROM posts WHERE id = ?", [postId])

    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if already saved
    const [existingSaves] = await db.execute(
      "SELECT id FROM user_interactions WHERE user_id = ? AND post_id = ? AND interaction_type = 'bookmark'",
      [user.id, postId],
    )

    if (Array.isArray(existingSaves) && existingSaves.length > 0) {
      return NextResponse.json({ error: "Post already saved" }, { status: 400 })
    }

    // Save the post
    const interactionId = uuidv4()
    await db.execute(
      "INSERT INTO user_interactions (id, user_id, post_id, interaction_type) VALUES (?, ?, ?, 'bookmark')",
      [interactionId, user.id, postId],
    )

    return NextResponse.json({ success: true, message: "Post saved successfully" })
  } catch (error) {
    console.error("Save post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    // Remove the saved post
    const [result] = await db.execute(
      "DELETE FROM user_interactions WHERE user_id = ? AND post_id = ? AND interaction_type = 'bookmark'",
      [user.id, postId],
    )

    return NextResponse.json({ success: true, message: "Post unsaved successfully" })
  } catch (error) {
    console.error("Unsave post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
