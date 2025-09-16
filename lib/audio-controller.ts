class AudioController {
  private backgroundMusic: HTMLAudioElement | null = null
  private musicStarted = false
  private isMuted = false
  private musicTimer: NodeJS.Timeout | null = null

  startBackgroundMusic() {
    if (!this.musicStarted && typeof window !== "undefined") {
      this.backgroundMusic = new Audio("/gymonad-assetshttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/gymonadtheme-Fuh0xpQtOA63uufs61fIneHPY136tL.mp3")
      this.backgroundMusic.loop = false
      this.backgroundMusic.volume = this.isMuted ? 0 : 0.1 // Very low volume
      this.backgroundMusic.play().catch(() => {})
      this.musicStarted = true

      this.musicTimer = setTimeout(() => {
        this.stopBackgroundMusic()
      }, 40000) // 40 seconds
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
    if (typeof window !== "undefined") {
      const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/guitarmp3-5NQgvR22O7TRWetiCDZvCln2LFfg6h.mp3")
      audio.volume = 0.3
      audio.play().catch(() => {})

      if (callback) {
        setTimeout(callback, 2000) // Wait for guitar to finish
      }
    } else if (callback) {
      callback()
    }
  }

  playSwordClash() {
    if (typeof window !== "undefined") {
      const audio = new Audio("/gymonad-assetshttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/swordsclashing1sec-Gu3scJA0wJCm9za9kdnHLXcJdMvdkp.mp3")
      audio.volume = 0.2
      audio.play().catch(() => {})

      // Stop after 1 second
      setTimeout(() => {
        audio.pause()
        audio.currentTime = 0
      }, 1000)
    }
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
