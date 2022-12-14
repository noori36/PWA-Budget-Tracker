const APPName = "BudgetTracker-";
const Version = "version_01";
const CACHE_NAME = APPName + Version;

const FILES_TO_CACHE = [
  "./index.html",
  "./css/styles.css",
  "./js/index.js",
  "./js/idb.js",
  "./manifest.json",
  "./icons/icon-512x512.png",
  "./icons/icon-384x384.png",
  "./icons/icon-192x192.png",
  "./icons/icon-152x152.png",
  "./icons/icon-144x144.png",
  "./icons/icon-128x128.png",
  "./icons/icon-96x96.png",
  "./icons/icon-72x72.png",
];


self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("installing cache : " + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});


self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APPName);
      });
      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log("deleting cache : " + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
    if (e.request.url.includes("/api/") && e.request.method === "GET") {
      evt.respondWith(
        caches
          .open(CACHE_NAME)
          .then((cache) => {
            return fetch(e.request)
              .then((response) => {
                if (response.status === 200) {
                  cache.put(e.request, response.clone());
                }  
                return response;
              })
              .catch(() => {
                return cache.match(e.request);
              });
          })
          .catch((err) => console.log(err))
      );
  
      return;
    }
  
    e.respondWith(
      caches.match(e.request).then((response) => {
        return response || fetch(e.request);
      })
    );
  });