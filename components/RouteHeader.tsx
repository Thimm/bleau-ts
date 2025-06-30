import React from 'react'
import { MapPinIcon, ShareIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { AreaName } from './AreaName'
import { getGradeColor } from '@/utils/gradeUtils'
import type { Route } from '@/types'

interface RouteHeaderProps {
  route: Route
  projects: Set<string>
  onToggleProject: (routeId: string) => void
  onShare: () => void
  shareSuccess?: boolean
  variant?: 'page' | 'compact'
  className?: string
}

export function RouteHeader({ 
  route, 
  projects, 
  onToggleProject, 
  onShare, 
  shareSuccess = false,
  variant = 'page',
  className = ''
}: RouteHeaderProps) {
  const isProject = projects.has(route.bleau_info_id)



  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{route.name}</h1>
          <div className="flex items-center space-x-2 text-rock-300 text-sm">
            <AreaName areaName={route.area_name} />
            <span>•</span>
            <span 
              className={`px-2 py-1 rounded text-white font-semibold text-xs ${getGradeColor(route.grade)}`}
            >
              {route.grade}
            </span>
            <span>•</span>
            <span className="capitalize">{route.steepness}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${route.latitude},${route.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:text-green-400 transition-colors p-1"
            title="Get directions to this problem"
          >
            <MapPinIcon className="w-4 h-4" />
          </a>
          
          <button
            onClick={onShare}
            className={`p-1 rounded transition-colors ${
              shareSuccess 
                ? 'bg-green-600 text-white' 
                : 'text-rock-400 hover:text-white hover:bg-rock-600'
            }`}
            title="Share route"
          >
            <ShareIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onToggleProject(route.bleau_info_id)}
            className={`p-1 rounded transition-colors ${
              isProject
                ? 'text-yellow-500 hover:bg-yellow-500/10'
                : 'text-rock-400 hover:text-white hover:bg-rock-600'
            }`}
            title={isProject ? 'Remove from projects' : 'Add to projects'}
          >
            {isProject ? (
              <BookmarkSolidIcon className="w-4 h-4" />
            ) : (
              <BookmarkIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    )
  }

  // Page variant (default)
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-white mb-2">{route.name}</h1>
        <div className="flex items-center space-x-4 text-rock-300">
          <AreaName areaName={route.area_name} />
          <span>•</span>
          <span 
            className={`px-3 py-1 rounded text-white font-semibold ${getGradeColor(route.grade)}`}
          >
            {route.grade}
          </span>
          <span>•</span>
          <span className="capitalize">{route.steepness}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${route.latitude},${route.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-500 hover:text-green-400 transition-colors p-2"
          title="Get directions to this problem"
        >
          <MapPinIcon className="w-6 h-6" />
        </a>
        
        <button
          onClick={onShare}
          className={`p-2 rounded-lg transition-colors ${
            shareSuccess 
              ? 'bg-green-600 text-white' 
              : 'bg-rock-700 hover:bg-rock-600 text-rock-300 hover:text-white'
          }`}
          title="Share route"
        >
          <ShareIcon className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => onToggleProject(route.bleau_info_id)}
          className={`p-2 rounded-lg transition-colors ${
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
    </div>
  )
} 