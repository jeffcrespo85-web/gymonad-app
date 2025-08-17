"use client"

import { useEffect, useState } from "react"

interface LoadingScreenProps {
  isLoading: boolean
  onLoadingComplete: () => void
}

export function LoadingScreen({ isLoading, onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (isLoading) {
      // Initialize audio
      const battleAudio = new Audio("/sounds/epic-battle-loading-theme.mp3")
      battleAudio.volume = 0.6
      battleAudio.loop = true
      setAudio(battleAudio)

      // Start playing audio
      battleAudio.play().catch(console.error)

      // Simulate loading progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              battleAudio.pause()
              battleAudio.currentTime = 0
              onLoadingComplete()
            }, 500)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 200)

      return () => {
        clearInterval(interval)
        battleAudio.pause()
        battleAudio.currentTime = 0
      }
    }
  }, [isLoading, onLoadingComplete])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <img
            src="/gymonad-warriors-loading.png"
            alt="Gymonad Warriors Loading"
            className="w-96 h-auto rounded-lg shadow-2xl border border-purple-500/30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
        </div>

        <div className="w-64 bg-gray-800 rounded-full h-3 mb-4 mx-auto">
          <div
            className="bg-gradient-to-r from-purple-600 to-yellow-500 h-3 rounded-full transition-all duration-300 shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-purple-300 text-lg font-cinzel">
          Preparing your warrior training... {Math.round(progress)}%
        </p>
      </div>
    </div>
  )
}
