const runtimeCaching = require('next-pwa/cache')

// Extend the default Workbox runtime caching rules so that all critical data and
// external resources needed by the application remain available when the user
// goes offline.
//
// 1. Static JSON + GeoJSON files shipped in /public are cached with
//    Stale-While-Revalidate so that they are served instantly once cached while
//    still receiving background updates when online.
// 2. OpenStreetMap (or any *.tile.openstreetmap.org) tiles are cached with a
//    Cache-First strategy – once fetched they will be served from the cache and
//    updated only when the cache entry expires (default 6 months).
// 3. The internal /api/media endpoint uses Network-First so that fresh content
//    is preferred but the app can still fall back to a cached response when
//    offline.
//
// You can tweak the limits to match your storage/time-to-live requirements.
const customRuntimeCaching = [
  ...runtimeCaching,
  {
    urlPattern: /\/(routes\.json|areas\.geojson)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-data',
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      },
      cacheableResponse: {
        statuses: [0, 200]
      }
    }
  },
  {
    urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'osm-tiles',
      expiration: {
        maxEntries: 2000,
        maxAgeSeconds: 60 * 60 * 24 * 180 // 6 months
      },
      cacheableResponse: {
        statuses: [0, 200]
      }
    }
  },
  {
    urlPattern: /^\/api\/media\/.*/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'route-media',
      networkTimeoutSeconds: 5,
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      },
      cacheableResponse: {
        statuses: [0, 200]
      }
    }
  }
]

// This block must come **after** runtimeCaching/customRuntimeCaching have been
// declared so that those variables are in scope.
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: customRuntimeCaching,
  fallbacks: {
    document: '/offline', // served when navigation fails (no network)
    // image: '/boulder_logo.png',
  },
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true
}

module.exports = withPWA(nextConfig) 