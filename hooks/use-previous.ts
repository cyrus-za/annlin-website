'use client'

import { useRef, useEffect } from 'react'

/**
 * Custom hook that returns the previous value of a variable
 * Useful for comparing current vs previous state
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  
  useEffect(() => {
    ref.current = value
  }, [value])
  
  return ref.current
}
