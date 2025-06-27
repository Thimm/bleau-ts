import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { SearchAutocomplete } from './SearchAutocomplete'
import type { Route, FilterState } from '@/types'
import { getAvailableGrades, gradeToNumeric, numericToGrade } from '@/utils/gradeUtils'

interface FilterPanelProps {
  routes: Route[]
  initialFilters: FilterState
  onApplyFilters: (filters: FilterState) => void
  onClose: () => void
}

export function FilterPanel({ routes, initialFilters, onApplyFilters, onClose }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = React.useState<FilterState>(initialFilters)

  const availableGrades = getAvailableGrades()
  const availableSteepness = Array.from(new Set(routes.map(r => r.steepness))).sort()
  const availableAreas = Array.from(new Set(routes.map(r => r.area_name))).sort()
  const maxPopularity = React.useMemo(() => 
    Math.max(...routes.map(r => r.popularity || 0)), 
  [routes])
  
  const updateFilters = (updates: Partial<FilterState>) => {
    setLocalFilters({ ...localFilters, ...updates })
  }

  const handleApply = () => {
    onApplyFilters(localFilters)
  }

  const handleReset = () => {
    const defaultFilters: FilterState = {
      gradeRange: [0, 34],
      steepness: [],
      areas: [],
      sitStart: 'all',
      popularityRange: [0, maxPopularity],
      showAreas: true,
      search: ''
    }
    setLocalFilters(defaultFilters)
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full sm:w-96 bg-rock-800 border-l border-rock-700 z-50 flex flex-col"
    >
      <div className="p-4 flex items-center justify-between mb-6 shrink-0 border-b border-rock-700">
        <h2 className="text-xl font-bold">Filters</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-rock-700 rounded-lg"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-y-auto flex-grow p-4">
        <div className="space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-3">Search Routes</label>
            <SearchAutocomplete
              routes={routes}
              value={localFilters.search}
              onChange={(value) => updateFilters({ search: value })}
              placeholder="Type route name..."
            />
          </div>

          {/* Grade Range */}
          <div>
            <label className="block text-sm font-medium mb-3">Grade Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-rock-300 mb-1">Min Grade</label>
                <select
                  value={numericToGrade(localFilters.gradeRange[0])}
                  onChange={(e) => updateFilters({
                    gradeRange: [gradeToNumeric(e.target.value), localFilters.gradeRange[1]]
                  })}
                  className="input-primary w-full"
                >
                  {availableGrades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-rock-300 mb-1">Max Grade</label>
                <select
                  value={numericToGrade(localFilters.gradeRange[1])}
                  onChange={(e) => updateFilters({
                    gradeRange: [localFilters.gradeRange[0], gradeToNumeric(e.target.value)]
                  })}
                  className="input-primary w-full"
                >
                  {availableGrades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Steepness */}
          <div>
            <label className="block text-sm font-medium mb-3">Steepness</label>
            <div className="space-y-2">
              {availableSteepness.map(steepness => (
                <label key={steepness} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.steepness.includes(steepness)}
                    onChange={(e) => {
                      const newSteepness = e.target.checked
                        ? [...localFilters.steepness, steepness]
                        : localFilters.steepness.filter(s => s !== steepness)
                      updateFilters({ steepness: newSteepness })
                    }}
                    className="mr-2 rounded border-rock-600 bg-rock-700 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm capitalize">{steepness}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Areas */}
          <div>
            <label className="block text-sm font-medium mb-3">Areas</label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {availableAreas.map(area => (
                <label key={area} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.areas.includes(area)}
                    onChange={(e) => {
                      const newAreas = e.target.checked
                        ? [...localFilters.areas, area]
                        : localFilters.areas.filter(a => a !== area)
                      updateFilters({ areas: newAreas })
                    }}
                    className="mr-2 rounded border-rock-600 bg-rock-700 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sit Start */}
          <div>
            <label className="block text-sm font-medium mb-3">Start Type</label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'sit', label: 'Sit Start Only' },
                { value: 'standing', label: 'Standing Start Only' }
              ].map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="sitStart"
                    value={option.value}
                    checked={localFilters.sitStart === option.value}
                    onChange={(e) => updateFilters({ sitStart: e.target.value as any })}
                    className="mr-2 border-rock-600 bg-rock-700 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Popularity Range */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Popularity Range: {localFilters.popularityRange[0]} - {localFilters.popularityRange[1]}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-rock-300 mb-1">Min</label>
                <input
                  type="range"
                  min="0"
                  max={maxPopularity}
                  value={localFilters.popularityRange[0]}
                  onChange={(e) => updateFilters({
                    popularityRange: [parseInt(e.target.value), localFilters.popularityRange[1]]
                  })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-rock-300 mb-1">Max</label>
                <input
                  type="range"
                  min="0"
                  max={maxPopularity}
                  value={localFilters.popularityRange[1]}
                  onChange={(e) => updateFilters({
                    popularityRange: [localFilters.popularityRange[0], parseInt(e.target.value)]
                  })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Map Options */}
          <div>
            <label className="block text-sm font-medium mb-3">Map Options</label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.showAreas}
                onChange={(e) => updateFilters({ showAreas: e.target.checked })}
                className="mr-2 rounded border-rock-600 bg-rock-700 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">Show Area Boundaries</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="p-4 shrink-0 border-t border-rock-700">
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            className="w-full btn-secondary"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="w-full btn-primary"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </motion.div>
  )
} 