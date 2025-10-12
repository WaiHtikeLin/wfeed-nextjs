import { NextResponse, type NextRequest } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const endpoint = body?.endpoint
    if (!endpoint) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    await db.execute('DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?', [user.id, endpoint])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Unsubscribe error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
