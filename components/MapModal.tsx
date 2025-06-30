import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import type { Route } from '@/types'

// Dynamically import RouteMap to avoid SSR issues with Leaflet
const RouteMap = dynamic(() => import('@/components/RouteMap').then(mod => mod.RouteMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-rock-800 flex items-center justify-center"><p>Loading map...</p></div>,
})

interface MapModalProps {
  routes: Route[]
  areas: any,
  isOpen: boolean
  onClose: () => void
}

export function MapModal({ routes, areas, isOpen, onClose }: MapModalProps) {
  const title = routes.length === 1 ? routes[0].name : 'Route Map'
  const subtitle = routes.length === 1 ? `${routes[0].area_name} • ${routes[0].grade}` : `${routes.length} routes`

  return (
    <AnimatePresence>
      {isOpen && routes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-rock-800 rounded-lg max-w-4xl w-full h-[95vh] sm:h-[80vh] overflow-hidden flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 sm:p-4 border-b border-rock-700 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                    {title}
                  </h3>
                  <p className="text-rock-300 text-sm">
                    {subtitle}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-rock-700 rounded-lg transition-colors ml-2 flex-shrink-0"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="flex-grow">
              <RouteMap
                routes={routes}
                areas={areas}
                projects={new Set()}
                onToggleProject={() => {}}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 