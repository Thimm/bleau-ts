import React, { useState, useRef, useEffect } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaName } from './AreaName'
import type { Route } from '@/types'

interface SearchAutocompleteProps {
  routes: Route[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

interface SearchResult {
  route: Route
  matchIndex: number
  matchLength: number
}

export function SearchAutocomplete({ routes, value, onChange, placeholder = "Search routes..." }: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Generate search results from the `value` prop
  const searchResults: SearchResult[] = React.useMemo(() => {
    if (!value.trim()) return []
    
    const searchTerm = value.toLowerCase()
    const results: SearchResult[] = []
    
    for (const route of routes) {
      const nameLower = route.name.toLowerCase()
      const matchIndex = nameLower.indexOf(searchTerm)
      
      if (matchIndex !== -1) {
        results.push({
          route,
          matchIndex,
          matchLength: searchTerm.length
        })
      }
    }
    
    // Sort and limit results
    return results
      .sort((a, b) => {
        if (a.matchIndex === 0 && b.matchIndex !== 0) return -1
        if (b.matchIndex === 0 && a.matchIndex !== 0) return 1
        if (a.matchIndex !== b.matchIndex) return a.matchIndex - b.matchIndex
        return (b.route.popularity || 0) - (a.route.popularity || 0)
      })
      .slice(0, 10)
  }, [routes, value])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
            selectResult(searchResults[highlightedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          setHighlightedIndex(-1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, searchResults, highlightedIndex])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectResult = (result: SearchResult) => {
    onChange(result.route.name)
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue) // Directly call parent's onChange
    if (newValue.trim()) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
    setHighlightedIndex(-1)
  }

  const handleInputFocus = () => {
    if (value.trim() && searchResults.length > 0) {
      setIsOpen(true)
    }
  }

  const clearSearch = () => {
    onChange('')
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const highlightMatch = (text: string, matchIndex: number, matchLength: number) => {
    if (matchIndex === -1) return text
    
    const before = text.slice(0, matchIndex)
    const match = text.slice(matchIndex, matchIndex + matchLength)
    const after = text.slice(matchIndex + matchLength)
    
    return (
      <>
        {before}
        <span className="bg-primary-600 text-white px-0.5 rounded">{match}</span>
        {after}
      </>
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-rock-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="input-primary w-full pl-10 pr-10"
        />
        {value && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-rock-600 rounded"
          >
            <XMarkIcon className="w-4 h-4 text-rock-400" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && searchResults.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-rock-800 border border-rock-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            {searchResults.map((result, index) => (
              <button
                key={`${result.route.id}-${result.route.name}`}
                onClick={() => selectResult(result)}
                className={`w-full text-left px-3 py-2 hover:bg-rock-700 transition-colors ${
                  index === highlightedIndex ? 'bg-rock-700' : ''
                }`}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">
                      {highlightMatch(result.route.name, result.matchIndex, result.matchLength)}
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <AreaName areaName={result.route.area_name} />
                      <span className="text-rock-400">•</span>
                      <span className="text-rock-400">{result.route.grade}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      result.route.grade_numeric >= 20 ? 'bg-red-600' :
                      result.route.grade_numeric >= 16 ? 'bg-orange-600' :
                      result.route.grade_numeric >= 12 ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}>
                      {result.route.grade}
                    </span>
                    <span className="text-xs text-rock-400">
                      ★ {result.route.popularity}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 