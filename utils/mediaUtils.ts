interface VideoInfo {
    type: 'youtube' | 'mp4'
    url: string
}

interface ImageInfo {
    url: string
}

interface MediaInfo {
    video: VideoInfo | null
    image: ImageInfo | null
}

// Cache for media data to avoid repeated requests
const mediaCache = new Map<string, MediaInfo>()

export async function getMediaFromBleauPage(areaName: string, bleauInfoId: string): Promise<MediaInfo> {
    const cacheKey = `${areaName}-${bleauInfoId}`

    // Check cache first
    if (mediaCache.has(cacheKey)) {
        return mediaCache.get(cacheKey)!
    }

    try {
        const response = await fetch(`/api/media?area=${encodeURIComponent(areaName)}&id=${encodeURIComponent(bleauInfoId)}`)

        if (!response.ok) {
            console.log(`Failed to fetch media for ${areaName}/${bleauInfoId}: ${response.status}`)
            const emptyResult = { video: null, image: null }
            mediaCache.set(cacheKey, emptyResult)
            return emptyResult
        }

        const result = await response.json()

        // Cache the result
        mediaCache.set(cacheKey, result)
        return result
    } catch (error) {
        console.error(`Error fetching media for ${areaName}/${bleauInfoId}:`, error)
        const emptyResult = { video: null, image: null }
        mediaCache.set(cacheKey, emptyResult)
        return emptyResult
    }
}

export function createVideoHTML(videoInfo: VideoInfo | null): string {
    if (!videoInfo) return ''

    if (videoInfo.type === 'mp4') {
        return `
      <div class="mt-3 text-center">
        <video width="320" height="180" controls class="max-w-full rounded-lg">
          <source src="${videoInfo.url}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    `
    } else if (videoInfo.type === 'youtube') {
        // Extract YouTube video ID from embed URL
        let videoId = ''
        const youtubeUrl = videoInfo.url
        if (youtubeUrl.includes('youtube.com/embed/')) {
            videoId = youtubeUrl.split('youtube.com/embed/')[1].split('?')[0]
        } else if (youtubeUrl.includes('youtu.be/')) {
            videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0]
        } else {
            videoId = youtubeUrl
        }

        return `
      <div class="mt-3 text-center">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          width="320" 
          height="180" 
          frameborder="0" 
          allowfullscreen 
          class="max-w-full rounded-lg">
        </iframe>
      </div>
    `
    }
    return ''
}

export function createImageHTML(imageInfo: ImageInfo | null): string {
    if (!imageInfo) return ''

    return `
    <div class="mt-3 text-center">
      <img 
        src="${imageInfo.url}" 
        width="320" 
        class="max-w-full h-auto max-h-48 object-cover rounded-lg"
        alt="Route image"
        loading="lazy"
      >
    </div>
  `
} 