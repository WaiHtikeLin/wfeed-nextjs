self.addEventListener('push', function (event) {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'New posts';
    const options = {
      body: data.body || '',
      icon: data.icon || '/logo.png',
      badge: data.badge || '/favicon.ico',
      data: { url: data.url || '/' },
      renotify: true,
      tag: data.tag || 'new-posts',
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Push event error', err);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.matchAll({ type: 'window' }).then(windowClients => {
    for (const client of windowClients) {
      if (client.url === url && 'focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
