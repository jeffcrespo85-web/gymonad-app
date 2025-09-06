class AudioController {
  private backgroundMusic: HTMLAudioElement | null = null
  private musicStarted = false
  private isMuted = false
  private musicTimer: NodeJS.Timeout | null = null

  startBackgroundMusic() {
    if (!this.musicStarted && typeof window !== "undefined") {
      this.backgroundMusic = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gymonadtheme-Fuh0xpQtOA63uufs61fIneHPY136tL.mp3")
      this.backgroundMusic.loop = false
      this.backgroundMusic.volume = this.isMuted ? 0 : 0.1 // Very low volume
      this.backgroundMusic.play().catch(() => {})
      this.musicStarted = true

      this.musicTimer = setTimeout(() => {
        this.stopBackgroundMusic()
      }, 30000) // 30 seconds
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause()
      this.backgroundMusic.currentTime = 0
      this.backgroundMusic = null
      this.musicStarted = false
    }
    if (this.musicTimer) {
      clearTimeout(this.musicTimer)
      this.musicTimer = null
    }
  }

  playAchievementSound(callback?: () => void) {
    const audio = new Audio("/gymonad-assetshttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/guitarmp3-5NQgvR22O7TRWetiCDZvCln2LFfg6h.mp3")
    audio.volume = 0.6
    audio.addEventListener("ended", () => {
      if (callback) callback()
    })
    audio.play().catch(() => {
      if (callback) callback()
    })
  }

  toggleMute() {
    this.isMuted = !this.isMuted
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.isMuted ? 0 : 0.1
    }
    return this.isMuted
  }

  getMuteState() {
    return this.isMuted
  }
}

export const audioController = new AudioController()
