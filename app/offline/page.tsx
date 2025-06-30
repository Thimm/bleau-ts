import React from 'react'

export const metadata = {
  title: 'Offline – Fontainebleau Route Finder',
  description: 'You are currently offline. Previously viewed data and maps are still available.'
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-rock-900 text-rock-100 px-4 text-center">
      <h1 className="text-3xl font-semibold mb-4">You&rsquo;re offline</h1>
      <p className="max-w-md text-rock-400">
        It looks like you don&rsquo;t have an internet connection right now. Don&rsquo;t worry –
        all the Fontainebleau routes you&rsquo;ve explored and the map tiles you&rsquo;ve
        viewed before are still available. Once you&rsquo;re back online the app will
        automatically refresh with the latest information.
      </p>
    </div>
  )
} 