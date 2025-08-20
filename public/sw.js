const CACHE_NAME = "gymonad-v1"
const urlsToCache = [
  "/",
  "/manifest.json",
  "/images/gymonad-header.jpg",
  "/images/purple-skull.jpg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gymonadtheme-Fuh0xpQtOA63uufs61fIneHPY136tL.mp3",
  "/thunder.mp3",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/swordsclashing1sec-Gu3scJA0wJCm9za9kdnHLXcJdMvdkp.mp3",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/guitarmp3-5NQgvR22O7TRWetiCDZvCln2LFfg6h.mp3",
]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})
