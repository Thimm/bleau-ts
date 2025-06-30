import React, { useState, useEffect } from 'react'
import { TrashIcon, ShareIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import { MediaModal } from './MediaModal'
import { RouteCard } from './RouteCard'
import type { Route } from '@/types'

interface ProjectListProps {
  routes: Route[]
  projects: Set<string>
  onToggleProject: (routeId: string) => void
  onClose: () => void
  onShowOnMap: (route: Route) => void
}

export function ProjectList({ routes, projects, onToggleProject, onClose, onShowOnMap }: ProjectListProps) {
  const [isClient, setIsClient] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const canShare = isClient && !!navigator.share

  const projectRoutes = routes.filter(route => projects.has(route.bleau_info_id))
  
  const generateShareableUrl = (route: Route) => {
    return `${window.location.origin}/route/${route.bleau_info_id}`
  }
  
  const clearAllProjects = () => {
    projectRoutes.forEach(route => onToggleProject(route.bleau_info_id))
  }
  
  const handleShareOrExport = async () => {
    const markdownContent = 
      `# My Fontainebleau Projects\n\n` +
      projectRoutes
        .map(route => {
          const popularity = route.popularity || 0
          const filledStars = Math.max(0, Math.min(5, Math.round(popularity / 20)))
          const emptyStars = Math.max(0, 5 - filledStars)
          
          return `## ${route.name} (${route.grade})\n` +
            `- **Area:** ${route.area_name}\n` +
            `- **Style:** ${route.steepness}\n` +
            `- **Popularity:** ${'★'.repeat(filledStars)}${'☆'.repeat(emptyStars)}\n` +
            `- **App Link:** [${route.name} on Fontainebleau Route Finder](${generateShareableUrl(route)})\n` +
            `- **Details:** [${route.name} on Bleau.info](https://bleau.info/${route.area_name.toLowerCase()}/${route.bleau_info_id}.html)`
        })
        .join('\n\n');

    // Try native sharing first (especially for mobile)
    if (navigator.share) {
      try {
        // Create a more mobile-friendly share content
        const shareText = projectRoutes.length === 1 
          ? `Check out my bouldering project: ${projectRoutes[0].name} (${projectRoutes[0].grade}) in ${projectRoutes[0].area_name}`
          : `Check out my ${projectRoutes.length} bouldering projects in Fontainebleau!`
        
        const shareData: any = {
          title: 'My Fontainebleau Projects',
          text: shareText,
        }

        // Add URL if we have projects - use app URL instead of bleau.info
        if (projectRoutes.length > 0) {
          if (projectRoutes.length === 1) {
            // Single route: link directly to that route
            shareData.url = generateShareableUrl(projectRoutes[0])
          } else {
            // Multiple routes: link to the app with all routes as projects
            const projectIds = Array.from(projects).join(',')
            shareData.url = `${window.location.origin}/?projects=${projectIds}`
          }
        }

        // Try to share files if supported
        if (navigator.canShare && navigator.canShare({ files: [] })) {
          const file = new File([markdownContent], `fontainebleau-projects.md`, { type: 'text/markdown' })
          if (navigator.canShare({ files: [file] })) {
            shareData.files = [file]
          }
        }

        await navigator.share(shareData)
        console.log('Successfully shared')
        return
      } catch (error) {
        console.error('Error sharing:', error)
        // Continue to fallback if sharing fails
      }
    }
    
    // Fallback to download
    downloadFile(markdownContent)
  }

  const downloadFile = (content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fontainebleau-projects-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }



  const openMediaModal = (route: Route) => {
    setSelectedRoute(route)
    setIsMediaModalOpen(true)
  }

  const closeMediaModal = () => {
    setIsMediaModalOpen(false)
    setSelectedRoute(null)
  }

  const handleShareRoute = async (route: Route) => {
    const shareUrl = generateShareableUrl(route)
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

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 h-full w-full sm:w-96 bg-rock-800 border-r border-rock-700 z-50 flex flex-col"
    >
      <div className="p-4 flex items-center justify-between mb-6 shrink-0 border-b border-rock-700">
        <div className="flex items-center space-x-2">
          <BookmarkIcon className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold">My Projects</h2>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 bg-rock-700 hover:bg-rock-600 rounded-lg transition-colors"
          title="Close projects and return to search"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-y-auto flex-grow p-4">
        {projectRoutes.length === 0 ? (
          <div className="text-center py-8">
            <BookmarkIcon className="w-16 h-16 text-rock-600 mx-auto mb-4" />
            <p className="text-rock-400 text-lg">No projects yet</p>
            <p className="text-rock-500 text-sm mt-2">
              Add routes to your project list from the map or route list
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-rock-300">
                {projectRoutes.length} route{projectRoutes.length !== 1 ? 's' : ''}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleShareOrExport}
                  className="btn-secondary text-xs flex items-center space-x-1"
                >
                  <ShareIcon className="w-4 h-4" />
                  <span>{canShare ? 'Share' : 'Export'}</span>
                </button>
                <button
                  onClick={clearAllProjects}
                  className="btn-secondary text-xs flex items-center space-x-1 hover:bg-red-600"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {projectRoutes
                .sort((a, b) => b.popularity - a.popularity)
                .map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    projects={projects}
                    onToggleProject={onToggleProject}
                    onShowOnMap={onShowOnMap}
                    onOpenMedia={openMediaModal}
                    variant="compact"
                  />
                ))}
            </div>
          </>
        )}
      </div>
      
      <MediaModal
        route={selectedRoute}
        isOpen={isMediaModalOpen}
        onClose={closeMediaModal}
      />
    </motion.div>
  )
} 