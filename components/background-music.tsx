"use client"

import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleAudioError = (e: Event) => {
      console.log("[v0] Background music failed to load - gracefully handling")
      setAudioError(true)
      setAudioLoaded(false)
    }

    const handleAudioCanPlay = () => {
      console.log("[v0] Background music loaded successfully")
      setAudioError(false)
      setAudioLoaded(true)
    }

    const handleLoadStart = () => {
      console.log("[v0] Background music loading started")
    }

    audio.addEventListener("error", handleAudioError)
    audio.addEventListener("canplay", handleAudioCanPlay)
    audio.addEventListener("loadstart", handleLoadStart)

    // Set initial properties
    audio.loop = true
    audio.volume = 0.3
    audio.preload = "none"

    // Auto-play after user interaction - only if audio loaded successfully
    const handleFirstInteraction = () => {
      if (!isPlaying && !audioError && audioLoaded) {
        audio
          .play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch((e) => {
            console.log("[v0] Audio autoplay failed - this is normal on some browsers")
            // Don't set audioError here as autoplay failure is common and expected
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
      audio.removeEventListener("loadstart", handleLoadStart)
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }
  }, [isPlaying, audioError, audioLoaded])

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio || audioError || !audioLoaded) return

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
          console.log("[v0] Audio play failed:", e.message)
          // Don't set audioError for play failures
        })
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio || audioError || !audioLoaded) return

    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  if (audioError || !audioLoaded) {
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

      <audio ref={audioRef} preload="none" />
    </div>
  )
<audio controls src="/gymonadtheme.mp3">
  Your browser does not support the audio element.
</audio>

