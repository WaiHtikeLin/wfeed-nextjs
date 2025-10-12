// quick-send.js
const fs = require('fs')
try { require('dotenv').config() } catch (e) {}
const webpush = require('web-push')

function usageAndExit() {
  console.error('\nUsage: node scripts/quick-send.js <subscription.json>')
  console.error('Or set environment variable SUB_JSON with the subscription JSON string and run without args.')
  process.exit(1)
}

// Validate VAPID keys
const pub = process.env.VAPID_PUBLIC_KEY
const priv = process.env.VAPID_PRIVATE_KEY
const subject = process.env.VAPID_SUBJECT || 'mailto:you@example.com'
if (!pub || !priv) {
  console.error('Missing VAPID keys. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your environment or .env file.')
  process.exit(1)
}

webpush.setVapidDetails(subject, pub, priv)

// Load subscription JSON from first CLI arg (file path) or SUB_JSON env
let subJson = null
if (process.argv[2]) {
  try {
    const raw = fs.readFileSync(process.argv[2], 'utf8')
    subJson = JSON.parse(raw)
  } catch (err) {
    console.error('Failed to read/parse subscription file:', err.message)
    usageAndExit()
  }
} else if (process.env.SUB_JSON) {
  try {
    subJson = JSON.parse(process.env.SUB_JSON)
  } catch (err) {
    console.error('Failed to parse SUB_JSON env:', err.message)
    usageAndExit()
  }
} else {
  usageAndExit()
}

if (!subJson || !subJson.endpoint) {
  console.error('Subscription JSON is missing an endpoint. Make sure you pass a valid PushSubscription object.')
  process.exit(1)
}

const payload = JSON.stringify({ title: 'test', body: 'hello from quick-send' })

webpush.sendNotification(subJson, payload)
  .then(() => console.log('Push sent successfully'))
  .catch(err => {
    console.error('Push send failed:', err)
    if (err.statusCode) console.error('Status code:', err.statusCode)
    if (err.body) console.error('Body:', err.body)
    process.exit(1)
  })