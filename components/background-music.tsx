"use client"

import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleAudioError = () => {
      console.log("[v0] Background music failed to load")
      setAudioError(true)
    }

    const handleAudioCanPlay = () => {
      console.log("[v0] Background music loaded successfully")
      setAudioError(false)
    }

    audio.addEventListener("error", handleAudioError)
    audio.addEventListener("canplay", handleAudioCanPlay)

    // Set initial properties
    audio.loop = true
    audio.volume = 0.3 // Keep it subtle in the background

    // Auto-play after user interaction
    const handleFirstInteraction = () => {
      if (!isPlaying && !audioError) {
        audio
          .play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch((e) => {
            console.log("[v0] Audio autoplay failed:", e)
            setAudioError(true)
          })
      }
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }

    document.addEventListener("click", handleFirstInteraction)
    document.addEventListener("keydown", handleFirstInteraction)

    return () => {
      audio.removeEventListener("error", handleAudioError)
      audio.removeEventListener("canplay", handleAudioCanPlay)
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }
  }, [isPlaying, audioError])

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio || audioError) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch((e) => {
          console.log("[v0] Audio play failed:", e)
          setAudioError(true)
        })
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio || audioError) return

    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  if (audioError) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-purple-600/30 shadow-lg">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <div className="text-xs text-purple-400 font-medium">Epic Battle</div>
        </div>
      </div>

      <audio ref={audioRef} src="/sounds/epic-ancient-battle-soundtrack.mp3" preload="none" />
    </div>
  )
}
