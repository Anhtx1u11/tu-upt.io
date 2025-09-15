// Danh sách các file cần cache để chạy offline
const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js'
  // Thêm các file quan trọng khác như ảnh, font...
];

// Sự kiện 'install': được gọi khi service worker được cài đặt
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Sự kiện 'fetch': được gọi mỗi khi có request mạng
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Nếu tìm thấy trong cache, trả về từ cache
        if (response) {
          return response;
        }
        // Nếu không, fetch từ mạng
        return fetch(event.request);
      })
  );
});