import React from 'react'
import { AdjustmentsHorizontalIcon, BookmarkIcon, MapIcon } from '@heroicons/react/24/outline'
import { SearchAutocomplete } from './SearchAutocomplete'
import type { Route } from '@/types'

interface HeaderProps {
  onToggleFilters: () => void
  onToggleProjects: () => void
  projectCount: number
  filteredCount: number
  displayedCount?: number
  isLimited?: boolean
  routes: Route[]
  searchValue: string
  onSearchChange: (value: string) => void
}

export function Header({ 
  onToggleFilters, 
  onToggleProjects, 
  projectCount, 
  filteredCount, 
  displayedCount, 
  isLimited,
  routes,
  searchValue,
  onSearchChange
}: HeaderProps) {
  return (
    <header className="bg-rock-800 border-b border-rock-700 px-4 py-3 sticky top-0 z-[1000]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <img src="/boulder_logo.png" alt="Logo" className="w-8 h-8 rounded" />
            <h1 className="text-xl font-bold text-white">Fontainebleau</h1>
          </div>
        </div>
        
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <SearchAutocomplete
            routes={routes}
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search routes..."
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-sm text-rock-300 mr-4">
            {isLimited ? (
              <div className="text-center">
                <div>{displayedCount?.toLocaleString()} of {filteredCount.toLocaleString()}</div>
                <div className="text-xs text-yellow-400">Top routes shown</div>
              </div>
            ) : (
              <div>{filteredCount.toLocaleString()} routes</div>
            )}
          </div>
          
          <button
            onClick={onToggleFilters}
            className="btn-secondary flex items-center space-x-2"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          
          <button
            onClick={onToggleProjects}
            className="btn-secondary flex items-center space-x-2 relative"
          >
            <BookmarkIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Projects</span>
            {projectCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {projectCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
} 