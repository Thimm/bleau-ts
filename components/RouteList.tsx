import React, { useState } from 'react'
import { MediaModal } from './MediaModal'
import { RouteCard } from './RouteCard'
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
        {routes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            projects={projects}
            onToggleProject={onToggleProject}
            onShowOnMap={onShowOnMap}
            onOpenMedia={openMediaModal}
            variant="detailed"
          />
        ))}
      </div>
      
      <MediaModal
        route={selectedRoute}
        isOpen={isMediaModalOpen}
        onClose={closeMediaModal}
      />
    </div>
  )
} 