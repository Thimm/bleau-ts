'use client'

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMap, CircleMarker } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Icon, LatLngBounds } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Route, AreasData } from '@/types'

// Fix for default markers in React Leaflet
const defaultIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const projectIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'hue-rotate-180' // Make it gold/orange
})

interface RouteMapProps {
  routes: Route[]
  areas: AreasData | null
  projects: Set<string>
  onToggleProject: (routeId: string) => void
  userLocation?: {lat: number, lng: number} | null
  onMapReady?: (map: any) => void
  onZoomToRoute?: (route: Route) => void
}

export interface RouteMapRef {
  zoomToUserLocation: () => void
  zoomToRoute: (route: Route) => void
}

function MapBounds({ routes }: { routes: Route[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (routes.length > 1) {
      const bounds = new LatLngBounds(
        routes.map(route => [route.latitude, route.longitude])
      )
      map.fitBounds(bounds, { padding: [20, 20] })
    } else if (routes.length === 1) {
      map.setView([routes[0].latitude, routes[0].longitude], 16)
    }
  }, [routes, map])
  
  return null
}

function MapReadyHandler({ onMapReady }: { onMapReady?: (map: any) => void }) {
  const map = useMap()
  
  useEffect(() => {
    if (onMapReady) {
      console.log('Map is ready, calling onMapReady')
      onMapReady(map)
    }
  }, [map, onMapReady])
  
  return null
}

export const RouteMap = forwardRef<RouteMapRef, RouteMapProps>(
  ({ routes, areas, projects, onToggleProject, userLocation, onMapReady, onZoomToRoute }, ref) => {
    const mapRef = useRef<any>(null)
    
    // Fontainebleau center coordinates
    const center: [number, number] = [48.404, 2.695]
    
    // Auto-zoom to user location when available
    useEffect(() => {
      if (userLocation && mapRef.current) {
        console.log('Auto-zooming to user location:', userLocation)
        mapRef.current.setView([userLocation.lat, userLocation.lng], 13)
      }
    }, [userLocation])
    
    const zoomToUserLocation = () => {
      if (!mapRef.current) return
      
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            mapRef.current.setView([latitude, longitude], 13)
          },
          (error) => {
            console.error('Error getting location:', error)
            alert('Unable to get your location. Please check your browser permissions.')
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        )
      } else {
        alert('Geolocation is not supported by your browser.')
      }
    }
    
    const zoomToRoute = (route: Route) => {
      console.log('zoomToRoute called with:', route.name, route.latitude, route.longitude)
      if (!mapRef.current) {
        console.log('Map ref is null in zoomToRoute')
        return
      }
      console.log('Setting map view to route location...')
      mapRef.current.setView([route.latitude, route.longitude], 16)
    }
    
    useImperativeHandle(ref, () => ({
      zoomToUserLocation,
      zoomToRoute
    }))
    
    const getGradeColor = (grade: string) => {
      const colors = {
        '2': '#22c55e', '2+': '#22c55e',
        '3': '#22c55e', '3+': '#22c55e',
        '4': '#84cc16', '4+': '#84cc16',
        '5': '#84cc16', '5+': '#84cc16',
        '6a': '#eab308', '6a+': '#eab308',
        '6b': '#f59e0b', '6b+': '#f59e0b',
        '6c': '#ef4444', '6c+': '#ef4444',
        '7a': '#dc2626', '7a+': '#dc2626',
        '7b': '#b91c1c', '7b+': '#b91c1c',
        '7c': '#991b1b', '7c+': '#991b1b',
        '8a': '#7c2d12', '8a+': '#7c2d12',
        '8b': '#7c2d12', '8b+': '#7c2d12',
      }
      return colors[grade as keyof typeof colors] || '#6b7280'
    }

    return (
      <div className="h-full w-full relative">
        <MapContainer
          center={center}
          zoom={11}
          className="h-full w-full"
          ref={mapRef}
        >
          <MapReadyHandler onMapReady={onMapReady} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapBounds routes={routes} />
          
          {/* Route markers with clustering */}
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
          >
            {routes.map((route) => {
              const isProject = projects.has(route.bleau_info_id)
              
              return (
                <CircleMarker
                  key={route.id}
                  center={[route.latitude, route.longitude]}
                  radius={8}
                  pathOptions={{
                    color: isProject ? '#f59e0b' : '#3b82f6',
                    weight: 2,
                    fillColor: isProject ? '#f59e0b' : '#3b82f6',
                    fillOpacity: 0.7
                  }}
                >
                  <Popup>
                    <div className="text-black min-w-[200px]">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{route.name}</h3>
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
                            style={{ backgroundColor: getGradeColor(route.grade) }}
                          >
                            {route.grade}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Area:</span>
                          <span className="font-medium">
                            <a 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault()
                                // Fetch parking info and open Google Maps
                                fetch(`/api/parking?area=${encodeURIComponent(route.area_name)}`)
                                  .then(res => res.json())
                                  .then(data => {
                                    if (data.google_url) {
                                      window.open(data.google_url, '_blank', 'noopener,noreferrer')
                                    }
                                  })
                                  .catch(err => console.error('Error fetching parking info:', err))
                              }}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline"
                              title="Get directions to parking"
                            >
                              <span>{route.area_name}</span>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                            </a>
                          </span>
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
                        <a
                          href={`https://bleau.info/${route.area_name.toLowerCase()}/${route.bleau_info_id}.html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        >
                          View on Bleau.info ↗
                        </a>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MarkerClusterGroup>
          
          {/* User location marker */}
          {userLocation && (
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={10}
              color="#3b82f6"
              fillColor="#3b82f6"
              fillOpacity={0.8}
            />
          )}
        </MapContainer>
      </div>
    )
  }
)

RouteMap.displayName = 'RouteMap' 