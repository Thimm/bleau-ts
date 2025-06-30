interface AreaBounds {
    southWestLat: string
    southWestLon: string
    northEastLat: string
    northEastLon: string
}

interface Area {
    properties: AreaBounds
}

interface AreasData {
    features: Area[]
}

// Calculate tile coordinates from lat/lon
function latLonToTile(lat: number, lon: number, zoom: number): [number, number] {
    const n = Math.pow(2, zoom)
    const xtile = Math.floor((lon + 180) / 360 * n)
    const ytile = Math.floor((1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * n)
    return [xtile, ytile]
}

// Generate tile URLs for a bounding box
function generateTileUrls(bounds: AreaBounds, zoomLevels: number[]): string[] {
    const urls: string[] = []

    for (const zoom of zoomLevels) {
        const [minX, minY] = latLonToTile(
            parseFloat(bounds.southWestLat),
            parseFloat(bounds.southWestLon),
            zoom
        )
        const [maxX, maxY] = latLonToTile(
            parseFloat(bounds.northEastLat),
            parseFloat(bounds.northEastLon),
            zoom
        )

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                // OpenStreetMap tile URL format
                const url = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`
                urls.push(url)
            }
        }
    }

    return urls
}

// Prefetch tiles for all areas
export async function prefetchAllTiles(
    onProgress?: (progress: { success: number; failed: number; total: number; current: number }) => void
): Promise<{ success: number; failed: number; total: number }> {
    try {
        // Load areas data
        const response = await fetch('/areas.geojson')
        const areasData: AreasData = await response.json()

        // Define zoom levels to prefetch (most commonly used)
        const zoomLevels = [12, 13, 14, 15, 16]

        // Generate all tile URLs
        const allTileUrls: string[] = []
        areasData.features.forEach(area => {
            const tileUrls = generateTileUrls(area.properties, zoomLevels)
            allTileUrls.push(...tileUrls)
        })

        // Remove duplicates
        const uniqueUrls = Array.from(new Set(allTileUrls))

        console.log(`Prefetching ${uniqueUrls.length} tiles for ${areasData.features.length} areas...`)

        // Prefetch tiles in batches to avoid overwhelming the server
        const batchSize = 10
        let success = 0
        let failed = 0

        for (let i = 0; i < uniqueUrls.length; i += batchSize) {
            const batch = uniqueUrls.slice(i, i + batchSize)

            const batchPromises = batch.map(async (url) => {
                try {
                    const response = await fetch(url, {
                        cache: 'force-cache' // Force caching
                    })
                    if (response.ok) {
                        // Store in cache for offline use
                        const cache = await caches.open('osm-tiles')
                        await cache.put(url, response.clone())
                        return 'success'
                    } else {
                        return 'failed'
                    }
                } catch (error) {
                    return 'failed'
                }
            })

            const results = await Promise.allSettled(batchPromises)
            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    if (result.value === 'success') success++
                    else failed++
                } else {
                    failed++
                }
            })

            // Report progress
            const current = Math.min(i + batchSize, uniqueUrls.length)
            onProgress?.({ success, failed, total: uniqueUrls.length, current })

            // Small delay between batches to be respectful to the tile server
            if (i + batchSize < uniqueUrls.length) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }
        }

        return { success, failed, total: uniqueUrls.length }
    } catch (error) {
        console.error('Error prefetching tiles:', error)
        throw error
    }
}

// Check if tiles are already cached
export async function checkTileCacheStatus(): Promise<{ cached: number; total: number }> {
    try {
        const cache = await caches.open('osm-tiles')
        const keys = await cache.keys()
        const tileKeys = keys.filter(key => key.url.includes('tile.openstreetmap.org'))

        return { cached: tileKeys.length, total: 0 } // We don't know total without recalculating
    } catch (error) {
        console.error('Error checking cache status:', error)
        return { cached: 0, total: 0 }
    }
} 