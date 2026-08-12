const VERSION = "recode-canonical-10.0.0-pages";
const BASE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const withBase = (path) => `${BASE_PATH}${path}`;
const SHELL = `${VERSION}-shell`;
const CONTENT = `${VERSION}-content`;
const CORE = [
  withBase("/"), withBase("/manifest.webmanifest"), withBase("/favicon.svg"), withBase("/icon-192.png"), withBase("/icon-512.png"),
  withBase("/art/key/hero-desktop-v6.avif"), withBase("/art/key/hero-desktop-v6.webp"),
  withBase("/art/key/hero-mobile-v6.avif"), withBase("/art/key/hero-mobile-v6.webp"),
  withBase("/art/key/cast-v6.avif"), withBase("/art/key/cast-v6.webp"),
  withBase("/art/key/recode-hero-v10.webp"), withBase("/art/key/recode-origins-v10.webp"),
  withBase("/art/key/today-before-dawn-v7.webp"), withBase("/art/key/story-meridian-archive-v7.webp"),
  withBase("/art/locations/recode-meridian-city-v10.webp"),
];
const CONTENT_PATHS = new Set([
  withBase("/content/quests.json"), withBase("/content/events.json"), withBase("/content/exercises.json"),
  withBase("/content/characters.json"), withBase("/content/season_01.json"),
]);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(CORE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => ![SHELL, CONTENT].includes(key)).map((key) => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "RECODE_ACTIVATE_UPDATE") self.skipWaiting();
  if (event.data?.type === "RECODE_CLEAR_RUNTIME_CACHES") {
    event.waitUntil(caches.delete(CONTENT).then(() => caches.open(CONTENT)));
  }
});

async function contentResponse(request) {
  const cache = await caches.open(CONTENT);
  const cached = await cache.match(request, { ignoreSearch: true });
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

async function navigationResponse(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL);
      await cache.put(withBase("/"), response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(withBase("/"));
    return cached || new Response("Offline shell unavailable", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (CONTENT_PATHS.has(url.pathname)) {
    event.respondWith(contentResponse(event.request));
    return;
  }
  if (event.request.mode === "navigate") {
    event.respondWith(navigationResponse(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok && ["script", "style", "image", "font"].includes(event.request.destination)) {
        caches.open(SHELL).then((cache) => cache.put(event.request, response.clone()));
      }
      return response;
    })),
  );
});
