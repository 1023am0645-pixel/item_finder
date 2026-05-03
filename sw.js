const CACHE_NAME = 'item-finder-v6';
const STATIC_ASSETS = [
  './css/style.css',
  './js/script.js',
  './js/rooms.js',
  './js/backup.js',
  './js/firebase-sync.js',
  './manifest.json',
  './assets/hero.png',
  './assets/alps.jpg',
  './assets/positano.jpg'
];

// 설치: CSS/JS/이미지만 캐시 (HTML은 제외)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 활성화: 이전 버전 캐시 전부 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 외부 요청은 네트워크만 사용
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(event.request).catch(() => new Response('', {status: 408})));
    return;
  }

  // HTML 페이지는 항상 네트워크에서 받기 (캐시 사용 안 함)
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // CSS/JS/이미지는 캐시 우선
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
