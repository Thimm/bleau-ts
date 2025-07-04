'use client'

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMap, CircleMarker } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Icon, LatLngBounds } from 'leaflet'
import { RouteCard } from './RouteCard'
import { getGradeColorHex } from '@/utils/gradeUtils'
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
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
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
                    <RouteCard
                      route={route}
                      projects={projects}
                      onToggleProject={onToggleProject}
                      onShowOnMap={() => {}} // No-op for map popups
                      variant="popup"
                      showActions={false}
                    />
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