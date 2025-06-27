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
  route: Route | null
  areas: any,
  isOpen: boolean
  onClose: () => void
}

export function MapModal({ route, areas, isOpen, onClose }: MapModalProps) {
  return (
    <AnimatePresence>
      {isOpen && route && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-rock-800 rounded-lg max-w-4xl w-full h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-rock-700 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {route?.name}
                  </h3>
                  <p className="text-rock-300 text-sm">
                    {route?.area_name} • {route?.grade}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-rock-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="flex-grow">
              <RouteMap
                routes={[route]}
                areas={areas}
                showAreas={true}
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