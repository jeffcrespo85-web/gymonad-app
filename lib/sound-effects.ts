export class SoundEffects {
  private static sounds: { [key: string]: HTMLAudioElement } = {}
  private static soundsLoaded = false

  static preloadSounds() {
    if (typeof window === "undefined" || this.soundsLoaded) return

    try {
      const soundFiles = [
        { key: "swordClash1", src: "/sounds/sword-clash-1.mp3" },
        { key: "swordClash2", src: "/sounds/sword-clash-2.mp3" },
        { key: "swordClash3", src: "/sounds/sword-clash-3.mp3" },
      ]

      soundFiles.forEach(({ key, src }) => {
        const audio = new Audio()
        audio.volume = 0.3
        audio.preload = "none" // Don't preload to avoid errors

        audio.addEventListener("error", () => {
          console.log(`[v0] Sound ${key} failed to load`)
        })

        // audio.src = src
        this.sounds[key] = audio
      })

      this.soundsLoaded = true
      console.log("[v0] Sound effects initialized")
    } catch (error) {
      console.log("[v0] Sound effects initialization failed:", error)
    }
  }

  static playSwordClash(variant: 1 | 2 | 3 = 1) {
    if (typeof window === "undefined") return

    const soundKey = `swordClash${variant}`
    const sound = this.sounds[soundKey]

    if (sound) {
      try {
        sound.currentTime = 0
        sound.play().catch((e) => {
          console.log(`[v0] Audio play failed for ${soundKey}:`, e)
        })
      } catch (error) {
        console.log(`[v0] Sound playback error for ${soundKey}:`, error)
      }
    }
  }

  static playWalletConnect() {
    this.playSwordClash(1)
  }

  static playWorkoutRecord() {
    this.playSwordClash(2)
  }

  static playRewardsClaim() {
    this.playSwordClash(3)
  }
}

// Initialize sounds when module loads
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    SoundEffects.preloadSounds()
  })
}

export function playSound(soundType: string) {
  switch (soundType) {
    case "sword1":
      SoundEffects.playSwordClash(1)
      break
    case "sword2":
      SoundEffects.playSwordClash(2)
      break
    case "sword3":
      SoundEffects.playSwordClash(3)
      break
    case "wallet":
      SoundEffects.playWalletConnect()
      break
    case "workout":
      SoundEffects.playWorkoutRecord()
      break
    case "rewards":
      SoundEffects.playRewardsClaim()
      break
    default:
      SoundEffects.playSwordClash(1)
  }
}
