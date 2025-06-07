'use client'

import { StagewiseToolbar } from '@stagewise/toolbar-next'
import { useEffect, useState } from 'react'

const stagewiseConfig = {
  plugins: []
}

export default function StagewiseToolbarWrapper() {
  const [isDev, setIsDev] = useState(false)

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === 'development')
  }, [])

  if (!isDev) return null

  return <StagewiseToolbar config={stagewiseConfig} />
} 