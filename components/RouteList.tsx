import React, { useState } from 'react'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { BookmarkIcon, LinkIcon, MapPinIcon, PlayIcon, ShareIcon } from '@heroicons/react/24/outline'
import { MediaModal } from './MediaModal'
import { AreaName } from './AreaName'
import type { Route } from '@/types'

interface RouteListProps {
  routes: Route[]
  projects: Set<string>
  onToggleProject: (routeId: string) => void
  onShowOnMap: (route: Route) => void
}

export function RouteList({ routes, projects, onToggleProject, onShowOnMap }: RouteListProps) {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)

  const openMediaModal = (route: Route) => {
    setSelectedRoute(route)
    setIsMediaModalOpen(true)
  }

  const closeMediaModal = () => {
    setIsMediaModalOpen(false)
    setSelectedRoute(null)
  }

  const handleShareRoute = async (route: Route) => {
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
          // Show success feedback
          const button = document.activeElement as HTMLElement
          if (button) {
            const originalText = button.innerHTML
            button.innerHTML = '<span class="text-green-400">Copied!</span>'
            setTimeout(() => {
              button.innerHTML = originalText
            }, 2000)
          }
        } catch (clipboardError) {
          console.error('Error copying to clipboard:', clipboardError)
          // Final fallback - show URL in alert
          alert(`Share this link: ${shareUrl}`)
        }
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(shareUrl)
        // Show success feedback
        const button = document.activeElement as HTMLElement
        if (button) {
          const originalText = button.innerHTML
          button.innerHTML = '<span class="text-green-400">Copied!</span>'
          setTimeout(() => {
            button.innerHTML = originalText
          }, 2000)
        }
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError)
        // Final fallback - show URL in alert
        alert(`Share this link: ${shareUrl}`)
      }
    }
  }

  const getGradeColor = (grade: string) => {
    const colors = {
      '2': 'bg-green-500', '2+': 'bg-green-500',
      '3': 'bg-green-500', '3+': 'bg-green-500',
      '4': 'bg-lime-500', '4+': 'bg-lime-500',
      '5': 'bg-lime-500', '5+': 'bg-lime-500',
      '6a': 'bg-yellow-500', '6a+': 'bg-yellow-500',
      '6b': 'bg-orange-500', '6b+': 'bg-orange-500',
      '6c': 'bg-red-500', '6c+': 'bg-red-500',
      '7a': 'bg-red-600', '7a+': 'bg-red-600',
      '7b': 'bg-red-700', '7b+': 'bg-red-700',
      '7c': 'bg-red-800', '7c+': 'bg-red-800',
      '8a': 'bg-orange-800', '8a+': 'bg-orange-800',
      '8b': 'bg-orange-900', '8b+': 'bg-orange-900',
    }
    return colors[grade as keyof typeof colors] || 'bg-rock-500'
  }

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 80) return 'text-yellow-400'
    if (popularity >= 60) return 'text-orange-400'
    if (popularity >= 40) return 'text-blue-400'
    return 'text-rock-400'
  }

  if (routes.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-rock-400 text-lg">
          No routes found matching your criteria.
        </div>
        <p className="text-rock-500 mt-2">
          Try adjusting your filters to see more routes.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {routes.map((route) => {
          const isProject = projects.has(route.bleau_info_id)
          
          return (
            <div
              key={route.id}
              className={`card p-4 hover:bg-rock-700 transition-colors cursor-pointer ${
                isProject ? 'ring-2 ring-yellow-500' : ''
              }`}
              onClick={(e) => {
                // Don't navigate if clicking on interactive elements
                if ((e.target as HTMLElement).closest('button, a')) {
                  return
                }
                // Save scroll position before navigating
                const mainElement = document.querySelector('main')
                if (mainElement) {
                  localStorage.setItem('scrollPosition', mainElement.scrollTop.toString())
                }
                // Navigate to route page
                window.location.href = `/route/${route.bleau_info_id}`
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-white truncate text-lg">
                      {route.name}
                    </h3>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${route.latitude},${route.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 hover:text-green-400 transition-colors"
                      title="Get directions to this problem"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MapPinIcon className="w-4 h-4" />
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShareRoute(route)
                      }}
                      className="text-rock-400 hover:text-white transition-colors"
                      title="Share route"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <AreaName areaName={route.area_name} />
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleProject(route.bleau_info_id)
                  }}
                  className={`ml-2 p-2 rounded-lg transition-colors ${
                    isProject
                      ? 'text-yellow-500 hover:bg-yellow-500/10'
                      : 'text-rock-400 hover:text-white hover:bg-rock-600'
                  }`}
                  title={isProject ? 'Remove from projects' : 'Add to projects'}
                >
                  {isProject ? (
                    <BookmarkSolidIcon className="w-5 h-5" />
                  ) : (
                    <BookmarkIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-rock-300 text-sm">Grade:</span>
                  <span 
                    className={`px-2 py-1 rounded text-white font-semibold text-sm ${getGradeColor(route.grade)}`}
                  >
                    {route.grade}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-rock-300 text-sm">Style:</span>
                  <span className="text-white text-sm capitalize">{route.steepness}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-rock-300 text-sm">Start:</span>
                  <span className="text-white text-sm">
                    {route.sit_start ? 'Sit start' : 'Standing'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-rock-300 text-sm">Popularity:</span>
                  <div className="flex items-center space-x-1">
                    <span className={`font-semibold ${getPopularityColor(route.popularity)}`}>
                      {route.popularity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onShowOnMap(route)
                  }}
                  className="btn-secondary w-full flex items-center justify-center space-x-2 text-sm"
                >
                  <MapPinIcon className="w-4 h-4" />
                  <span>Show on Map</span>
                </button>

                <a
                  href={`/route/${route.bleau_info_id}`}
                  className="btn-secondary w-full flex items-center justify-center space-x-2 text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>View Details</span>
                </a>

                {route.bleau_info_id && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openMediaModal(route)
                      }}
                      className="btn-secondary w-full flex items-center justify-center space-x-2 text-sm"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span>View Media</span>
                    </button>
                    <a
                      href={`https://bleau.info/${route.area_name.toLowerCase()}/${route.bleau_info_id}.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full flex items-center justify-center space-x-2 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>View on Bleau.info</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      <MediaModal
        route={selectedRoute}
        isOpen={isMediaModalOpen}
        onClose={closeMediaModal}
      />
    </div>
  )
} 