'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { FilterPanel } from '@/components/FilterPanel'
import { RouteList } from '@/components/RouteList'
import { Header } from '@/components/Header'
import { ProjectList } from '@/components/ProjectList'
import { gradeToNumeric } from '@/utils/gradeUtils'
import type { Route, FilterState } from '@/types'
import type { RouteMapRef } from '@/components/RouteMap'
import { AnimatePresence, motion } from 'framer-motion'
import { MapModal } from '@/components/MapModal'

// Dynamic import for Leaflet map
const RouteMap = dynamic(() => import('@/components/RouteMap').then(mod => ({ default: mod.RouteMap })), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-rock-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-2 text-rock-300">Loading map...</p>
      </div>
    </div>
  )
})

export default function Home() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [areas, setAreas] = useState<any>(null)
  const [filters, setFilters] = useState<FilterState>({
    gradeRange: [8, 19],
    steepness: [],
    areas: [],
    sitStart: 'all',
    popularityRange: [0, 30000],
    showAreas: true,
    search: ''
  })
  
  // A debounced version of the filters that only updates after the user stops typing.
  const [debouncedFilters, setDebouncedFilters] = useState<FilterState>(filters)
  
  const [projects, setProjects] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [showProjects, setShowProjects] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [routeForMapModal, setRouteForMapModal] = useState<Route | null>(null)
  
  const mapRef = useRef<RouteMapRef>(null)

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters)
    setShowFilters(false)
  }

  // This effect debounces the filter state.
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 300) // 300ms delay

    // Clear the timeout if the user types again before the delay has passed.
    return () => {
      clearTimeout(handler)
    }
  }, [filters])

  // Load data and request location
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

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          if (mapInstance) {
            mapInstance.setView([latitude, longitude], 13)
          }
        },
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      )
    }
  }, [mapInstance])

  // The expensive filtering logic now depends on the debounced filters.
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

  const handleShowOnMap = (route: Route) => {
    setRouteForMapModal(route)
  }

  const projectRoutes = useMemo(() => {
    return routes.filter(route => projects.has(route.bleau_info_id))
  }, [routes, projects])

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
        onToggleFilters={() => setShowFilters(!showFilters)}
        onToggleProjects={() => setShowProjects(!showProjects)}
        projectCount={projects.size}
        filteredCount={totalFiltered}
        displayedCount={filteredRoutes.length}
        isLimited={isLimited}
        routes={routes}
        searchValue={filters.search} // The input is controlled by the "live" filters
        onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
        showMobileSearch={showMobileSearch}
        onToggleMobileSearch={() => setShowMobileSearch(!showMobileSearch)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Project List (Left Panel) */}
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
              />
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* The map is now only rendered when the user opens the Project list. */}
          {showProjects && (
              <div className="h-[60vh] w-full shrink-0">
                  <RouteMap 
                      ref={mapRef}
                      routes={projectRoutes}
                      areas={areas}
                      showAreas={filters.showAreas}
                      projects={projects}
                      onToggleProject={toggleProject}
                      userLocation={userLocation}
                      onMapReady={setMapInstance}
                  />
              </div>
          )}
          
          <div className="bg-rock-900 flex-grow">
            <RouteList
              routes={filteredRoutes} // The list is controlled by the debounced, filtered routes
              projects={projects}
              onToggleProject={toggleProject}
              onShowOnMap={handleShowOnMap}
            />
          </div>
        </main>
        
        {/* Filter Panel (Right Panel) */}
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
        route={routeForMapModal}
        areas={areas}
        isOpen={!!routeForMapModal}
        onClose={() => setRouteForMapModal(null)}
      />
    </div>
  )
} 