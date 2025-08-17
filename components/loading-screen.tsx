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
      try {
        const battleAudio = new Audio()
        battleAudio.volume = 0.6
        battleAudio.loop = true
        battleAudio.preload = "none"

        battleAudio.addEventListener("error", () => {
          console.log("[v0] Loading screen audio failed to load - continuing without audio")
        })

        battleAudio.addEventListener("canplay", () => {
          battleAudio.play().catch((e) => {
            console.log("[v0] Loading screen audio autoplay failed - this is normal")
          })
        })

        setAudio(battleAudio)
      } catch (error) {
        console.log("[v0] Loading screen audio initialization failed - continuing without audio")
      }

      // Simulate loading progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              if (audio) {
                try {
                  audio.pause()
                  audio.currentTime = 0
                } catch (e) {
                  console.log("[v0] Audio cleanup failed - gracefully handled")
                }
              }
              onLoadingComplete()
            }, 500)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 200)

      return () => {
        clearInterval(interval)
        if (audio) {
          try {
            audio.pause()
            audio.currentTime = 0
          } catch (e) {
            console.log("[v0] Audio cleanup in useEffect cleanup failed - gracefully handled")
          }
        }
      }
    }
  }, [isLoading, onLoadingComplete, audio])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <img
            src="/gymonad-warriors-loading.png"
            alt="Gymonad Warriors Loading"
            className="w-96 h-auto rounded-lg shadow-2xl border border-purple-500/30"
            onError={(e) => {
              console.log("[v0] Loading image failed to load - using fallback")
              e.currentTarget.style.display = "none"
            }}
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
