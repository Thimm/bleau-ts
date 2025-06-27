import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { SearchAutocomplete } from './SearchAutocomplete'
import type { Route, FilterState } from '@/types'
import { getAvailableGrades, gradeToNumeric, numericToGrade } from '@/utils/gradeUtils'

interface FilterPanelProps {
  routes: Route[]
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClose: () => void
}

export function FilterPanel({ routes, filters, onFiltersChange, onClose }: FilterPanelProps) {
  const availableGrades = getAvailableGrades()
  const availableSteepness = Array.from(new Set(routes.map(r => r.steepness))).sort()
  const availableAreas = Array.from(new Set(routes.map(r => r.area_name))).sort()
  
  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full sm:w-96 bg-rock-800 border-l border-rock-700 overflow-y-auto shrink-0"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-rock-700 rounded-lg"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-3">Search Routes</label>
            <SearchAutocomplete
              routes={routes}
              value={filters.search}
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
                  value={numericToGrade(filters.gradeRange[0])}
                  onChange={(e) => updateFilters({
                    gradeRange: [gradeToNumeric(e.target.value), filters.gradeRange[1]]
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
                  value={numericToGrade(filters.gradeRange[1])}
                  onChange={(e) => updateFilters({
                    gradeRange: [filters.gradeRange[0], gradeToNumeric(e.target.value)]
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
                    checked={filters.steepness.includes(steepness)}
                    onChange={(e) => {
                      const newSteepness = e.target.checked
                        ? [...filters.steepness, steepness]
                        : filters.steepness.filter(s => s !== steepness)
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
                    checked={filters.areas.includes(area)}
                    onChange={(e) => {
                      const newAreas = e.target.checked
                        ? [...filters.areas, area]
                        : filters.areas.filter(a => a !== area)
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
                    checked={filters.sitStart === option.value}
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
              Popularity Range: {filters.popularityRange[0]} - {filters.popularityRange[1]}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-rock-300 mb-1">Min</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.popularityRange[0]}
                  onChange={(e) => updateFilters({
                    popularityRange: [parseInt(e.target.value), filters.popularityRange[1]]
                  })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-rock-300 mb-1">Max</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.popularityRange[1]}
                  onChange={(e) => updateFilters({
                    popularityRange: [filters.popularityRange[0], parseInt(e.target.value)]
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
                checked={filters.showAreas}
                onChange={(e) => updateFilters({ showAreas: e.target.checked })}
                className="mr-2 rounded border-rock-600 bg-rock-700 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">Show Area Boundaries</span>
            </label>
          </div>

          {/* Clear All */}
          <div className="pt-4 border-t border-rock-700">
            <button
              onClick={() => updateFilters({
                gradeRange: [0, 34],
                steepness: [],
                areas: [],
                sitStart: 'all',
                popularityRange: [0, 100],
                showAreas: true,
                search: ''
              })}
              className="w-full btn-secondary"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 