'use client'

import React, { useState, useEffect } from 'react'

export default function DebugPage() {
  const [swStatus, setSwStatus] = useState<string>('Checking...')
  const [cacheInfo, setCacheInfo] = useState<any>(null)
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

  useEffect(() => {
    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
          const registration = registrations[0]
          setSwStatus(`Active: ${registration.active ? 'Yes' : 'No'}, Scope: ${registration.scope}`)
        } else {
          setSwStatus('No service worker registered')
        }
      }).catch(err => {
        setSwStatus(`Error: ${err.message}`)
      })
    } else {
      setSwStatus('Service Worker not supported')
    }

    // Check cache storage
    if ('caches' in window) {
      caches.keys().then(names => {
        const cachePromises = names.map(name => 
          caches.open(name).then(cache => 
            cache.keys().then(requests => ({ name, count: requests.length }))
          )
        )
        Promise.all(cachePromises).then(results => {
          setCacheInfo(results)
        })
      })
    }

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const testOffline = async () => {
    try {
      const response = await fetch('/routes.json')
      if (response.ok) {
        alert('✅ routes.json loaded successfully!')
      } else {
        alert('❌ Failed to load routes.json')
      }
    } catch (error) {
      alert(`❌ Error: ${error}`)
    }
  }

  const clearCaches = async () => {
    if ('caches' in window) {
      const names = await caches.keys()
      await Promise.all(names.map(name => caches.delete(name)))
      alert('Caches cleared!')
      window.location.reload()
    }
  }

  const installPWA = () => {
    // This will trigger the install prompt if available
    const event = new Event('beforeinstallprompt')
    window.dispatchEvent(event)
  }

  return (
    <div className="min-h-screen bg-rock-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">PWA Debug Dashboard</h1>
        
        <div className="space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-rock-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Service Worker</h3>
              <p className="text-sm text-rock-300">{swStatus}</p>
            </div>
            
            <div className="bg-rock-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Network Status</h3>
              <p className={`text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </p>
            </div>
          </div>

          {/* Cache Information */}
          <div className="bg-rock-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Cache Storage</h3>
            {cacheInfo ? (
              <div className="space-y-2">
                {cacheInfo.map((cache: any) => (
                  <div key={cache.name} className="flex justify-between text-sm">
                    <span className="text-rock-300">{cache.name}:</span>
                    <span className="text-rock-100">{cache.count} items</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-rock-400">Loading cache info...</p>
            )}
          </div>

          {/* Test Buttons */}
          <div className="bg-rock-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Testing Tools</h3>
            <div className="space-y-3">
              <button
                onClick={testOffline}
                className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
              >
                Test routes.json Loading
              </button>
              
              <button
                onClick={clearCaches}
                className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
              >
                Clear All Caches
              </button>
              
              <button
                onClick={installPWA}
                className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
              >
                Trigger PWA Install
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-rock-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Testing Instructions</h3>
            <div className="text-sm text-rock-300 space-y-2">
              <p>1. <strong>Service Worker:</strong> Should show "Active: Yes"</p>
              <p>2. <strong>Cache Storage:</strong> Should show multiple caches with items</p>
              <p>3. <strong>Offline Test:</strong> Turn off network, refresh page - should still work</p>
              <p>4. <strong>Install:</strong> Look for "Add to Home Screen" prompt</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 