import { NextResponse, type NextRequest } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sub = await request.json()
    const { endpoint, keys } = sub || {}
    const p256dh = keys?.p256dh
    const auth = keys?.auth

    if (!endpoint || !p256dh || !auth) return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })

    await db.execute(
      'INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth)',
      [user.id, endpoint, p256dh, auth]
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Subscribe error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
