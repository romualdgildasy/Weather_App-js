const CACHE_NAME = "meteo-app-v3";
const urlsToCache = [
  "./",
  "./index.html",
  "./script.js",
  "./manifest.json",
  "./images/icon-192.png",
  "./images/icon-512.png",
  "./images/day-1.svg",
  "./images/clouds.svg",
  "./images/rain.svg",
  "./images/drizzle.svg",
  "./images/snow.svg",
  "./images/mist.svg",
  "./images/th.svg"
];

// Installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activation
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch (stratégie Cache First)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});