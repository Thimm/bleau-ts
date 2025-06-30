import React from 'react'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { BookmarkIcon, LinkIcon, MapPinIcon, PlayIcon, ShareIcon } from '@heroicons/react/24/outline'
import { AreaName } from './AreaName'
import { getGradeColor, getPopularityColor, getGradeColorHex } from '@/utils/gradeUtils'
import type { Route } from '@/types'

interface RouteCardProps {
  route: Route
  projects: Set<string>
  onToggleProject: (routeId: string) => void
  onShowOnMap: (route: Route) => void
  onOpenMedia?: (route: Route) => void
  variant?: 'compact' | 'detailed' | 'popup'
  showActions?: boolean
  className?: string
}

export function RouteCard({ 
  route, 
  projects, 
  onToggleProject, 
  onShowOnMap, 
  onOpenMedia,
  variant = 'detailed',
  showActions = true,
  className = ''
}: RouteCardProps) {
  const isProject = projects.has(route.bleau_info_id)



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

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, a')) {
      return
    }
    // Navigate to route page
    window.location.href = `/route/${route.bleau_info_id}`
  }

  if (variant === 'popup') {
    return (
      <div className={`text-black min-w-[200px] ${className}`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-lg">{route.name}</h3>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${route.latitude},${route.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:text-green-600 transition-colors"
              title="Get directions to this problem"
            >
              <MapPinIcon className="w-4 h-4" />
            </a>
          </div>
          <button
            onClick={() => onToggleProject(route.bleau_info_id)}
            className={`ml-2 px-2 py-1 rounded text-xs ${
              isProject
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isProject ? '★ Project' : '☆ Add'}
          </button>
        </div>
        
        <div className="space-y-1 text-sm mb-3">
          <div className="flex justify-between">
            <span>Grade:</span>
            <span 
              className="px-2 py-1 rounded text-white font-semibold"
              style={{ backgroundColor: getGradeColorHex(route.grade) }}
            >
              {route.grade}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Area:</span>
            <span className="font-medium">{route.area_name}</span>
          </div>
          <div className="flex justify-between">
            <span>Style:</span>
            <span>{route.steepness}</span>
          </div>
          <div className="flex justify-between">
            <span>Start:</span>
            <span>{route.sit_start ? 'Sit start' : 'Standing'}</span>
          </div>
          <div className="flex justify-between">
            <span>Popularity:</span>
            <span>{route.popularity}/100</span>
          </div>
        </div>
        
        {route.bleau_info_id && (
          <div className="mt-3">
            <a
              href={`https://bleau.info/${route.area_name.toLowerCase()}/${route.bleau_info_id}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              View on Bleau.info ↗
            </a>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div
        className={`card p-3 hover:bg-rock-700 transition-colors cursor-pointer ${className}`}
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-white truncate">
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
                <MapPinIcon className="w-3 h-3" />
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleShareRoute(route)
                }}
                className="text-rock-400 hover:text-white transition-colors"
                title="Share route"
              >
                <ShareIcon className="w-3 h-3" />
              </button>
            </div>
            <AreaName areaName={route.area_name} className="text-xs" />
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleProject(route.bleau_info_id)
            }}
            className="text-red-400 hover:text-red-300 transition-colors p-1"
            title="Remove from projects"
          >
            <BookmarkSolidIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs mb-3">
          <span 
            className={`px-2 py-1 rounded text-white font-semibold ${getGradeColor(route.grade)}`}
          >
            {route.grade}
          </span>
          <span className="text-rock-400">
            {route.steepness}
          </span>
          <span className="text-rock-400">
            ★ {route.popularity}
          </span>
        </div>

        {showActions && (
          <div className="space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onShowOnMap(route)
              }}
              className="w-full bg-rock-600 hover:bg-rock-500 text-white text-center py-1 px-3 rounded text-xs transition-colors flex items-center justify-center space-x-1"
            >
              <MapPinIcon className="w-3 h-3" />
              <span>Show on Map</span>
            </button>
            {route.bleau_info_id && onOpenMedia && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenMedia(route)
                  }}
                  className="w-full bg-rock-600 hover:bg-rock-500 text-white text-center py-1 px-3 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                >
                  <PlayIcon className="w-3 h-3" />
                  <span>View Media</span>
                </button>
                <a
                  href={`https://bleau.info/${route.area_name.toLowerCase()}/${route.bleau_info_id}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-1 px-3 rounded text-xs transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  View on Bleau.info ↗
                </a>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  // Detailed variant (default)
  return (
    <div
      className={`card p-4 hover:bg-rock-700 transition-colors cursor-pointer ${
        isProject ? 'ring-2 ring-yellow-500' : ''
      } ${className}`}
      onClick={handleCardClick}
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
            <span className={`text-sm ${getPopularityColor(route.popularity)}`}>
              {route.popularity}
            </span>
          </div>
        </div>
      </div>

      {showActions && (
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



          {route.bleau_info_id && onOpenMedia && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenMedia(route)
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
      )}
    </div>
  )
} 