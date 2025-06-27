import React, { useState, useEffect } from 'react'
import { XMarkIcon, TrashIcon, ShareIcon, PlayIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import { MediaModal } from './MediaModal'
import type { Route } from '@/types'

interface ProjectListProps {
  routes: Route[]
  projects: Set<string>
  onToggleProject: (routeId: string) => void
  onClose: () => void
}

export function ProjectList({ routes, projects, onToggleProject, onClose }: ProjectListProps) {
  const [isClient, setIsClient] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const canShare = isClient && !!navigator.share

  const projectRoutes = routes.filter(route => projects.has(route.bleau_info_id))
  
  const clearAllProjects = () => {
    projectRoutes.forEach(route => onToggleProject(route.bleau_info_id))
  }
  
  const exportProjects = () => {
    const projectData = projectRoutes.map(route => ({
      name: route.name,
      grade: route.grade,
      area: route.area_name,
      steepness: route.steepness,
      popularity: route.popularity,
      url: `https://bleau.info/${route.area_name.toLowerCase()}/${route.bleau_info_id}.html`
    }))
    
    const csvContent = [
      'Name,Grade,Area,Steepness,Popularity,URL',
      ...projectData.map(route => 
        `"${route.name}","${route.grade}","${route.area}","${route.steepness}",${route.popularity},"${route.url}"`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fontainebleau-projects-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    if (navigator.share) {
      const shareData = {
        title: 'My Fontainebleau Projects',
        text: 'Check out my bouldering projects in Fontainebleau:\n\n' +
          projectRoutes
            .map(route => `- ${route.name} (${route.grade}) in ${route.area_name}`)
            .join('\n'),
        url: window.location.href
      }
      navigator.share(shareData)
        .then(() => console.log('Successfully shared'))
        .catch((error) => console.error('Error sharing:', error))
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

  const openMediaModal = (route: Route) => {
    setSelectedRoute(route)
    setIsMediaModalOpen(true)
  }

  const closeMediaModal = () => {
    setIsMediaModalOpen(false)
    setSelectedRoute(null)
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
          className="p-2 hover:bg-rock-700 rounded-lg"
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
                {canShare ? (
                  <button
                    onClick={handleShare}
                    className="btn-secondary text-xs flex items-center space-x-1"
                  >
                    <ShareIcon className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                ) : (
                  <button
                    onClick={exportProjects}
                    className="btn-secondary text-xs flex items-center space-x-1"
                  >
                    <ShareIcon className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                )}
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
                <div
                  key={route.id}
                  className="card p-3 hover:bg-rock-700 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {route.name}
                      </h3>
                      <p className="text-rock-300 text-xs truncate">
                        {route.area_name}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => onToggleProject(route.bleau_info_id)}
                      className="ml-2 p-1 text-yellow-500 hover:bg-yellow-500/10 rounded"
                      title="Remove from projects"
                    >
                      <XMarkIcon className="w-4 h-4" />
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

                  {route.bleau_info_id && (
                    <div className="space-y-2">
                      <button
                        onClick={() => openMediaModal(route)}
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
                      >
                        View Details ↗
                      </a>
                    </div>
                  )}
                </div>
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