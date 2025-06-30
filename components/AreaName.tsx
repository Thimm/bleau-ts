'use client'

import React, { useState, useEffect } from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { getParkingInfo, type ParkingInfo } from '@/utils/parkingUtils'

interface AreaNameProps {
  areaName: string
  className?: string
}

export function AreaName({ areaName, className = '' }: AreaNameProps) {
  const [parkingInfo, setParkingInfo] = useState<ParkingInfo | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchParkingInfo = async () => {
      setLoading(true)
      try {
        const info = await getParkingInfo(areaName)
        setParkingInfo(info)
      } catch (error) {
        console.error('Error fetching parking info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchParkingInfo()
  }, [areaName])

  const handleClick = (e: React.MouseEvent) => {
    if (!parkingInfo) {
      e.preventDefault()
      return
    }
    
    // Open Google Maps in a new tab
    window.open(parkingInfo.google_url, '_blank', 'noopener,noreferrer')
  }

  const hasParkingInfo = parkingInfo !== null && !loading

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className="text-rock-300 text-sm truncate">
        {areaName}
      </span>
      {hasParkingInfo && (
        <button
          onClick={handleClick}
          className="flex items-center justify-center p-1 text-primary-500 hover:text-primary-400 hover:bg-primary-500/10 rounded transition-colors"
          title={`Get directions to ${parkingInfo.parking_name} (${parkingInfo.distance_in_minutes} min ${parkingInfo.transport})`}
        >
          <MapPinIcon className="w-3 h-3" />
        </button>
      )}
    </div>
  )
} 