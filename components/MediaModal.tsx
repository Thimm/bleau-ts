import React, { useState, useEffect } from 'react'
import { XMarkIcon, PlayIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { getMediaFromBleauPage, createVideoHTML, createImageHTML } from '@/utils/mediaUtils'
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

export function MediaModal({ route, isOpen, onClose }: MediaModalProps) {
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && route && route.bleau_info_id) {
      setLoading(true)
      setError(null)
      setMediaInfo(null)

      getMediaFromBleauPage(route.area_name, route.bleau_info_id)
        .then((info) => {
          setMediaInfo(info)
          setLoading(false)
        })
        .catch((err) => {
          console.error('Error fetching media:', err)
          setError('Failed to load media')
          setLoading(false)
        })
    }
  }, [isOpen, route])

  const hasMedia = mediaInfo && (mediaInfo.video || mediaInfo.image)

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-rock-800 rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col"
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

            <div className="py-4 overflow-y-auto">
              {loading && (
                <div className="text-center py-8 px-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-rock-300">Loading media...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-8 px-4">
                  <p className="text-red-400 mb-2">Error loading media</p>
                  <p className="text-rock-400 text-sm">{error}</p>
                </div>
              )}

              {!loading && !error && !hasMedia && (
                <div className="text-center py-8 px-4">
                  <div className="text-rock-600 mb-4">
                    <PhotoIcon className="w-16 h-16 mx-auto" />
                  </div>
                  <p className="text-rock-300">No media available for this route</p>
                  <p className="text-rock-400 text-sm mt-2">
                    Check the route details page for more information
                  </p>
                </div>
              )}

              {!loading && !error && hasMedia && (
                <div className="space-y-4">
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
                      />
                    </div>
                  )}
                </div>
              )}

              {route?.bleau_info_id && (
                <div className="mt-6 pt-4 border-t border-rock-700 px-4">
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