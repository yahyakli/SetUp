"use client"

import { useState, useEffect } from 'react'

export function useViewMode(pageKey: string, defaultMode: 'grid' | 'list' = 'grid') {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultMode)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Load preference on initial mount only
  useEffect(() => {
    try {
      const savedView = localStorage.getItem(`${pageKey}ViewMode`)
      if (savedView === 'grid' || savedView === 'list') {
        setViewMode(savedView)
      }
      setIsLoaded(true)
    } catch (error) {
      console.error('Error accessing localStorage:', error)
      setIsLoaded(true)
    }
  }, [pageKey])
  
  // Save preference when changed, but only after initial load
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(`${pageKey}ViewMode`, viewMode)
      } catch (error) {
        console.error('Error writing to localStorage:', error)
      }
    }
  }, [viewMode, pageKey, isLoaded])
  
  return [viewMode, setViewMode] as const
} 