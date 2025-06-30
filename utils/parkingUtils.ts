export interface ParkingInfo {
    parking_name: string
    google_url: string
    distance_in_minutes: number
    transport: string
}

// Cache for parking data to avoid repeated requests
const parkingCache = new Map<string, ParkingInfo | null>()

export async function getParkingInfo(areaName: string): Promise<ParkingInfo | null> {
    const cacheKey = areaName.toLowerCase()

    // Check cache first
    if (parkingCache.has(cacheKey)) {
        return parkingCache.get(cacheKey)!
    }

    try {
        const response = await fetch(`/api/parking?area=${encodeURIComponent(areaName)}`)

        if (!response.ok) {
            if (response.status === 404) {
                // No parking info found for this area
                parkingCache.set(cacheKey, null)
                return null
            }
            throw new Error(`Failed to fetch parking info: ${response.status}`)
        }

        const result = await response.json()

        // Cache the result
        parkingCache.set(cacheKey, result)
        return result
    } catch (error) {
        console.error(`Error fetching parking info for ${areaName}:`, error)
        // Cache null to avoid repeated failed requests
        parkingCache.set(cacheKey, null)
        return null
    }
} 