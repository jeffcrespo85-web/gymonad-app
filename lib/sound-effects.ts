export class SoundEffects {
  private static sounds: { [key: string]: HTMLAudioElement } = {}
  private static soundsLoaded = false

  static preloadSounds() {
    if (typeof window === "undefined" || this.soundsLoaded) return

    try {
      const soundFiles = [
        { key: "swordClash1", src: "" },
        { key: "swordClash2", src: "" },
        { key: "swordClash3", src: "" },
      ]

      soundFiles.forEach(({ key, src }) => {
        const audio = new Audio()
        audio.volume = 0.3
        audio.preload = "none"

        audio.addEventListener("error", (e) => {
          console.log(`[v0] Sound ${key} failed to load - gracefully handled`)
        })

        if (src) {
          audio.src = src
        }
        this.sounds[key] = audio
      })

      this.soundsLoaded = true
      console.log("[v0] Sound effects initialized without audio files")
    } catch (error) {
      console.log("[v0] Sound effects initialization failed - gracefully handled:", error)
    }
  }

  static playSwordClash(variant: 1 | 2 | 3 = 1) {
    if (typeof window === "undefined") return

    const soundKey = `swordClash${variant}`
    const sound = this.sounds[soundKey]

    if (sound && sound.src) {
      try {
        sound.currentTime = 0
        sound.play().catch((e) => {
          console.log(`[v0] Audio play failed for ${soundKey} - gracefully handled`)
        })
      } catch (error) {
        console.log(`[v0] Sound playback error for ${soundKey} - gracefully handled`)
      }
    } else {
      console.log(`[v0] Sound ${soundKey} not available - silent mode`)
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

if (typeof window !== "undefined") {
  setTimeout(() => {
    SoundEffects.preloadSounds()
  }, 1000)
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
