const CACHE_NAME = 'todo-cache-v3';
const ASSETS_TO_CACHE = [
    './',
    './index.php',
    './style.css',
    './script.js',
    './manifest.json',
    './offline.html',
    './icon_todoapp1.png',
    './icon_todoapp2.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                .map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
        .catch(() => {
            return caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
                        return caches.match('./offline.html');
                    }
                });
        })
    );
});