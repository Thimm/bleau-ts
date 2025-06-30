'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon, PlayIcon } from '@heroicons/react/24/outline'
import { MediaModal } from '@/components/MediaModal'
import { RouteHeader } from '@/components/RouteHeader'
import { RouteMap } from '@/components/RouteMap'
import { gradeToNumeric, getPopularityColor } from '@/utils/gradeUtils'
import { loadJSON, saveJSON } from '@/utils/storage'
import { getMediaFromBleauPage, createVideoHTML, createImageHTML } from '@/utils/mediaUtils'
import type { Route } from '@/types'

export default function RoutePage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id as string
  
  const [route, setRoute] = useState<Route | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [areas, setAreas] = useState<any>(null)
  const [projects, setProjects] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [mediaInfo, setMediaInfo] = useState<any>(null)
  const [mediaLoading, setMediaLoading] = useState(false)

  useEffect(() => {
    // Load routes and areas data
    Promise.all([
      fetch('/routes.json').then(res => res.json()),
      fetch('/areas.geojson').then(res => res.json())
    ]).then(([routesData, areasData]) => {
      const processedRoutes = routesData.map((route: any) => ({
        ...route,
        grade_numeric: gradeToNumeric(route.grade || '')
      }))
      setRoutes(processedRoutes)
      setAreas(areasData)
      
      // Find the specific route
      const targetRoute = processedRoutes.find((r: Route) => r.bleau_info_id === routeId)
      if (targetRoute) {
        setRoute(targetRoute)
        // Load media for this route
        loadMedia(targetRoute)
      } else {
        // Route not found
        router.push('/')
      }
      setLoading(false)
    }).catch(err => {
      console.error('Error loading data:', err)
      setLoading(false)
      router.push('/')
    })

    // Load projects
    try {
      const savedProjects = window.localStorage.getItem('projects')
      if (savedProjects) {
        setProjects(new Set(JSON.parse(savedProjects)))
      }
    } catch (error) {
      console.error('Error reading projects from localStorage', error)
    }
  }, [routeId, router])

  const loadMedia = async (route: Route) => {
    if (!route.bleau_info_id) return
    
    setMediaLoading(true)
    try {
      const media = await getMediaFromBleauPage(route.area_name, route.bleau_info_id)
      setMediaInfo(media)
    } catch (error) {
      console.error('Error loading media:', error)
    } finally {
      setMediaLoading(false)
    }
  }

  const toggleProject = (routeId: string) => {
    const newProjects = new Set(projects)
    if (newProjects.has(routeId)) {
      newProjects.delete(routeId)
    } else {
      newProjects.add(routeId)
    }
    setProjects(newProjects)
    saveJSON('projects', Array.from(newProjects))
  }

  const handleShare = async () => {
    if (!route) return
    
    const shareUrl = `${window.location.origin}/route/${route.bleau_info_id}`
    const shareText = `Check out this bouldering problem: ${route.name} (${route.grade}) in ${route.area_name}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${route.name} - Fontainebleau Route Finder`,
          text: shareText,
          url: shareUrl
        })
      } catch (error) {
        console.error('Error sharing route:', error)
        // Fallback to copying URL
        try {
          await navigator.clipboard.writeText(shareUrl)
          setShareSuccess(true)
          setTimeout(() => setShareSuccess(false), 2000)
        } catch (clipboardError) {
          console.error('Error copying to clipboard:', clipboardError)
        }
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(shareUrl)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2000)
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError)
      }
    }
  }

  const openMediaModal = () => {
    setIsMediaModalOpen(true)
  }

  const closeMediaModal = () => {
    setIsMediaModalOpen(false)
  }



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-xl">Loading route...</p>
        </div>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Route not found</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-rock-900 flex flex-col">
      {/* Header - Same as other pages */}
      <header className="bg-rock-800 border-b border-rock-700 px-4 py-3 sticky top-0 z-[1000]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-rock-300 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="hidden sm:block">Back to Routes</span>
            </button>
            <div className="flex items-center space-x-2">
              <img src="/boulder_logo.png" alt="Logo" className="w-8 h-8 rounded" />
              <h1 className="text-xl font-bold text-white hidden sm:block">Fontainebleau</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm text-rock-300 mr-4 hidden sm:block">
              <div>Route Details</div>
            </div>
          </div>
        </div>
      </header>

      {/* Route Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-rock-800 rounded-lg p-6 mb-6">
            {/* Route Header with Share and Project buttons */}
            <RouteHeader
              route={route}
              projects={projects}
              onToggleProject={toggleProject}
              onShare={handleShare}
              shareSuccess={shareSuccess}
              variant="page"
            />

            {/* Route Details - Redesigned */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex justify-between items-center p-4 bg-rock-700 rounded-lg">
                <span className="text-rock-300">Start:</span>
                <span className="text-white font-medium">{route.sit_start ? 'Sit start' : 'Standing'}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-rock-700 rounded-lg">
                <span className="text-rock-300">Popularity:</span>
                <span className={`font-semibold ${getPopularityColor(route.popularity)}`}>
                  {route.popularity}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-rock-700 rounded-lg">
                <span className="text-rock-300">Style:</span>
                <span className="text-white font-medium capitalize">{route.steepness}</span>
              </div>
            </div>

            {/* Action Buttons - Simplified */}
            <div className="flex flex-wrap gap-3">
              {route.bleau_info_id && (
                <a
                  href={`https://bleau.info/${route.area_name.toLowerCase()}/${route.bleau_info_id}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>View Details on Bleau.info</span>
                </a>
              )}
            </div>

            {/* Share Success Message */}
            {shareSuccess && (
              <div className="mt-4 p-3 bg-green-600 text-white rounded-lg text-center">
                Link copied to clipboard!
              </div>
            )}
          </div>

          {/* Map Section */}
          <div className="bg-rock-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Location</h2>
            <div className="h-96 rounded-lg overflow-hidden">
              <RouteMap
                routes={[route]}
                areas={areas}
                projects={projects}
                onToggleProject={toggleProject}
              />
            </div>
          </div>

          {/* Media Section */}
          {route.bleau_info_id && (
            <div className="bg-rock-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Media</h2>
              
              {mediaLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <span className="ml-3 text-rock-300">Loading media...</span>
                </div>
              ) : mediaInfo && (mediaInfo.video || mediaInfo.image) ? (
                <div className="space-y-6">
                  {mediaInfo.video && (
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                        <PlayIcon className="w-5 h-5 text-primary-500 mr-2" />
                        Video
                      </h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: createVideoHTML(mediaInfo.video)
                        }}
                        className="rounded-lg overflow-hidden"
                      />
                    </div>
                  )}

                  {mediaInfo.image && (
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                        <svg className="w-5 h-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Image
                      </h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: createImageHTML(mediaInfo.image)
                        }}
                        className="rounded-lg overflow-hidden"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-rock-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-rock-300">No media available for this route</p>
                  <p className="text-rock-500 text-sm mt-1">
                    Check Bleau.info for more details and media
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Modal */}
      <MediaModal
        route={route}
        isOpen={isMediaModalOpen}
        onClose={closeMediaModal}
      />
    </div>
  )
} 