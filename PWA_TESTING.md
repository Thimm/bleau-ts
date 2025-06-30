# PWA Testing Guide

Your Fontainebleau Route Finder is now configured as a Progressive Web App! Here's how to test it:

## 🚀 Quick Test (Chrome DevTools)

1. **Open the app**: http://localhost:3000
2. **Open DevTools** (F12) → **Application** tab
3. **Check these sections**:
   - **Manifest**: Should show "Fontainebleau Route Finder" with install prompt
   - **Service Workers**: Should show `sw.js` as active
   - **Storage** → **Cache Storage**: Should show multiple caches:
     - `static-data` (for routes.json, areas.geojson)
     - `osm-tiles` (for map tiles)
     - `route-media` (for API responses)

## 📱 Install & Test on Mobile

### Android (Chrome)
1. Open http://localhost:3000 on your phone
2. You should see an "Add to Home Screen" prompt
3. Or tap the menu → "Add to Home Screen"
4. The app should install and open like a native app

### iOS (Safari)
1. Open http://localhost:3000 in Safari
2. Tap the share button → "Add to Home Screen"
3. The app should appear on your home screen

## 🔄 Offline Testing

### Method 1: Chrome DevTools
1. Open DevTools → **Network** tab
2. Check "Offline" checkbox
3. Refresh the page - it should still work!
4. Navigate to different routes - cached content should load

### Method 2: Real Device
1. Install the PWA on your phone
2. Turn on airplane mode
3. Open the app - it should work offline
4. Previously viewed routes and map tiles should be available

## 🗺️ Map Tile Caching Test

1. **With internet**: Zoom around the map in different areas
2. **Go offline**: Turn off WiFi/mobile data
3. **Test**: Previously viewed map areas should still show
4. **New areas**: Should show a loading state or error

## 📊 Data Caching Test

1. **Load routes**: Browse different areas and routes
2. **Go offline**: Disconnect from internet
3. **Verify**: All previously loaded route data should be available
4. **Search**: Should work with cached data

## 🔧 Advanced Testing

### Check Service Worker
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Active SW:', registrations[0]?.active)
})
```

### Check Cache Contents
```javascript
// In browser console
caches.keys().then(names => {
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(requests => {
        console.log(`Cache ${name}:`, requests.length, 'items')
      })
    })
  })
})
```

### Force Update
```javascript
// In browser console
navigator.serviceWorker.getRegistration().then(registration => {
  registration.update()
})
```

## ✅ Expected Results

- ✅ App installs to home screen
- ✅ Works offline after initial load
- ✅ Map tiles cache properly
- ✅ Route data persists offline
- ✅ Offline page shows for uncached routes
- ✅ Smooth transitions between online/offline

## 🐛 Troubleshooting

### PWA not installing?
- Check manifest.json is valid
- Ensure HTTPS (or localhost for development)
- Clear browser cache

### Offline not working?
- Check service worker is registered
- Verify cache storage has content
- Check browser console for errors

### Map tiles not caching?
- Ensure you've viewed the areas while online
- Check `osm-tiles` cache in DevTools
- Verify network requests to tile servers

## 📈 Performance Notes

- **First load**: ~135KB (includes all PWA assets)
- **Subsequent loads**: Much faster (cached)
- **Offline capability**: Full after initial cache population
- **Storage usage**: ~50-100MB for comprehensive map coverage

---

**Your PWA is ready!** 🎉 Test it thoroughly and enjoy offline bouldering route discovery! 