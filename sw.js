const CACHE_NAME = 'item-finder-v3';
const urlsToCache = [
  './',
  './index.html',
  './rooms.html',
  './backup.html',
  './css/style.css',
  './js/script.js',
  './js/rooms.js',
  './js/backup.js',
  './manifest.json',
  './assets/hero.png',
  './assets/alps.jpg',
  './assets/positano.jpg'
];

// 설치: 모든 파일을 캐시에 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// 활성화: 이전 버전 캐시 삭제
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

// 요청 처리: 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', event => {
  // 외부 CDN 요청은 네트워크 우선
  if (!event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // 로컬 파일은 캐시 우선 (오프라인에서도 앱 실행 가능)
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
