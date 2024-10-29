import { useEffect, useState, type ReactNode } from 'react'

export const HydrationWrapper = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])
  
  return mounted ? children : null
}