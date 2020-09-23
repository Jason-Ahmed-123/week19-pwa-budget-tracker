// Followed instructions from module 19, lesson 4

// define which files to cache
const FILES_TO_CACHE = [
    "./index.html",
    "./css/style.css",
    "./js/index.js",
    "./js/idb.js",
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png"
  ];

  const CACHE_NAME = "static-cache-v1";
  const DATA_CACHE_NAME = "data-cache-v1";

  // This is the install event
  self.addEventListener('install', function (e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        console.log('installing cache : ' + CACHE_NAME)
        return cache.addAll(FILES_TO_CACHE)
      })
    )

    self.skipWaiting();
  })

  // To activate:
  self.addEventListener("activate", (e) => {
    // remove old caches
    e.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    )
    
    self.clients.claim();

// fetch

// caching api responses 
// creates clone from idb.js and stores it in the browser when there is no internet.
self.addEventListener("fetch", function (e) {
  if (e.request.url.includes("/api/")) {
      e.respondWith(
          caches.open(DATA_CACHE_NAME).then(cache => {
              return fetch(e.request)
                  .then(response => {
                      // If the response was good, clone it and store it in the cache.
                      if (response.status === 200) {
                          cache.put(e.request.url, response.clone());
                      }

                      return response;
                  })
                  .catch(err => {
                      // Network request failed, try to get it from the cache.
                      return cache.match(e.request);
                  });
          }).catch(err => console.log(err))
      );

      // stop the fetch event callback:
      return;
  }

  // if the request is not for the API, then pull existing assets using "offline-first" approach.
  e.respondWith(
      caches.open(CACHE_NAME).then(cache => {
          return cache.match(e.request).then(response => {
              return response || fetch(e.request);
          });
      })
  );
});