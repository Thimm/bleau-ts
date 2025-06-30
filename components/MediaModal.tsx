import React, { useState, useEffect } from 'react'
import { XMarkIcon, PlayIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { getMediaFromBleauPage, createVideoHTML, createImageHTML } from '@/utils/mediaUtils'
import { AreaName } from './AreaName'
import type { Route } from '@/types'

interface MediaModalProps {
  route: Route | null
  isOpen: boolean
  onClose: () => void
}

interface MediaInfo {
  video: { type: 'youtube' | 'mp4'; url: string } | null
  image: { url: string } | null
}

interface TopoInfo {
  topo_id: number
  coordinates: any[] | null
  image_url: string
}

export function MediaModal({ route, isOpen, onClose }: MediaModalProps) {
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null)
  const [topoInfo, setTopoInfo] = useState<TopoInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && route) {
      setLoading(true)
      setError(null)
      setMediaInfo(null)
      setTopoInfo(null)

      // Fetch topo information
      const fetchTopoInfo = fetch(`/api/topo?routeId=${route.id}`)
        .then(res => res.ok ? res.json() : null)
        .catch(err => {
          console.error('Error fetching topo info:', err)
          return null
        })

      // Fetch media information (only if bleau_info_id exists)
      const fetchMediaInfo = route.bleau_info_id 
        ? getMediaFromBleauPage(route.area_name, route.bleau_info_id)
            .catch(err => {
              console.error('Error fetching media:', err)
              return null
            })
        : Promise.resolve(null)

      Promise.all([fetchTopoInfo, fetchMediaInfo])
        .then(([topo, media]) => {
          setTopoInfo(topo)
          setMediaInfo(media)
          setLoading(false)
        })
        .catch((err) => {
          console.error('Error fetching data:', err)
          setError('Failed to load data')
          setLoading(false)
        })
    }
  }, [isOpen, route])

  const hasMedia = mediaInfo && (mediaInfo.video || mediaInfo.image)
  const hasTopo = topoInfo && topoInfo.image_url

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-rock-800 rounded-lg max-w-5xl w-full h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 sm:p-4 border-b border-rock-700 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                    {route?.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-sm">
                    <AreaName areaName={route?.area_name || ''} />
                    <span className="text-rock-300">•</span>
                    <span className="text-rock-300">{route?.grade}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-rock-700 rounded-lg transition-colors ml-2 flex-shrink-0"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="py-2 sm:py-4 overflow-y-auto flex-1">
              {loading && (
                <div className="text-center py-6 sm:py-8 px-2 sm:px-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-rock-300">Loading topo and media...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-6 sm:py-8 px-2 sm:px-4">
                  <p className="text-red-400 mb-2">Error loading data</p>
                  <p className="text-rock-400 text-sm">{error}</p>
                </div>
              )}

              {!loading && !error && !hasTopo && !hasMedia && (
                <div className="text-center py-6 sm:py-8 px-2 sm:px-4">
                  <div className="text-rock-600 mb-4">
                    <PhotoIcon className="w-16 h-16 mx-auto" />
                  </div>
                  <p className="text-rock-300">No topo or media available for this route</p>
                  <p className="text-rock-400 text-sm mt-2">
                    Check the route details page for more information
                  </p>
                </div>
              )}

              {!loading && !error && (hasTopo || hasMedia) && (
                <div className="space-y-4 px-2 sm:px-4">
                  {/* Topo Image - Always shown first */}
                  {hasTopo && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <PhotoIcon className="w-4 h-4 text-primary-500" />
                        <span className="text-white font-medium">Topo</span>
                        {topoInfo.coordinates && topoInfo.coordinates.length > 0 && (
                          <span className="text-xs text-rock-400 ml-2">
                            (with line)
                          </span>
                        )}
                      </div>
                      <div className="bg-rock-900 rounded-lg overflow-hidden relative">
                        <img
                          src={topoInfo.image_url}
                          alt={`Topo for ${route?.name}`}
                          className="w-full h-auto max-h-[60vh] sm:max-h-96 object-contain"
                          onError={(e) => {
                            console.error('Failed to load topo image:', topoInfo.image_url)
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        {topoInfo.coordinates && topoInfo.coordinates.length > 0 && (
                          <svg
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                          >
                            {/* Shadow/outline for better visibility */}
                            <polyline
                              points={topoInfo.coordinates.map(coord => 
                                `${coord.x * 100}, ${coord.y * 100}`
                              ).join(' ')}
                              fill="none"
                              stroke="#000000"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity="0.8"
                            />
                            {/* Main red line */}
                            <polyline
                              points={topoInfo.coordinates.map(coord => 
                                `${coord.x * 100}, ${coord.y * 100}`
                              ).join(' ')}
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="0.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Other Media */}
                  {mediaInfo?.video && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <PlayIcon className="w-4 h-4 text-primary-500" />
                        <span className="text-white font-medium">Video</span>
                      </div>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: createVideoHTML(mediaInfo.video)
                        }}
                        className="rounded-lg overflow-hidden max-w-full"
                      />
                    </div>
                  )}

                  {mediaInfo?.image && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <PhotoIcon className="w-4 h-4 text-primary-500" />
                        <span className="text-white font-medium">Image</span>
                      </div>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: createImageHTML(mediaInfo.image)
                        }}
                        className="rounded-lg overflow-hidden max-w-full"
                      />
                    </div>
                  )}
                </div>
              )}

              {route?.bleau_info_id && (
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-rock-700 px-2 sm:px-4">
                  <a
                    href={`https://bleau.info/${route.area_name.toLowerCase()}/${route.bleau_info_id}.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <span>View Full Details on Bleau.info</span>
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 