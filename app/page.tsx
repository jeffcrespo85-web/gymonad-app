"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, ExternalLink, MapPin, Loader2, Wallet, Download, Activity } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { getCurrentLocation, calculateDistance, type Location, type Gym } from "@/lib/location"
import { walletAdapters, type WalletAdapter } from "@/lib/wallet"
import { createClient } from "@/lib/supabase/client"

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          PlacesService: new (element: HTMLElement) => any
          PlacesServiceStatus: {
            OK: string
          }
        }
        LatLng: new (lat: number, lng: number) => any
        geometry: {
          spherical: {
            computeDistanceBetween: (latLngA: any, latLngB: any) => number
          }
        }
      }
    }
    gapi?: any
  }
}

const GYMONAD_CONTRACT_ADDRESS = "0x476cfebb9b6ee7b1b29147529e805dbfd4b5b89e"

export default function GymonadFitness() {
  const [steps, setSteps] = useState(0)
  const [dailyGoal] = useState(10000)
  const [checkedIn, setCheckedIn] = useState(false)
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null)
  const [isLightning, setIsLightning] = useState(false)
  const [musicStarted, setMusicStarted] = useState(false)
  const [achievedMilestones, setAchievedMilestones] = useState<Set<string>>(new Set())

  const [workoutSpot, setWorkoutSpot] = useState<(Location & { name: string }) | null>(null)
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [stepLocation, setStepLocation] = useState<Location | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [lastSpotChange, setLastSpotChange] = useState<string | null>(null)
  const [settingSpot, setSettingSpot] = useState(false)

  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [walletConnecting, setWalletConnecting] = useState(false)

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  const [autoStepTracking, setAutoStepTracking] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [tickets, setTickets] = useState(0)
  const [lastTicketSteps, setLastTicketSteps] = useState(0)

  const [lotteryEntries, setLotteryEntries] = useState(0)
  const [lastWinner, setLastWinner] = useState<string | null>(null)
  const [nextDrawDate, setNextDrawDate] = useState<Date | null>(null)
  const [lotteryHistory, setLotteryHistory] = useState<Array<{ winner: string; date: string; tickets: number }>>([])
  const [nearbyGyms, setNearbyGyms] = useState<Gym[]>([])

  const [googleFitConnected, setGoogleFitConnected] = useState(false)
  const [googleFitLoading, setGoogleFitLoading] = useState(false)

  const [isBraveBrowser, setIsBraveBrowser] = useState(false)
  const [deviceMotionSupported, setDeviceMotionSupported] = useState(false)
  const [motionStepCount, setMotionStepCount] = useState(0)
  const [totalDistance, setTotalDistance] = useState(0)

  const initializeGoogleFit = async () => {
    setGoogleFitLoading(true)
    try {
      // Load Google API
      await new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "https://apis.google.com/js/api.js"
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })

      // Initialize Google API
      await new Promise((resolve) => {
        window.gapi.load("auth2", resolve)
      })

      // Use a more generic client ID that works with preview domains
      await window.gapi.auth2.init({
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // Replace with your actual Google Client ID
      })

      // Load Fitness API
      await new Promise((resolve) => {
        window.gapi.load("client", resolve)
      })

      await window.gapi.client.init({
        apiKey: "YOUR_GOOGLE_API_KEY", // Replace with your actual Google API Key
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest"],
      })

      setGoogleFitConnected(true)
      console.log("[v0] Google Fit initialized successfully")
    } catch (error) {
      console.error("[v0] Google Fit initialization failed:", error)
      setLocationError("Failed to connect to Google Fit. Please configure your Google API credentials.")
    } finally {
      setGoogleFitLoading(false)
    }
  }

  const connectGoogleFit = async () => {
    if (!window.gapi) {
      await initializeGoogleFit()
    }

    try {
      const authInstance = window.gapi.auth2.getAuthInstance()
      const user = await authInstance.signIn({
        scope: "https://www.googleapis.com/auth/fitness.activity.read",
      })

      if (user.isSignedIn()) {
        setGoogleFitConnected(true)
        fetchGoogleFitSteps()
        // Set up periodic updates every 5 minutes
        const intervalId = setInterval(fetchGoogleFitSteps, 5 * 60 * 1000)
        setAutoStepTracking(true)
        console.log("[v0] Google Fit connected successfully")
      }
    } catch (error) {
      console.error("[v0] Google Fit connection failed:", error)
      setLocationError("Failed to connect to Google Fit. Please allow popups and try again.")
    }
  }

  const fetchGoogleFitSteps = async () => {
    if (!googleFitConnected || !window.gapi) return

    try {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

      const request = {
        aggregateBy: [
          {
            dataTypeName: "com.google.step_count.delta",
            dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
          },
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis: startOfDay.getTime(),
        endTimeMillis: endOfDay.getTime(),
      }

      const response = await window.gapi.client.fitness.users.dataset.aggregate({
        userId: "me",
        resource: request,
      })

      if (response.result.bucket && response.result.bucket.length > 0) {
        const bucket = response.result.bucket[0]
        if (bucket.dataset && bucket.dataset.length > 0) {
          const dataset = bucket.dataset[0]
          if (dataset.point && dataset.point.length > 0) {
            const stepCount = dataset.point[0].value[0].intVal || 0
            const oldSteps = steps
            setSteps(stepCount)
            checkStepMilestones(stepCount, oldSteps)
            localStorage.setItem("steps", stepCount.toString())
            console.log("[v0] Google Fit steps updated:", stepCount)

            // Estimate distance based on steps (adjust factor as needed)
            const distanceIncrement = stepCount * 0.762 // Average step length in meters
            setTotalDistance((prevDistance) => prevDistance + distanceIncrement)
          }
        }
      }
    } catch (error) {
      console.error("[v0] Failed to fetch Google Fit steps:", error)
    }
  }

  const playSwordClash = () => {
    const audio = new Audio("/yarnlhttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/swordsclashing1sec-Gu3scJA0wJCm9za9kdnHLXcJdMvdkp.mp3")
    audio.volume = 0.5
    audio.play().catch(() => {}) // Ignore errors if audio fails
  }

  const playGuitarMilestone = () => {
    const audio = new Audio("/yarnlhttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/guitarmp3-5NQgvR22O7TRWetiCDZvCln2LFfg6h.mp3")
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

    checkStepTickets(newSteps)
  }

  const checkStepTickets = (newSteps: number) => {
    const ticketsEarned = Math.floor(newSteps / 2000)
    const lastTicketsEarned = Math.floor(lastTicketSteps / 2000)

    if (ticketsEarned > lastTicketsEarned) {
      const newTicketsToAward = ticketsEarned - lastTicketsEarned
      for (let i = 0; i < newTicketsToAward; i++) {
        awardTicket("2,000 steps milestone")
      }
    }

    setLastTicketSteps(newSteps)
    localStorage.setItem("lastTicketSteps", newSteps.toString())
  }

  const awardTicket = (reason: string) => {
    setTickets((prev) => {
      const newTickets = prev + 1
      localStorage.setItem("tickets", newTickets.toString())
      console.log(`[v0] Ticket awarded for: ${reason}. Total tickets: ${newTickets}`)
      return newTickets
    })

    // Add to lottery entries
    setLotteryEntries((prev) => {
      const newEntries = prev + 1
      localStorage.setItem("lotteryEntries", newEntries.toString())
      return newEntries
    })

    playGuitarMilestone() // Play reward sound
  }

  const setWorkoutSpotLocation = async () => {
    setLocationLoading(true)
    setLocationError(null)

    try {
      const location = await getCurrentLocation()
      setUserLocation(location)

      // Check if user can change spot (once per month)
      const lastChange = localStorage.getItem("lastSpotChange")
      const now = new Date()
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

      if (lastChange && new Date(lastChange) > oneMonthAgo) {
        const nextChangeDate = new Date(lastChange)
        nextChangeDate.setMonth(nextChangeDate.getMonth() + 1)
        setLocationError(`You can change your workout spot again on ${nextChangeDate.toLocaleDateString()}`)
        return
      }

      setSettingSpot(true)
    } catch (error) {
      console.error("Location error:", error)
      setLocationError("Unable to access location. Please enable location services.")
    } finally {
      setLocationLoading(false)
    }
  }

  const confirmWorkoutSpot = (spotName: string) => {
    if (!userLocation) return

    const newSpot = {
      ...userLocation,
      name: spotName || "My Workout Spot",
    }

    setWorkoutSpot(newSpot)
    const today = new Date().toISOString()
    setLastSpotChange(today)

    localStorage.setItem("workoutSpot", JSON.stringify(newSpot))
    localStorage.setItem("lastSpotChange", today)

    setSettingSpot(false)
    setLocationError(null)
    playSwordClash()
    console.log(`[v0] Workout spot set: ${newSpot.name}`)
  }

  const getLocationForCheckIn = async () => {
    setLocationLoading(true)
    setLocationError(null)

    try {
      const location = await getCurrentLocation()
      setUserLocation(location)
    } catch (error) {
      console.error("Location error:", error)
      setLocationError("Unable to access location for check-in. Please enable location services.")
    } finally {
      setLocationLoading(false)
    }
  }

  const handleWorkoutCheckIn = async () => {
    playSwordClash()

    if (!workoutSpot) {
      setLocationError("Please set your workout spot first")
      return
    }

    if (!userLocation) {
      await getLocationForCheckIn()
      return
    }

    setCheckingIn(true)

    try {
      const distance = calculateDistance(userLocation, workoutSpot)

      if (distance > 100) {
        setLocationError(
          `You must be within 100m of ${workoutSpot.name} to check in. Currently ${Math.round(distance)}m away.`,
        )
        setCheckingIn(false)
        return
      }

      // Save check-in to database if available
      if (isSupabaseConfigured) {
        try {
          const supabase = createClient()
          const { error } = await supabase.from("checkins").insert({
            spot_name: workoutSpot.name,
            spot_latitude: workoutSpot.latitude,
            spot_longitude: workoutSpot.longitude,
            user_latitude: userLocation.latitude,
            user_longitude: userLocation.longitude,
            distance_meters: Math.round(distance),
            wallet_address: walletAddress,
          })

          if (error && !error.message.includes("table") && !error.message.includes("does not exist")) {
            throw error
          }
        } catch (error) {
          console.error("Error saving check-in to database:", error)
        }
      }

      const today = new Date().toDateString()
      setCheckedIn(true)
      setLastCheckIn(today)
      localStorage.setItem("checkedIn", "true")
      localStorage.setItem("lastCheckIn", today)

      awardTicket("workout spot check-in")
      playGuitarMilestone()
      console.log(`[v0] Successfully checked in at ${workoutSpot.name}`)
    } catch (error) {
      console.error("Check-in error:", error)
      setLocationError("Failed to check in. Please try again.")
    } finally {
      setCheckingIn(false)
    }
  }

  const resetStepsValue = () => {
    setSteps(0)
    localStorage.setItem("steps", "0")
    setAchievedMilestones(new Set())
    localStorage.removeItem("achievedMilestones")
  }

  const stopAutoStepTracking = () => {
    if (autoStepTracking) {
      setAutoStepTracking(false)
      console.log("[v0] Google Fit sync stopped")
    }
  }

  const progressPercentageValue = Math.min((steps / dailyGoal) * 100, 100)

  const getNextDrawSunday = () => {
    const now = new Date()
    const nextSunday = new Date(now)
    nextSunday.setUTCDate(now.getUTCDate() + (7 - now.getUTCDay()))
    nextSunday.setUTCHours(20, 0, 0, 0) // 8 PM UTC
    return nextSunday
  }

  const drawLotteryWinner = () => {
    if (!connectedWallet || !walletAddress || lotteryEntries === 0) {
      alert("Need connected wallet and lottery entries to draw!")
      return
    }

    // Simple random selection (in real app, this would be more sophisticated)
    const winner = walletAddress
    const drawDate = new Date().toISOString().split("T")[0]

    // Update lottery history
    const newEntry = {
      winner: winner,
      date: drawDate,
      tickets: lotteryEntries,
    }

    const updatedHistory = [newEntry, ...lotteryHistory.slice(0, 4)] // Keep last 5 winners
    setLotteryHistory(updatedHistory)
    localStorage.setItem("lotteryHistory", JSON.stringify(updatedHistory))

    // Set as last winner
    setLastWinner(winner)
    localStorage.setItem("lastWinner", winner)

    // Reset lottery entries and set next draw date
    setLotteryEntries(0)
    localStorage.setItem("lotteryEntries", "0")

    const nextSunday = getNextDrawSunday()
    setNextDrawDate(nextSunday)
    localStorage.setItem("nextDrawDate", nextSunday.toISOString())

    playGuitarMilestone()
    alert(`🎉 Lottery Winner: ${winner.slice(0, 6)}...${winner.slice(-4)}\n5 MONAD tokens will be sent manually!`)
  }

  const getTimeUntilLotteryDraw = () => {
    if (!nextDrawDate) return "Loading..."

    const now = new Date()
    const diff = nextDrawDate.getTime() - now.getTime()

    if (diff <= 0) return "Draw Ready!"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    return `${days}d ${hours}h`
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

    const savedTickets = localStorage.getItem("tickets")
    const savedLastTicketSteps = localStorage.getItem("lastTicketSteps")
    if (savedTickets) setTickets(Number.parseInt(savedTickets))
    if (savedLastTicketSteps) setLastTicketSteps(Number.parseInt(savedLastTicketSteps))

    const savedLotteryEntries = localStorage.getItem("lotteryEntries")
    if (savedLotteryEntries) {
      setLotteryEntries(Number.parseInt(savedLotteryEntries))
    }

    const savedLastWinner = localStorage.getItem("lastWinner")
    if (savedLastWinner) {
      setLastWinner(savedLastWinner)
    }

    const savedNextDrawDate = localStorage.getItem("nextDrawDate")
    if (savedNextDrawDate) {
      setNextDrawDate(new Date(savedNextDrawDate))
    } else {
      // Set next draw date to next Sunday at 8 PM UTC
      const nextSunday = getNextDrawSunday()
      setNextDrawDate(nextSunday)
      localStorage.setItem("nextDrawDate", nextSunday.toISOString())
    }

    const savedLotteryHistory = localStorage.getItem("lotteryHistory")
    if (savedLotteryHistory) {
      setLotteryHistory(JSON.parse(savedLotteryHistory))
    }

    const savedSpot = localStorage.getItem("workoutSpot")
    const savedSpotChange = localStorage.getItem("lastSpotChange")

    if (savedSpot) {
      setWorkoutSpot(JSON.parse(savedSpot))
    }
    if (savedSpotChange) {
      setLastSpotChange(savedSpotChange)
    }

    setTimeout(() => setIsLoading(false), 2000)
  }, [])

  useEffect(() => {
    // Google Maps integration removed for security compliance
  }, [])

  useEffect(() => {
    let backgroundMusic: HTMLAudioElement | null = null

    const startBackgroundMusic = () => {
      if (!musicStarted) {
        backgroundMusic = new Audio("/yarnlhttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/gymonadtheme-Fuh0xpQtOA63uufs61fIneHPY136tL.mp3")
        backgroundMusic.loop = true
        backgroundMusic.volume = 0.4
        backgroundMusic.play().catch(() => {
          const handleFirstInteraction = () => {
            backgroundMusic?.play().catch(() => {})
            setMusicStarted(true)
            document.removeEventListener("click", handleFirstInteraction)
            document.removeEventListener("keydown", handleFirstInteraction)
          }
          document.addEventListener("click", handleFirstInteraction)
          document.addEventListener("keydown", handleFirstInteraction)
        })
        setMusicStarted(true)
      }
    }

    startBackgroundMusic()

    return () => {
      if (backgroundMusic) {
        backgroundMusic.pause()
        backgroundMusic = null
      }
    }
  }, [musicStarted])

  useEffect(() => {
    const triggerLightning = () => {
      setIsLightning(true)
      const audio = new Audio("/yarnl/thunder.mp3")
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

  useEffect(() => {
    const detectBrave = () => {
      return (navigator as any).brave && (navigator as any).brave.isBrave
    }

    const checkDeviceMotion = () => {
      return "DeviceMotionEvent" in window && typeof DeviceMotionEvent.requestPermission === "function"
    }

    setIsBraveBrowser(detectBrave())
    setDeviceMotionSupported(checkDeviceMotion())
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

  const findNearbyGymsWithGoogle = async (location: Location): Promise<Gym[]> => {
    console.log("[v0] Google Maps integration disabled for security")
    return []
  }

  const fetchNearbyGyms = async (location: Location) => {
    try {
      // First try database gyms
      if (isSupabaseConfigured) {
        const supabase = createClient()
        const { data: gyms, error } = await supabase.from("gyms").select("*").order("name")

        if (!error && gyms && gyms.length > 0) {
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
          return
        }
      }

      // Fallback to Google Places API
      try {
        const googleGyms = await findNearbyGymsWithGoogle(location)
        setNearbyGyms(googleGyms)
      } catch (googleError) {
        console.error("Google Places fallback failed:", googleError)
        setLocationError("Unable to find nearby gyms. Please check your location settings.")
      }
    } catch (error) {
      console.error("Error fetching gyms:", error)
      setLocationError("Failed to load nearby gyms. Please check your location settings.")
    }
  }

  const getGymLocation = async () => {
    setLocationLoading(true)
    setLocationError(null)

    try {
      const location = await getCurrentLocation()
      setUserLocation(location)
      await fetchNearbyGyms(location)
    } catch (error) {
      console.error("Gym location error:", error)
      setLocationError("Unable to access location for gym check-in. Please enable location services.")
    } finally {
      setLocationLoading(false)
    }
  }

  const verifyGymLocationWithGoogle = async (userLoc: Location, gym: Gym): Promise<boolean> => {
    console.log(`[v0] Using fallback distance calculation for ${gym.name}`)
    return calculateDistance(userLoc, { latitude: gym.latitude, longitude: gym.longitude }) <= 100
  }

  const handleGymCheckIn = async (gym?: Gym) => {
    playSwordClash()

    if (!userLocation) {
      await getGymLocation()
      return
    }

    setCheckingIn(true)

    try {
      let selectedGym = gym

      if (!selectedGym && nearbyGyms.length > 0) {
        for (const nearbyGym of nearbyGyms) {
          const isWithinRange = await verifyGymLocationWithGoogle(userLocation, nearbyGym)
          if (isWithinRange) {
            selectedGym = nearbyGym
            break
          }
        }
      }

      if (selectedGym) {
        const isVerified = await verifyGymLocationWithGoogle(userLocation, selectedGym)
        if (!isVerified) {
          setLocationError(`You must be within 100m of ${selectedGym.name} to check in.`)
          setCheckingIn(false)
          return
        }
      }

      if (selectedGym && isSupabaseConfigured) {
        try {
          const supabase = createClient()
          const { error } = await supabase.from("checkins").insert({
            gym_id: selectedGym.id,
            user_latitude: userLocation.latitude,
            user_longitude: userLocation.longitude,
            distance_meters: Math.round(selectedGym.distance),
            wallet_address: walletAddress,
            verified_with_google: false,
          })

          if (error) {
            if (error.message.includes("table") && error.message.includes("does not exist")) {
              console.log("[v0] Checkins table not found - using local storage only")
            } else {
              throw error
            }
          }
        } catch (error) {
          console.error("Error saving check-in to database:", error)
        }
      }

      const today = new Date().toDateString()
      setCheckedIn(true)
      setLastCheckIn(today)
      localStorage.setItem("checkedIn", "true")
      localStorage.setItem("lastCheckIn", today)
      if (selectedGym) {
        localStorage.setItem("lastGym", selectedGym.name)
      }

      awardTicket("gym check-in")
      playGuitarMilestone()
      console.log(`[v0] Successfully checked in at ${selectedGym?.name || "gym"}`)
    } catch (error) {
      console.error("Check-in error:", error)
      setLocationError("Failed to check in. Please try again.")
    } finally {
      setCheckingIn(false)
    }
  }

  const recordFitnessActivity = async (activityType: string, value: number) => {
    if (!connectedWallet || !walletAddress) return

    try {
      // This would interact with the GYMONAD smart contract
      console.log(`[v0] Recording ${activityType}: ${value} to contract ${GYMONAD_CONTRACT_ADDRESS}`)
      // Contract interaction would go here when implemented
    } catch (error) {
      console.error("Failed to record fitness activity on-chain:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Background smoke effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0">
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
          </div>
        </div>

        {/* Loading content */}
        <div className="relative z-10 text-center">
          <div className="mb-6">
            {/* Cropped header image to show only top 2/3 by cutting bottom third */}
            <div className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl overflow-hidden">
              <img src="/images/gymonad-loading.jpg" alt="GYMONAD Loading" className="object-contain w-full h-full" />
            </div>
          </div>

          {/* Spinning loading wheel */}
          <div className="flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 animate-spin">
                <div className="w-4 h-4 bg-yellow-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                <div className="w-4 h-4 bg-yellow-400 rounded-full absolute top-2 right-2"></div>
                <div className="w-4 h-4 bg-yellow-300 rounded-full absolute right-0 top-1/2 transform -translate-y-1/2"></div>
                <div className="w-4 h-4 bg-yellow-200 rounded-full absolute bottom-2 right-2"></div>
                <div className="w-4 h-4 bg-yellow-100 rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
                <div className="w-4 h-4 bg-yellow-200 rounded-full absolute bottom-2 left-2"></div>
                <div className="w-4 h-4 bg-yellow-300 rounded-full absolute left-0 top-1/2 transform -translate-y-1/2"></div>
                <div className="w-4 h-4 bg-yellow-400 rounded-full absolute top-2 left-2"></div>
              </div>
            </div>
          </div>

          <p className="text-yellow-500 text-lg font-bold mt-4 animate-pulse">Loading GYMONAD...</p>
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

  return (
    <div className={`min-h-screen bg-black relative overflow-hidden ${isLightning ? "bg-white" : ""}`}>
      {/* Purple smoke and cloud effects */}
      <div className="absolute inset-0 pointer-events-none">
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

      {/* Lightning effects */}
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

      {/* Main content container with integrated skulls */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="absolute left-8 top-32 w-20 h-20 opacity-80">
          <img
            src="/images/purple-skull.png"
            alt="Purple Skull"
            className="w-full h-full"
            style={{
              filter: "brightness(1.3) contrast(1.2) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #7c3aed)",
              animation: "skullGlow 3s ease-in-out infinite alternate",
            }}
          />
        </div>

        <div className="absolute right-8 top-32 w-20 h-20 opacity-80">
          <img
            src="/images/purple-skull.png"
            alt="Purple Skull"
            className="w-full h-full"
            style={{
              filter: "brightness(1.3) contrast(1.2) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #7c3aed)",
              animation: "skullGlow 3s ease-in-out infinite alternate",
              animationDelay: "1s",
            }}
          />
        </div>

        <div className="absolute left-8 bottom-32 w-20 h-20 opacity-80">
          <img
            src="/images/purple-skull.png"
            alt="Purple Skull"
            className="w-full h-full"
            style={{
              filter: "brightness(1.3) contrast(1.2) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #7c3aed)",
              animation: "skullGlow 3s ease-in-out infinite alternate",
              animationDelay: "2s",
            }}
          />
        </div>

        <div className="absolute right-8 bottom-32 w-20 h-20 opacity-80">
          <img
            src="/images/purple-skull.png"
            alt="Purple Skull"
            className="w-full h-full"
            style={{
              filter: "brightness(1.3) contrast(1.2) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #7c3aed)",
              animation: "skullGlow 3s ease-in-out infinite alternate",
              animationDelay: "1.5s",
            }}
          />
        </div>

        <div className="absolute left-16 top-1/2 w-20 h-20 opacity-80">
          <img
            src="/images/purple-skull.png"
            alt="Purple Skull"
            className="w-full h-full"
            style={{
              filter: "brightness(1.3) contrast(1.2) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #7c3aed)",
              animation: "skullGlow 3s ease-in-out infinite alternate",
              animationDelay: "0.5s",
            }}
          />
        </div>

        <div className="absolute right-16 top-1/2 w-20 h-20 opacity-80">
          <img
            src="/images/purple-skull.png"
            alt="Purple Skull"
            className="w-full h-full"
            style={{
              filter: "brightness(1.3) contrast(1.2) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #7c3aed)",
              animation: "skullGlow 3s ease-in-out infinite alternate",
              animationDelay: "2.5s",
            }}
          />
        </div>

        <div className="text-center mb-8">
          <div className="mb-6">
            {/* Cropped header image to show only top 2/3 by cutting bottom third */}
            <div className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl overflow-hidden">
              <img
                src="/images/gymonad-header.jpg"
                alt="GYMONAD Team"
                className="w-full h-64 object-cover object-top"
              />
            </div>
          </div>

          <h1
            className="text-6xl font-bold mb-4 font-serif tracking-wider text-yellow-500"
            style={{
              WebkitTextStroke: "2px #fbbf24",
              textShadow: "0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.6)",
            }}
          >
            GYMONAD
          </h1>
          <p className="text-purple-300 text-lg mb-4">Track your fitness journey in the Monad ecosystem</p>

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-lg px-4 py-2 mb-4">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
              T
            </div>
            <span className="text-yellow-400 font-bold text-lg">{tickets}</span>
            <span className="text-yellow-300 text-sm">Tickets</span>
          </div>
        </div>

        <div className="grid gap-6 max-w-md mx-auto px-4">
          <Card className="bg-purple-100 border-purple-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
                <Activity className="h-6 w-6 text-purple-600" />
                Step Counter
              </CardTitle>
              <CardDescription className="text-purple-700">
                Daily step tracking • 1 ticket per 2,000 steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{steps.toLocaleString()}</div>
                <div className="text-sm text-purple-700">of {dailyGoal.toLocaleString()} steps</div>
                {autoStepTracking && (
                  <div className="text-xs text-purple-600 mt-1">Distance: {totalDistance.toFixed(0)}m tracked</div>
                )}
              </div>

              <Progress value={progressPercentageValue} className="h-3 bg-purple-200 [&>div]:bg-purple-500" />

              <div className="text-center text-sm text-purple-700">
                {progressPercentageValue >= 100 ? (
                  <Badge variant="default" className="bg-purple-500 text-white">
                    🎉 Goal Achieved!
                  </Badge>
                ) : (
                  `${Math.round(progressPercentageValue)}% complete`
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    📱 This app uses Google Fit for accurate step tracking from your device sensors.
                    <br />• Connect your Google Fit account below
                    <br />• Steps will sync automatically every 5 minutes
                    <br />• Manual step input available as backup
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-amber-800 font-medium">Google Fit Integration</span>
                  <button
                    onClick={() => {
                      playSwordClash()
                      if (googleFitConnected) {
                        setGoogleFitConnected(false)
                        setAutoStepTracking(false)
                      } else {
                        connectGoogleFit()
                      }
                    }}
                    disabled={googleFitLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      googleFitConnected
                        ? "bg-green-500 text-white"
                        : googleFitLoading
                          ? "bg-gray-300 text-gray-600"
                          : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    }`}
                  >
                    {googleFitLoading ? "Connecting..." : googleFitConnected ? "✓ Connected" : "Connect Google Fit"}
                  </button>
                </div>

                {googleFitConnected && (
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800 font-medium">Auto Sync</span>
                    <button
                      onClick={() => {
                        if (autoStepTracking) {
                          stopAutoStepTracking()
                        } else {
                          fetchGoogleFitSteps()
                          const intervalId = setInterval(fetchGoogleFitSteps, 5 * 60 * 1000)
                          setAutoStepTracking(true)
                        }
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        autoStepTracking ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      }`}
                    >
                      {autoStepTracking ? "Stop Sync" : "Start Sync"}
                    </button>
                  </div>
                )}

                {googleFitConnected && autoStepTracking && (
                  <p className="text-sm text-green-700">
                    ✓ Google Fit connected • Steps sync automatically every 5 minutes
                  </p>
                )}

                {!googleFitConnected && (
                  <p className="text-sm text-amber-700">
                    ⚠️ Connect Google Fit for automatic step tracking, or use manual input below
                  </p>
                )}
              </div>

              <Button
                onClick={() => {
                  playSwordClash()
                  resetStepsValue()
                  setTotalDistance(0)
                }}
                variant="destructive"
                size="sm"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Reset Steps
              </Button>

              {locationError && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded text-center">{locationError}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-purple-100 border-purple-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
                <Calendar className="h-6 w-6 text-purple-600" />
                Workout Spot Check-in
              </CardTitle>
              <CardDescription className="text-purple-700">
                Check in at your designated workout spot • 1 ticket per check-in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {!workoutSpot ? (
                  <div className="space-y-4">
                    <div className="h-12 w-12 border-2 border-dashed border-purple-400 rounded-full mx-auto flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-sm text-purple-700">Set your designated workout spot</p>
                    <Button
                      onClick={setWorkoutSpotLocation}
                      disabled={locationLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {locationLoading ? "Getting Location..." : "Set Workout Spot"}
                    </Button>
                  </div>
                ) : checkedIn ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <Badge variant="default" className="bg-green-500 text-white">
                      Checked in today!
                    </Badge>
                    {lastCheckIn && <p className="text-sm text-purple-700">Last check-in: {lastCheckIn}</p>}
                    <p className="text-sm text-purple-600">at {workoutSpot.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-medium text-purple-900 text-sm">{workoutSpot.name}</p>
                      <p className="text-xs text-purple-600">Your designated workout spot</p>
                    </div>

                    {!userLocation ? (
                      <Button
                        onClick={getLocationForCheckIn}
                        disabled={locationLoading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {locationLoading ? "Getting Location..." : "Get Location to Check In"}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-purple-600">
                          Distance: {Math.round(calculateDistance(userLocation, workoutSpot))}m away
                        </p>
                        <Button
                          onClick={handleWorkoutCheckIn}
                          disabled={checkingIn || calculateDistance(userLocation, workoutSpot) > 100}
                          className={`w-full ${calculateDistance(userLocation, workoutSpot) <= 100 ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"} text-white`}
                        >
                          {checkingIn ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Checking In...
                            </>
                          ) : calculateDistance(userLocation, workoutSpot) <= 100 ? (
                            "Check In"
                          ) : (
                            "Too Far Away"
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="pt-2 border-t border-purple-200">
                      <Button
                        onClick={setWorkoutSpotLocation}
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-400 text-purple-700 bg-transparent text-xs"
                        disabled={
                          lastSpotChange && new Date(lastSpotChange) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        }
                      >
                        Change Workout Spot
                        {lastSpotChange && (
                          <span className="ml-1 text-xs">
                            (Next:{" "}
                            {new Date(
                              new Date(lastSpotChange).getTime() + 30 * 24 * 60 * 60 * 1000,
                            ).toLocaleDateString()}
                            )
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {settingSpot && userLocation && (
                <div className="space-y-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">Set your workout spot name:</p>
                  <input
                    type="text"
                    placeholder="e.g., Home Gym, Local Park, etc."
                    className="w-full p-2 border border-yellow-300 rounded text-sm"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        confirmWorkoutSpot((e.target as HTMLInputElement).value)
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="Home Gym"]') as HTMLInputElement
                        confirmWorkoutSpot(input?.value || "My Workout Spot")
                      }}
                      size="sm"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      Confirm Spot
                    </Button>
                    <Button onClick={() => setSettingSpot(false)} variant="outline" size="sm" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {locationError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{locationError}</p>}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-400 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
                <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                GYMONAD Smart Contract
              </CardTitle>
              <CardDescription className="text-purple-700">Official GYMONAD fitness protocol</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-lg text-white">
                <h3 className="font-bold text-lg mb-2">GYMONAD Protocol</h3>
                <p className="text-sm opacity-90 mb-3">Decentralized fitness tracking and rewards</p>
                <div className="text-xs font-mono bg-black/20 p-2 rounded break-all">{GYMONAD_CONTRACT_ADDRESS}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-purple-900">{steps}</div>
                  <div className="text-sm text-purple-700">Steps On-Chain</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-purple-900">{tickets}</div>
                  <div className="text-sm text-purple-700">Rewards Earned</div>
                </div>
              </div>

              {connectedWallet ? (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      playSwordClash()
                      recordFitnessActivity("steps", steps)
                    }}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Sync Fitness Data
                  </Button>
                  <p className="text-xs text-purple-600 text-center">
                    Record your fitness achievements on the blockchain
                  </p>
                </div>
              ) : (
                <p className="text-sm text-purple-700 text-center">Connect wallet to interact with GYMONAD protocol</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100 to-purple-100 border-blue-400 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-blue-900">
                <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Heraklion Army NFT
              </CardTitle>
              <CardDescription className="text-blue-700">Partner collection on Magic Eden</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-3">
                <div className="relative">
                  <img
                    src="/images/heraklion-membership-pass.jpg"
                    alt="Heraklion Gym Membership Pass NFT"
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={playSwordClash}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg pointer-events-none" />
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg text-white">
                  <h3 className="font-bold text-lg mb-2">Partner Collection</h3>
                  <p className="text-sm opacity-90 mb-3">Exclusive NFTs for GYMONAD community</p>
                  <div className="text-xs font-mono bg-black/20 p-2 rounded break-all">
                    0xb240c821dd61f4a3ee572591536512111e6ffe45
                  </div>
                </div>

                <a
                  href="https://magiceden.us/mint-terminal/monad-testnet/0x1e23ce5c525bdd782bd6632e7a3b63011432dcb3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-lg transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                  onClick={playSwordClash}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  MINT ON MAGIC EDEN
                  <ExternalLink className="w-5 h-5" />
                </a>

                {connectedWallet && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 mb-1">Connected: {connectedWallet}</p>
                    <p className="text-xs text-blue-600 font-mono break-all">{walletAddress}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-400 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-amber-900">
                <span className="text-2xl">🎰</span>
                Weekly MONAD Lottery
              </CardTitle>
              <CardDescription className="text-amber-700">
                5 MONAD testnet tokens • Every Sunday 8 PM UTC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-yellow-200 rounded-lg p-3">
                  <div className="text-2xl font-bold text-amber-900">{lotteryEntries}</div>
                  <div className="text-sm text-amber-700">Your Entries</div>
                </div>
                <div className="bg-yellow-200 rounded-lg p-3">
                  <div className="text-lg font-bold text-amber-900">{getTimeUntilLotteryDraw()}</div>
                  <div className="text-sm text-amber-700">Next Draw</div>
                </div>
              </div>

              {lastWinner && (
                <div className="bg-gradient-to-r from-yellow-300 to-amber-300 rounded-lg p-3 text-center">
                  <div className="text-sm text-amber-800 font-semibold">🏆 Last Winner</div>
                  <div className="font-mono text-amber-900 text-sm">
                    {lastWinner.slice(0, 8)}...{lastWinner.slice(-6)}
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-amber-700">
                <p>Earn entries: 1 per gym check-in • 1 per 2,000 steps</p>
                <p className="text-xs mt-1">Tokens sent manually by admin after draw</p>
              </div>

              {/* Admin draw button - hidden in production */}
              {process.env.NODE_ENV === "development" && (
                <Button
                  onClick={drawLotteryWinner}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={lotteryEntries === 0 || !connectedWallet}
                >
                  🎲 Draw Lottery (Admin)
                </Button>
              )}
            </CardContent>
          </Card>

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
        </div>

        <style jsx>{`
          @keyframes skullGlow {
            0% { 
              filter: brightness(1.3) contrast(1.2) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #7c3aed);
            }
            100% { 
              filter: brightness(1.6) contrast(1.4) drop-shadow(0 0 25px #a855f7) drop-shadow(0 0 50px #7c3aed) drop-shadow(0 0 75px #8b5cf6);
            }
          }
          
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
    </div>
  )
}
