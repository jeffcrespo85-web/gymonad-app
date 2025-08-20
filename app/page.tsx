"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Footprints, Calendar, ExternalLink, MapPin, Loader2, Wallet, Download } from "lucide-react"
import Image from "next/image"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getCurrentLocation, calculateDistance, type Location, type Gym } from "@/lib/location"
import { walletAdapters, type WalletAdapter } from "@/lib/wallet"

export default function FitnessApp() {
  const [steps, setSteps] = useState(0)
  const [dailyGoal] = useState(10000)
  const [checkedIn, setCheckedIn] = useState(false)
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null)
  const [isLightning, setIsLightning] = useState(false)
  const [musicStarted, setMusicStarted] = useState(false)
  const [achievedMilestones, setAchievedMilestones] = useState<Set<string>>(new Set())

  const [nearbyGyms, setNearbyGyms] = useState<Gym[]>([])
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)

  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [walletConnecting, setWalletConnecting] = useState(false)

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  const playSwordClash = () => {
    const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/swordsclashingmp3-ZkXZPLOZb8nG04XUrskCSFL4CSeqG7.mp3")
    audio.volume = 0.5
    audio.play().catch(() => {}) // Ignore errors if audio fails
  }

  const playGuitarMilestone = () => {
    const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/guitarmp3-5NQgvR22O7TRWetiCDZvCln2LFfg6h.mp3")
    audio.volume = 0.6
    audio.play().catch(() => {}) // Ignore errors if audio fails
  }

  const connectWallet = async (adapter: WalletAdapter) => {
    setWalletConnecting(true)
    playSwordClash()

    try {
      const address = await adapter.connect()
      setConnectedWallet(adapter.name)
      setWalletAddress(address)
      setShowWalletOptions(false)
      localStorage.setItem("connectedWallet", adapter.name)
      localStorage.setItem("walletAddress", address)
      playGuitarMilestone() // Play milestone sound for successful connection
    } catch (error) {
      console.error("Wallet connection failed:", error)
      setLocationError(`Failed to connect ${adapter.name}: ${error.message}`)
    } finally {
      setWalletConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    playSwordClash()
    const adapter = walletAdapters.find((w) => w.name === connectedWallet)
    if (adapter) {
      await adapter.disconnect()
    }
    setConnectedWallet(null)
    setWalletAddress(null)
    localStorage.removeItem("connectedWallet")
    localStorage.removeItem("walletAddress")
  }

  const checkStepMilestones = (newSteps: number, oldSteps: number) => {
    const milestones = [1000, 2500, 5000, 7500, 10000, 12500, 15000, 20000]
    const percentageMilestones = [25, 50, 75, 100]

    milestones.forEach((milestone) => {
      if (newSteps >= milestone && oldSteps < milestone) {
        const milestoneKey = `steps_${milestone}`
        if (!achievedMilestones.has(milestoneKey)) {
          playGuitarMilestone()
          setAchievedMilestones((prev) => new Set([...prev, milestoneKey]))
        }
      }
    })

    percentageMilestones.forEach((percentage) => {
      const targetSteps = (dailyGoal * percentage) / 100
      if (newSteps >= targetSteps && oldSteps < targetSteps) {
        const milestoneKey = `percentage_${percentage}`
        if (!achievedMilestones.has(milestoneKey)) {
          playGuitarMilestone()
          setAchievedMilestones((prev) => new Set([...prev, milestoneKey]))
        }
      }
    })
  }

  useEffect(() => {
    const savedSteps = localStorage.getItem("steps")
    const savedCheckedIn = localStorage.getItem("checkedIn")
    const savedLastCheckIn = localStorage.getItem("lastCheckIn")
    const savedMilestones = localStorage.getItem("achievedMilestones")
    const savedWallet = localStorage.getItem("connectedWallet")
    const savedAddress = localStorage.getItem("walletAddress")
    const today = new Date().toDateString()

    if (savedSteps) setSteps(Number.parseInt(savedSteps))
    if (savedMilestones) {
      setAchievedMilestones(new Set(JSON.parse(savedMilestones)))
    }
    if (savedWallet && savedAddress) {
      setConnectedWallet(savedWallet)
      setWalletAddress(savedAddress)
    }
    if (savedLastCheckIn) {
      setLastCheckIn(savedLastCheckIn)
      if (savedLastCheckIn !== today) {
        setCheckedIn(false)
        localStorage.setItem("checkedIn", "false")
        setAchievedMilestones(new Set())
        localStorage.removeItem("achievedMilestones")
      } else {
        setCheckedIn(savedCheckedIn === "true")
      }
    }
  }, [])

  useEffect(() => {
    let backgroundMusic: HTMLAudioElement | null = null

    const startBackgroundMusic = () => {
      if (!musicStarted) {
        backgroundMusic = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gymonadtheme-Fuh0xpQtOA63uufs61fIneHPY136tL.mp3")
        backgroundMusic.loop = true
        backgroundMusic.volume = 0.4
        backgroundMusic.play().catch(() => {}) // Ignore errors if audio fails
        setMusicStarted(true)
      }
    }

    const handleFirstInteraction = () => {
      startBackgroundMusic()
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }

    document.addEventListener("click", handleFirstInteraction)
    document.addEventListener("keydown", handleFirstInteraction)

    return () => {
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
      if (backgroundMusic) {
        backgroundMusic.pause()
        backgroundMusic = null
      }
    }
  }, [musicStarted])

  useEffect(() => {
    const triggerLightning = () => {
      setIsLightning(true)
      const audio = new Audio("/thunder.mp3")
      audio.volume = 0.3
      audio.play().catch(() => {}) // Ignore errors if audio fails

      setTimeout(() => setIsLightning(false), 200)
    }

    const interval = setInterval(
      () => {
        if (Math.random() > 0.7) {
          triggerLightning()
        }
      },
      Math.random() * 7000 + 8000,
    )

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    localStorage.setItem("steps", steps.toString())
  }, [steps])

  useEffect(() => {
    if (achievedMilestones.size > 0) {
      localStorage.setItem("achievedMilestones", JSON.stringify([...achievedMilestones]))
    }
  }, [achievedMilestones])

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    const handleAppInstalled = () => {
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallApp = async () => {
    if (!deferredPrompt) return

    playSwordClash()
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      playGuitarMilestone()
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const addSteps = (count: number) => {
    setSteps((prev) => {
      const newSteps = prev + count
      checkStepMilestones(newSteps, prev)
      return newSteps
    })
  }

  const fetchNearbyGyms = async (location: Location) => {
    if (!isSupabaseConfigured) return

    try {
      const supabase = getSupabaseClient()
      const { data: gyms, error } = await supabase.from("gyms").select("*").order("name")

      if (error) throw error

      const gymsWithDistance = gyms
        .map((gym) => ({
          ...gym,
          distance: calculateDistance(location, {
            latitude: gym.latitude,
            longitude: gym.longitude,
          }),
        }))
        .filter((gym) => gym.distance <= 1000)
        .sort((a, b) => a.distance - b.distance)

      setNearbyGyms(gymsWithDistance)
    } catch (error) {
      console.error("Error fetching gyms:", error)
      setLocationError("Failed to load nearby gyms")
    }
  }

  const getUserLocation = async () => {
    setLocationLoading(true)
    setLocationError(null)

    try {
      const location = await getCurrentLocation()
      setUserLocation(location)
      await fetchNearbyGyms(location)
    } catch (error) {
      console.error("Location error:", error)
      setLocationError("Unable to access location. Please enable location services.")
    } finally {
      setLocationLoading(false)
    }
  }

  const handleCheckIn = async (gym?: Gym) => {
    playSwordClash()

    if (!userLocation) {
      await getUserLocation()
      return
    }

    setCheckingIn(true)

    try {
      let selectedGym = gym

      if (!selectedGym && nearbyGyms.length > 0) {
        const closestGym = nearbyGyms.find((g) => g.distance <= 100)
        if (closestGym) {
          selectedGym = closestGym
        }
      }

      if (selectedGym && isSupabaseConfigured) {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from("checkins").insert({
          gym_id: selectedGym.id,
          user_latitude: userLocation.latitude,
          user_longitude: userLocation.longitude,
          distance_meters: Math.round(selectedGym.distance),
          wallet_address: walletAddress,
        })

        if (error) throw error
      }

      const today = new Date().toDateString()
      setCheckedIn(true)
      setLastCheckIn(today)
      localStorage.setItem("checkedIn", "true")
      localStorage.setItem("lastCheckIn", today)
      if (selectedGym) {
        localStorage.setItem("lastGym", selectedGym.name)
      }

      playGuitarMilestone()
    } catch (error) {
      console.error("Check-in error:", error)
      setLocationError("Failed to check in. Please try again.")
    } finally {
      setCheckingIn(false)
    }
  }

  const resetSteps = () => {
    setSteps(0)
    localStorage.setItem("steps", "0")
    setAchievedMilestones(new Set())
    localStorage.removeItem("achievedMilestones")
  }

  const progressPercentage = Math.min((steps / dailyGoal) * 100, 100)

  return (
    <div className={`min-h-screen p-4 relative transition-all duration-200 ${isLightning ? "bg-white" : "bg-black"}`}>
      <div className="fixed top-4 left-4 z-10 w-48 h-48 opacity-80">
        <Image
          src="/images/purple-skull.jpg"
          alt="Purple Skull"
          fill
          className="object-contain"
          style={{
            filter: "brightness(1.5) contrast(1.2)",
            mixBlendMode: "screen",
          }}
        />
      </div>
      <div className="fixed top-4 right-4 z-10 w-48 h-48 opacity-80">
        <Image
          src="/images/purple-skull.jpg"
          alt="Purple Skull"
          fill
          className="object-contain"
          style={{
            filter: "brightness(1.5) contrast(1.2)",
            mixBlendMode: "screen",
          }}
        />
      </div>
      <div className="fixed bottom-4 left-4 z-10 w-48 h-48 opacity-80">
        <Image
          src="/images/purple-skull.jpg"
          alt="Purple Skull"
          fill
          className="object-contain"
          style={{
            filter: "brightness(1.5) contrast(1.2)",
            mixBlendMode: "screen",
          }}
        />
      </div>
      <div className="fixed bottom-4 right-4 z-10 w-48 h-48 opacity-80">
        <Image
          src="/images/purple-skull.jpg"
          alt="Purple Skull"
          fill
          className="object-contain"
          style={{
            filter: "brightness(1.5) contrast(1.2)",
            mixBlendMode: "screen",
          }}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div
            className="absolute top-10 left-10 w-64 h-64 rounded-full opacity-30 animate-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, rgba(147, 51, 234, 0.1) 50%, transparent 100%)",
              animation: "float 8s ease-in-out infinite, fade 6s ease-in-out infinite alternate",
            }}
          />
          <div
            className="absolute top-32 right-16 w-48 h-48 rounded-full opacity-25 animate-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(168, 85, 247, 0.1) 50%, transparent 100%)",
              animation: "float 10s ease-in-out infinite reverse, fade 8s ease-in-out infinite alternate-reverse",
              animationDelay: "2s",
            }}
          />
          <div
            className="absolute bottom-20 left-1/4 w-72 h-72 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, rgba(124, 58, 237, 0.6) 0%, rgba(124, 58, 237, 0.1) 50%, transparent 100%)",
              animation: "float 12s ease-in-out infinite, fade 10s ease-in-out infinite alternate",
              animationDelay: "4s",
            }}
          />
          <div
            className="absolute bottom-32 right-8 w-56 h-56 rounded-full opacity-35"
            style={{
              background:
                "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)",
              animation: "float 9s ease-in-out infinite reverse, fade 7s ease-in-out infinite alternate-reverse",
              animationDelay: "1s",
            }}
          />
        </div>
      </div>

      {isLightning && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M20,10 L30,40 L25,40 L35,90 L25,50 L30,50 L20,10"
              fill="white"
              className="animate-pulse"
              style={{ filter: "drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #a855f7)" }}
            />
            <path
              d="M70,5 L80,35 L75,35 L85,85 L75,45 L80,45 L70,5"
              fill="white"
              className="animate-pulse"
              style={{ filter: "drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #a855f7)" }}
            />
          </svg>
        </div>
      )}

      {!musicStarted && (
        <div className="fixed top-52 right-4 z-30 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
          Click anywhere to start music
        </div>
      )}

      {showInstallPrompt && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="text-sm">Install GYMONAD App</span>
            <Button
              onClick={handleInstallApp}
              size="sm"
              variant="secondary"
              className="ml-2 bg-white text-purple-600 hover:bg-gray-100"
            >
              Install
            </Button>
            <Button
              onClick={() => setShowInstallPrompt(false)}
              size="sm"
              variant="ghost"
              className="ml-1 text-white hover:bg-purple-700"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto space-y-6 relative z-20">
        <div className="text-center space-y-4">
          <div className="relative w-full h-48 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/images/gymonad-header.jpg"
              alt="Gymonad - Monad Fitness Characters"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="space-y-2">
            <h1
              className="text-6xl font-serif font-bold text-yellow-500 tracking-wide"
              style={{
                WebkitTextStroke: "2px #fbbf24",
                textShadow: "0 0 10px #fbbf24, 0 0 20px #f59e0b, 0 0 30px #d97706",
              }}
            >
              GYMONAD
            </h1>
            <p className="text-purple-300">Track your steps and daily check-ins</p>
            <div className="flex justify-center gap-4 mt-4">
              <a
                href="https://x.com/Gymonad"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={playSwordClash}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/+_CBKM3CDYM9lYmUx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={playSwordClash}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Telegram
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <Card className="bg-purple-100 border-purple-300 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
              <Wallet className="h-6 w-6 text-purple-600" />
              Web3 Wallet
            </CardTitle>
            <CardDescription className="text-purple-700">Connect your crypto wallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectedWallet ? (
              <div className="space-y-3">
                <div className="text-center">
                  <Badge variant="default" className="bg-green-500 text-white mb-2">
                    {connectedWallet} Connected
                  </Badge>
                  <p className="text-sm text-purple-700 font-mono break-all bg-purple-50 p-2 rounded">
                    {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                  </p>
                </div>
                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  className="w-full border-purple-400 text-purple-700 hover:bg-purple-100 bg-transparent"
                >
                  Disconnect Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {!showWalletOptions ? (
                  <Button
                    onClick={() => {
                      playSwordClash()
                      setShowWalletOptions(true)
                    }}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Button>
                ) : (
                  <div className="space-y-2">
                    {walletAdapters.map((adapter) => (
                      <Button
                        key={adapter.name}
                        onClick={() => connectWallet(adapter)}
                        disabled={walletConnecting}
                        variant="outline"
                        className={`w-full justify-start border-purple-400 text-purple-700 hover:bg-purple-100 ${
                          !adapter.isInstalled() ? "opacity-50" : ""
                        }`}
                      >
                        {walletConnecting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <span className="mr-2">{adapter.icon}</span>
                        )}
                        {adapter.name}
                        {!adapter.isInstalled() && <span className="ml-auto text-xs">(Install)</span>}
                      </Button>
                    ))}
                    <Button
                      onClick={() => setShowWalletOptions(false)}
                      variant="ghost"
                      size="sm"
                      className="w-full text-purple-600"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-purple-100 border-purple-300 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
              <Footprints className="h-6 w-6 text-purple-600" />
              Step Counter
            </CardTitle>
            <CardDescription className="text-purple-700">Daily step tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">{steps.toLocaleString()}</div>
              <div className="text-sm text-purple-700">of {dailyGoal.toLocaleString()} steps</div>
            </div>

            <Progress value={progressPercentage} className="h-3 bg-purple-200 [&>div]:bg-purple-500" />

            <div className="text-center text-sm text-purple-700">
              {progressPercentage >= 100 ? (
                <Badge variant="default" className="bg-purple-500 text-white">
                  🎉 Goal Achieved!
                </Badge>
              ) : (
                `${Math.round(progressPercentage)}% complete`
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => {
                  playSwordClash()
                  addSteps(100)
                }}
                variant="outline"
                size="sm"
                className="border-purple-400 text-purple-700 hover:bg-purple-100"
              >
                +100
              </Button>
              <Button
                onClick={() => {
                  playSwordClash()
                  addSteps(500)
                }}
                variant="outline"
                size="sm"
                className="border-purple-400 text-purple-700 hover:bg-purple-100"
              >
                +500
              </Button>
              <Button
                onClick={() => {
                  playSwordClash()
                  addSteps(1000)
                }}
                variant="outline"
                size="sm"
                className="border-purple-400 text-purple-700 hover:bg-purple-100"
              >
                +1000
              </Button>
            </div>

            <Button
              onClick={() => {
                playSwordClash()
                resetSteps()
              }}
              variant="destructive"
              size="sm"
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Reset Steps
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-purple-100 border-purple-300 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
              <Calendar className="h-6 w-6 text-purple-600" />
              Gym Check-in
            </CardTitle>
            <CardDescription className="text-purple-700">Check in at nearby gyms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              {checkedIn ? (
                <div className="space-y-2">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <Badge variant="default" className="bg-green-500 text-white">
                    Checked in today!
                  </Badge>
                  {lastCheckIn && <p className="text-sm text-purple-700">Last check-in: {lastCheckIn}</p>}
                  {localStorage.getItem("lastGym") && (
                    <p className="text-sm text-purple-600">at {localStorage.getItem("lastGym")}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {!userLocation ? (
                    <div className="space-y-4">
                      <div className="h-12 w-12 border-2 border-dashed border-purple-400 rounded-full mx-auto flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-purple-600" />
                      </div>
                      <Button
                        onClick={() => {
                          playSwordClash()
                          getUserLocation()
                        }}
                        disabled={locationLoading}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        {locationLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Getting Location...
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 mr-2" />
                            Enable Location for Gym Check-in
                          </>
                        )}
                      </Button>
                    </div>
                  ) : nearbyGyms.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-purple-700">Nearby gyms:</p>
                      {nearbyGyms.slice(0, 3).map((gym) => (
                        <div key={gym.id} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                          <div className="text-left">
                            <p className="font-medium text-purple-900 text-sm">{gym.name}</p>
                            <p className="text-xs text-purple-600">{Math.round(gym.distance)}m away</p>
                          </div>
                          <Button
                            onClick={() => handleCheckIn(gym)}
                            disabled={checkingIn || gym.distance > 100}
                            size="sm"
                            className={`${gym.distance <= 100 ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"} text-white`}
                          >
                            {gym.distance <= 100 ? "Check In" : "Too Far"}
                          </Button>
                        </div>
                      ))}
                      {nearbyGyms.some((gym) => gym.distance <= 100) && (
                        <Button
                          onClick={() => handleCheckIn()}
                          disabled={checkingIn}
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                        >
                          {checkingIn ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Checking In...
                            </>
                          ) : (
                            "Quick Check-in at Closest Gym"
                          )}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-purple-700">No gyms found nearby</p>
                      <Button
                        onClick={() => {
                          playSwordClash()
                          getUserLocation()
                        }}
                        variant="outline"
                        size="sm"
                        className="border-purple-400 text-purple-700 bg-transparent"
                      >
                        Refresh Location
                      </Button>
                    </div>
                  )}

                  {locationError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{locationError}</p>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-100 border-purple-300 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
              <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Heraklion Army NFT
            </CardTitle>
            <CardDescription className="text-purple-700">Mint exclusive NFTs on Magic Eden</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-lg text-white">
                <h3 className="font-bold text-lg mb-2">Heraklion Army Collection</h3>
                <p className="text-sm opacity-90 mb-3">Exclusive NFT collection for GYMONAD warriors</p>
                <div className="text-xs font-mono bg-black/20 p-2 rounded break-all">
                  0xb240c821dd61f4a3ee572591536512111e6ffe45
                </div>
              </div>

              {connectedWallet ? (
                <div className="space-y-3">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-700 mb-2">Connected: {connectedWallet}</p>
                    <p className="text-xs font-mono text-purple-600">
                      {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
                    </p>
                  </div>

                  <iframe
                    src={`https://magiceden.io/embed/mint/0xb240c821dd61f4a3ee572591536512111e6ffe45?wallet=${walletAddress}`}
                    width="100%"
                    height="400"
                    frameBorder="0"
                    className="rounded-lg border-2 border-purple-300"
                    title="Magic Eden Mint Terminal"
                  />

                  <a
                    href={`https://magiceden.io/collections/ethereum/0xb240c821dd61f4a3ee572591536512111e6ffe45`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all font-medium"
                    onClick={playSwordClash}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    View on Magic Eden
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                    <p className="text-sm text-amber-800">Connect your wallet to access the NFT mint terminal</p>
                  </div>

                  <a
                    href="https://magiceden.io/collections/ethereum/0xb240c821dd61f4a3ee572591536512111e6ffe45"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all font-medium"
                    onClick={playSwordClash}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    View Collection on Magic Eden
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-5px); }
          75% { transform: translateY(-30px) translateX(15px); }
        }
        
        @keyframes fade {
          0% { opacity: 0.1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
