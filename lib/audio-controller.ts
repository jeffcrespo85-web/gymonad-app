class AudioController {
  private loadingMusic: HTMLAudioElement | null = null
  private musicStarted = false

  startLoadingMusic() {
    if (!this.musicStarted && typeof window !== "undefined") {
      this.loadingMusic = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gymonadtheme-Fuh0xpQtOA63uufs61fIneHPY136tL.mp3")
      this.loadingMusic.loop = false // No longer loop since it's only for loading
      this.loadingMusic.volume = 0.2
      this.loadingMusic.play().catch(() => {})
      this.musicStarted = true

      setTimeout(() => {
        this.stopLoadingMusic()
      }, 10000)
    }
  }

  stopLoadingMusic() {
    if (this.loadingMusic) {
      this.loadingMusic.pause()
      this.loadingMusic.currentTime = 0
      this.loadingMusic = null
      this.musicStarted = false
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
}

export const audioController = new AudioController()
