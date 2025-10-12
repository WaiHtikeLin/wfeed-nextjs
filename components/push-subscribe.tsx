"use client"

import { useEffect, useState } from 'react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushSubscribe({ className }: { className?: string }) {
  const [status, setStatus] = useState<'idle'|'subscribed'|'denied'|'error'|'unsupported'>('idle')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
    }
  }, [])

  const handleSubscribe = async () => {
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setStatus('denied')
        return
      }

      const reg = await navigator.serviceWorker.register('/sw.js')
      const resp = await fetch('/api/push/vapid')
      const data = await resp.json()
      const vapidKey = data?.publicKey
      if (!vapidKey) {
        setStatus('error')
        return
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })

      setStatus('subscribed')
    } catch (err) {
      console.error('Subscribe failed', err)
      setStatus('error')
    }
  }

  const handleUnsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      if (!reg) return
      const sub = await reg.pushManager.getSubscription()
      if (!sub) return

      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })

      await sub.unsubscribe()
      setStatus('idle')
    } catch (err) {
      console.error('Unsubscribe failed', err)
      setStatus('error')
    }
  }

  return (
    <div className={className}>
      {status === 'unsupported' && <p>Push not supported in this browser</p>}
      {status === 'idle' && <button onClick={handleSubscribe} className="btn">Enable notifications</button>}
      {status === 'subscribed' && <button onClick={handleUnsubscribe} className="btn">Disable notifications</button>}
      {status === 'denied' && <p>Notifications permission denied</p>}
      {status === 'error' && <p>Subscription error</p>}
    </div>
  )
}
