import React, { useState } from 'react'
import { Bars3Icon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { prefetchAllTiles, checkTileCacheStatus } from '@/utils/tilePrefetch'

interface BurgerMenuProps {
  // No props needed since we're removing filter/project functionality
}

export function BurgerMenu({}: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<{ success: number; failed: number; total: number; current: number } | null>(null)
  const [cacheStatus, setCacheStatus] = useState<{ cached: number; total: number } | null>(null)

  const handleDownloadTiles = async () => {
    setIsDownloading(true)
    setDownloadProgress(null)
    
    try {
      const result = await prefetchAllTiles((progress) => {
        setDownloadProgress(progress)
      })
      
      // Update cache status after download
      const status = await checkTileCacheStatus()
      setCacheStatus(status)
    } catch (error) {
      console.error('Failed to download tiles:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const checkCacheStatus = async () => {
    try {
      const status = await checkTileCacheStatus()
      setCacheStatus(status)
    } catch (error) {
      console.error('Failed to check cache status:', error)
    }
  }

  React.useEffect(() => {
    // Check cache status on mount
    checkCacheStatus()
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleFeedbackClick = () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSeJZSi4w1ojJI8g8j9SI9REpncrr1zDasK88jaVymsI2QOyjQ/viewform?usp=dialog', '_blank')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Burger Button */}
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-rock-700 hover:bg-rock-600 text-rock-300 hover:text-white transition-colors"
        aria-label="Menu"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-50" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="absolute right-0 top-12 w-64 bg-rock-800 border border-rock-700 rounded-lg shadow-xl z-50">
            <div className="p-4 space-y-3">
              {/* Download Tiles Section */}
              <div className="border-b border-rock-700 pb-3">
                <h3 className="text-sm font-semibold text-white mb-2">Offline Maps</h3>
                
                {/* Cache Status */}
                {cacheStatus && (
                  <div className="text-xs text-rock-400 mb-2">
                    {cacheStatus.cached > 0 ? (
                      <span>📦 {cacheStatus.cached.toLocaleString()} tiles cached</span>
                    ) : (
                      <span>📦 No tiles cached</span>
                    )}
                  </div>
                )}
                
                {/* Download Button */}
                <button
                  onClick={handleDownloadTiles}
                  disabled={isDownloading}
                  className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isDownloading
                      ? 'bg-rock-600 text-rock-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>
                    {isDownloading ? 'Downloading...' : 'Download All Tiles'}
                  </span>
                </button>
                
                {/* Download Progress */}
                {downloadProgress && (
                  <div className="mt-2 space-y-2">
                    {/* Progress Bar */}
                    <div className="w-full bg-rock-700 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                      />
                    </div>
                    
                    {/* Progress Text */}
                    <div className="text-xs text-rock-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Progress: {downloadProgress.current.toLocaleString()} / {downloadProgress.total.toLocaleString()}</span>
                        <span>{Math.round((downloadProgress.current / downloadProgress.total) * 100)}%</span>
                      </div>
                      <div>✅ {downloadProgress.success.toLocaleString()} successful</div>
                      {downloadProgress.failed > 0 && (
                        <div>❌ {downloadProgress.failed.toLocaleString()} failed</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="space-y-2">
                <button
                  onClick={handleFeedbackClick}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors text-rock-300 hover:bg-rock-700 hover:text-white"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span>Send Feedback</span>
                </button>
                
                <Link
                  href="/thank-you"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors text-rock-300 hover:bg-rock-700 hover:text-white"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span>Thank You</span>
                </Link>
              </div>

              {/* Info Section */}
              <div className="border-t border-rock-700 pt-3">
                <div className="text-xs text-rock-500">
                  <p>Download tiles for offline use</p>
                  <p className="mt-1">This may take several minutes</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 