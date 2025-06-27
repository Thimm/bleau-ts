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
      <div>
        <video controls class="w-full h-auto rounded-lg">
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
      <div class="aspect-video">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen 
          class="w-full h-full rounded-lg">
        </iframe>
      </div>
    `
  }
  return ''
}

export function createImageHTML(imageInfo: ImageInfo | null): string {
  if (!imageInfo) return ''

  return `
    <div>
      <img 
        src="${imageInfo.url}" 
        class="w-full h-auto object-cover rounded-lg"
        alt="Route image"
        loading="lazy"
      >
    </div>
  `
} 