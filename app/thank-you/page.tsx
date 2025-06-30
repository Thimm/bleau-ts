'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, HeartIcon } from '@heroicons/react/24/outline'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-rock-900 flex flex-col">
      {/* Header */}
      <header className="bg-rock-800 border-b border-rock-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/boulder_logo.png" alt="Logo" className="w-8 h-8 rounded" />
            <h1 className="text-xl font-bold text-white">Fontainebleau</h1>
          </div>
          <Link 
            href="/"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-rock-700 hover:bg-rock-600 text-rock-300 hover:text-white transition-colors text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to App</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Thank You Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Thank You!</h1>
            <p className="text-xl text-rock-300 mb-8">
              This app wouldn't be possible without the amazing work of the climbing community.
            </p>
          </div>

          {/* Credits */}
          <div className="space-y-8">
            {/* Boolder.com */}
            <div className="bg-rock-800 border border-rock-700 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-3">Route Data</h2>
              <p className="text-rock-300 mb-4">
                All route information comes from the incredible work of{' '}
                <a 
                  href="https://boolder.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 transition-colors font-semibold"
                >
                  Boolder.com
                </a>
              </p>
              <p className="text-sm text-rock-500">
                Route data is provided under{' '}
                <a 
                  href="https://creativecommons.org/licenses/by/4.0/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-rock-400 hover:text-rock-300 transition-colors"
                >
                  Creative Commons Attribution 4.0 International License
                </a>
              </p>
            </div>

            {/* Bleau.info */}
            <div className="bg-rock-800 border border-rock-700 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-3">Media & Route Information</h2>
              <p className="text-rock-300 mb-4">
                Media and route information are sourced from{' '}
                <a 
                  href="https://bleau.info" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 transition-colors font-semibold"
                >
                  Bleau.info
                </a>
              </p>
              <p className="text-sm text-rock-500">
                Photos and detailed route descriptions from the Fontainebleau climbing community
              </p>
            </div>

            {/* OpenStreetMap */}
            <div className="bg-rock-800 border border-rock-700 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-3">Maps</h2>
              <p className="text-rock-300 mb-4">
                Map tiles are provided by{' '}
                <a 
                  href="https://www.openstreetmap.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 transition-colors font-semibold"
                >
                  OpenStreetMap
                </a>
              </p>
              <p className="text-sm text-rock-500">
                © OpenStreetMap contributors - Open Data Commons Open Database License
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12">
            <Link 
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-semibold"
            >
              <span>Start Exploring Routes</span>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-rock-700">
            <p className="text-sm text-rock-500">
              Fontainebleau Route Finder - Made with ❤️ for the climbing community
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 