import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const areaName = searchParams.get('area')
    const bleauInfoId = searchParams.get('id')

    if (!areaName || !bleauInfoId) {
        return NextResponse.json(
            { error: 'Missing area or id parameter' },
            { status: 400 }
        )
    }

    try {
        const url = `https://bleau.info/${areaName.toLowerCase()}/${bleauInfoId}.html`
        console.log(`Fetching media from: ${url}`)

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })

        if (!response.ok) {
            console.log(`Failed to fetch ${url}: ${response.status}`)
            return NextResponse.json({ video: null, image: null })
        }

        const html = await response.text()
        console.log(`HTML length: ${html.length}`)

        // Parse HTML using regex since we're on the server side
        let videoInfo: VideoInfo | null = null
        let imageInfo: ImageInfo | null = null

        // Look for videos in boulder_mp4s section
        const boulderMp4sMatch = html.match(/<div[^>]*class="[^"]*boulder_mp4s[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
        if (boulderMp4sMatch) {
            console.log(`Found boulder_mp4s section for ${areaName}/${bleauInfoId}`)
            const boulderMp4sContent = boulderMp4sMatch[1]

            // Look for YouTube embeds (iframes)
            const youtubeMatch = boulderMp4sContent.match(/<iframe[^>]*src="([^"]*(?:youtube\.com\/embed\/|youtu\.be)[^"]*)"[^>]*>/i)
            if (youtubeMatch) {
                videoInfo = { type: 'youtube', url: youtubeMatch[1] }
                console.log(`Found YouTube video: ${youtubeMatch[1]}`)
            } else {
                // Look for direct video files
                const videoMatch = boulderMp4sContent.match(/<source[^>]*src="([^"]*\.(?:mp4|webm|ogg))"[^>]*>/i)
                if (videoMatch) {
                    videoInfo = { type: 'mp4', url: videoMatch[1] }
                    console.log(`Found MP4 video: ${videoMatch[1]}`)
                }
            }
        } else {
            console.log(`No boulder_mp4s section found for ${areaName}/${bleauInfoId}`)
        }

        // Look for images in boulder_photos section
        const boulderPhotosMatch = html.match(/<div[^>]*class="[^"]*boulder_photos[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
        if (boulderPhotosMatch) {
            console.log(`Found boulder_photos section for ${areaName}/${bleauInfoId}`)
            const boulderPhotosContent = boulderPhotosMatch[1]
            console.log(`boulder_photos content length: ${boulderPhotosContent.length}`)

            // Try multiple approaches to find images

            // Approach 1: Look for the first boulder_photo div
            const boulderPhotoMatch = boulderPhotosContent.match(/<div[^>]*class="[^"]*boulder_photo[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
            if (boulderPhotoMatch) {
                console.log(`Found boulder_photo div for ${areaName}/${bleauInfoId}`)
                const boulderPhotoContent = boulderPhotoMatch[1]
                console.log(`boulder_photo content length: ${boulderPhotoContent.length}`)

                // Look for fancybox links with images (more flexible pattern)
                const fancyboxMatch = boulderPhotoContent.match(/<a[^>]*class="[^"]*fancybox[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>/i)
                if (fancyboxMatch) {
                    let imageUrl = fancyboxMatch[1]
                    if (imageUrl.startsWith('/')) {
                        imageUrl = `https://bleau.info${imageUrl}`
                    }
                    imageInfo = { url: imageUrl }
                    console.log(`Found image via fancybox: ${imageUrl}`)
                } else {
                    console.log(`No fancybox image found, trying direct img tag`)
                    // Fallback: look for any img tag
                    const imgMatch = boulderPhotoContent.match(/<img[^>]*src="([^"]*)"[^>]*>/i)
                    if (imgMatch) {
                        let imageUrl = imgMatch[1]
                        if (imageUrl.startsWith('/')) {
                            imageUrl = `https://bleau.info${imageUrl}`
                        }
                        imageInfo = { url: imageUrl }
                        console.log(`Found image via direct img tag: ${imageUrl}`)
                    } else {
                        console.log(`No img tag found in boulder_photo content`)
                    }
                }
            } else {
                console.log(`No boulder_photo div found in boulder_photos for ${areaName}/${bleauInfoId}`)
            }

            // Approach 2: If no image found yet, try to find any img tag in the entire boulder_photos section
            if (!imageInfo) {
                console.log(`Trying to find any img tag in boulder_photos section`)
                const anyImgMatch = boulderPhotosContent.match(/<img[^>]*src="([^"]*)"[^>]*>/i)
                if (anyImgMatch) {
                    let imageUrl = anyImgMatch[1]
                    if (imageUrl.startsWith('/')) {
                        imageUrl = `https://bleau.info${imageUrl}`
                    }
                    imageInfo = { url: imageUrl }
                    console.log(`Found image via any img tag in boulder_photos: ${imageUrl}`)
                } else {
                    console.log(`No img tag found anywhere in boulder_photos section`)
                }
            }

            // Approach 3: Look for any link with an image (not just fancybox)
            if (!imageInfo) {
                console.log(`Trying to find any link with img tag`)
                const linkImgMatch = boulderPhotosContent.match(/<a[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>/i)
                if (linkImgMatch) {
                    let imageUrl = linkImgMatch[1]
                    if (imageUrl.startsWith('/')) {
                        imageUrl = `https://bleau.info${imageUrl}`
                    }
                    imageInfo = { url: imageUrl }
                    console.log(`Found image via link with img: ${imageUrl}`)
                } else {
                    console.log(`No link with img found`)
                }
            }
        } else {
            console.log(`No boulder_photos section found for ${areaName}/${bleauInfoId}`)
        }

        // Final fallback: if no image found yet, search the entire HTML for any img tag
        if (!imageInfo) {
            console.log(`No image found in boulder_photos, trying entire HTML as fallback`)
            const fallbackImgMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*>/i)
            if (fallbackImgMatch) {
                let imageUrl = fallbackImgMatch[1]
                // Only use if it looks like a route image (not a logo, icon, etc.)
                if (imageUrl.includes('/photos/') || imageUrl.includes('/images/') || imageUrl.includes('bleau.info')) {
                    if (imageUrl.startsWith('/')) {
                        imageUrl = `https://bleau.info${imageUrl}`
                    }
                    imageInfo = { url: imageUrl }
                    console.log(`Found image via HTML fallback: ${imageUrl}`)
                } else {
                    console.log(`Fallback image found but doesn't look like a route image: ${imageUrl}`)
                }
            } else {
                console.log(`No img tag found anywhere in HTML`)
            }
        }

        const result: MediaInfo = { video: videoInfo, image: imageInfo }
        console.log(`Final result for ${areaName}/${bleauInfoId}: video=${videoInfo}, image=${imageInfo}`)
        return NextResponse.json(result)
    } catch (error) {
        console.error(`Error fetching media for ${areaName}/${bleauInfoId}:`, error)
        return NextResponse.json(
            { error: 'Failed to fetch media' },
            { status: 500 }
        )
    }
} 