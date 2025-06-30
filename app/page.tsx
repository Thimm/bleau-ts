'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { FilterPanel } from '@/components/FilterPanel'
import { RouteList } from '@/components/RouteList'
import { Header } from '@/components/Header'
import { ProjectList } from '@/components/ProjectList'
import { gradeToNumeric } from '@/utils/gradeUtils'
import type { Route, FilterState } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import { MapModal } from '@/components/MapModal'
import { loadJSON, saveJSON } from '@/utils/storage'

const defaultFilters: FilterState = {
  gradeRange: [8, 19],
  steepness: [],
  areas: [],
  sitStart: 'all',
  popularityRange: [0, 30000],
  search: ''
}

export default function Home() {
  const searchParams = useSearchParams()
  const [routes, setRoutes] = useState<Route[]>([])
  const [areas, setAreas] = useState<any>(null)
  const [filters, setFilters] = useState<FilterState>(() => loadJSON('filters', defaultFilters))
  
  const [debouncedFilters, setDebouncedFilters] = useState<FilterState>(filters)
  
  const [projects, setProjects] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [showProjects, setShowProjects] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [loading, setLoading] = useState(true)
  const [routesForMapModal, setRoutesForMapModal] = useState<Route[]>([])

  const isInitialMount = useRef(true)
  const mainRef = useRef<HTMLDivElement>(null)

  // Handle URL parameters for direct route links
  useEffect(() => {
    if (routes.length === 0) return // Wait for routes to load
    
    const routeId = searchParams.get('route')
    const projectsParam = searchParams.get('projects')
    
    if (routeId) {
      const targetRoute = routes.find(route => route.bleau_info_id === routeId)
      if (targetRoute) {
        // Redirect to dedicated route page
        window.location.href = `/route/${routeId}`
        return
      }
    }
    
    if (projectsParam) {
      // Handle sharing multiple projects
      const projectIds = projectsParam.split(',').filter(id => id.trim())
      if (projectIds.length > 0) {
        // Add these routes to projects
        const newProjects = new Set(projects)
        projectIds.forEach(id => newProjects.add(id))
        setProjects(newProjects)
        
        // Show the projects panel
        setShowProjects(true)
      }
    }
  }, [routes, searchParams, projects])

  // Save scroll position when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (mainRef.current) {
        saveJSON('scrollPosition', mainRef.current.scrollTop)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && mainRef.current) {
        saveJSON('scrollPosition', mainRef.current.scrollTop)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Restore scroll position when component mounts
  useEffect(() => {
    if (!loading && mainRef.current) {
      const savedPosition = loadJSON('scrollPosition', 0)
      if (savedPosition > 0) {
        // Use setTimeout to ensure the content is rendered
        setTimeout(() => {
          if (mainRef.current) {
            mainRef.current.scrollTop = savedPosition
          }
        }, 100)
      }
    }
  }, [loading])

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters)
    setShowFilters(false)
  }

  const handleToggleFilters = () => {
    if (showProjects) {
      setShowProjects(false)
    }
    if (showMobileSearch) {
      setShowMobileSearch(false)
    }
    setShowFilters(!showFilters)
  }

  const handleToggleProjects = () => {
    if (showFilters) {
      setShowFilters(false)
    }
    if (showMobileSearch) {
      setShowMobileSearch(false)
    }
    setShowProjects(!showProjects)
  }

  const handleToggleMobileSearch = () => {
    if (showFilters) {
      setShowFilters(false)
    }
    if (showProjects) {
      setShowProjects(false)
    }
    setShowMobileSearch(!showMobileSearch)
  }

  useEffect(() => {
    if (!isInitialMount.current) return // Don't debounce during initial load
    
    const handler = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 300) // 300ms delay

    // Clear the timeout if the user types again before the delay has passed.
    return () => {
      clearTimeout(handler)
    }
  }, [filters, isInitialMount])

  useEffect(() => {
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
      setLoading(false)
    }).catch(err => {
      console.error('Error loading data:', err)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    try {
      const savedProjects = window.localStorage.getItem('projects')
      if (savedProjects) {
        setProjects(new Set(JSON.parse(savedProjects)))
      }
    } catch (error) {
      console.error('Error reading projects from localStorage', error)
    }
  }, [])

  const { filteredRoutes, totalFiltered, isLimited } = useMemo(() => {
    const MAX_DISPLAY_ROUTES = 500
    const MAX_SEARCH_RESULTS = 2000
    const trimmedSearch = debouncedFilters.search.trim().toLowerCase()

    let allFiltered: Route[]

    if (trimmedSearch) {
      allFiltered = routes.filter(route => 
        route.name.toLowerCase().includes(trimmedSearch)
      )
    } else {
      allFiltered = routes.filter(route => {
        if (route.grade_numeric < debouncedFilters.gradeRange[0] || route.grade_numeric > debouncedFilters.gradeRange[1]) return false
        if (debouncedFilters.steepness.length > 0 && !debouncedFilters.steepness.includes(route.steepness)) return false
        if (debouncedFilters.areas.length > 0 && !debouncedFilters.areas.includes(route.area_name)) return false
        if (debouncedFilters.sitStart === 'sit' && route.sit_start !== 1) return false
        if (debouncedFilters.sitStart === 'standing' && route.sit_start !== 0) return false
        if ((route.popularity || 0) < debouncedFilters.popularityRange[0] || (route.popularity || 0) > debouncedFilters.popularityRange[1]) return false
        
        return true
      })
    }

    const totalFilteredCount = allFiltered.length
    const sortedFiltered = allFiltered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    const displayLimit = trimmedSearch ? MAX_SEARCH_RESULTS : MAX_DISPLAY_ROUTES
    let displayRoutes = sortedFiltered.slice(0, displayLimit)
    
    if (trimmedSearch) {
      const explicitlySearchedRoute = allFiltered.find(r => r.name.toLowerCase() === trimmedSearch)
      if (explicitlySearchedRoute && !displayRoutes.some(r => r.id === explicitlySearchedRoute.id)) {
        if (displayRoutes.length >= displayLimit) displayRoutes.pop()
        displayRoutes.unshift(explicitlySearchedRoute)
      }
    }
    
    return {
      filteredRoutes: displayRoutes,
      totalFiltered: totalFilteredCount,
      isLimited: totalFilteredCount > displayRoutes.length,
    }
  }, [routes, debouncedFilters])

  const toggleProject = (routeId: string) => {
    const newProjects = new Set(projects)
    if (newProjects.has(routeId)) {
      newProjects.delete(routeId)
    } else {
      newProjects.add(routeId)
    }
    setProjects(newProjects)
  }

  const handleShowOnMap = (route: Route | Route[]) => {
    const routesArray = Array.isArray(route) ? route : [route]
    setRoutesForMapModal(routesArray)
  }

  const projectRoutes = useMemo(() => {
    return routes.filter(route => projects.has(route.bleau_info_id))
  }, [routes, projects])

  useEffect(() => {
    saveJSON('filters', filters)
  }, [filters])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-xl">Loading routes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rock-900 flex flex-col">
      <Header 
        onToggleFilters={handleToggleFilters}
        onToggleProjects={handleToggleProjects}
        projectCount={projects.size}
        filteredCount={totalFiltered}
        displayedCount={filteredRoutes.length}
        isLimited={isLimited}
        routes={routes}
        searchValue={filters.search}
        onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
        showMobileSearch={showMobileSearch}
        onToggleMobileSearch={handleToggleMobileSearch}
        showFilters={showFilters}
        showProjects={showProjects}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          {showProjects && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40"
                onClick={() => setShowProjects(false)}
              />
              <ProjectList
                routes={projectRoutes}
                projects={projects}
                onToggleProject={toggleProject}
                onClose={() => setShowProjects(false)}
                onShowOnMap={handleShowOnMap}
              />
            </>
          )}
        </AnimatePresence>

        <main ref={mainRef} className="flex-1 flex flex-col overflow-y-auto">
          <div className="bg-rock-900 flex-grow">
            <RouteList
              routes={filteredRoutes}
              projects={projects}
              onToggleProject={toggleProject}
              onShowOnMap={handleShowOnMap}
            />
          </div>
          
          <footer className="bg-rock-800 border-t border-rock-700 px-4 py-2">
            <div className="text-center">
              <p className="text-xs text-rock-500">
                Route data from{' '}
                <a 
                  href="https://boolder.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-rock-400 hover:text-rock-300 transition-colors"
                >
                  Boolder.com
                </a>
                {' '}under{' '}
                <a 
                  href="https://creativecommons.org/licenses/by/4.0/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-rock-400 hover:text-rock-300 transition-colors"
                >
                  Creative Commons Attribution 4.0 International
                </a>
              </p>
            </div>
          </footer>
        </main>
        
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40"
                onClick={() => setShowFilters(false)}
              />
              <FilterPanel
                routes={routes}
                initialFilters={filters}
                onApplyFilters={handleApplyFilters}
                onClose={() => setShowFilters(false)}
              />
            </>
          )}
        </AnimatePresence>
      </div>
      <MapModal 
        routes={routesForMapModal}
        areas={areas}
        isOpen={routesForMapModal.length > 0}
        onClose={() => setRoutesForMapModal([])}
      />
    </div>
  )
} 