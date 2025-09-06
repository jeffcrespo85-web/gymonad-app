"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, MapPin, Loader2, Navigation } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { getCurrentLocation, calculateDistance, type Location } from "@/lib/location"
import { createClient } from "@/lib/supabase/client"

export default function WorkoutPage() {
  const [workoutSpot, setWorkoutSpot] = useState<(Location & { name: string }) | null>(null)
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [lastSpotChange, setLastSpotChange] = useState<string | null>(null)
  const [settingSpot, setSettingSpot] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null)
  const [tickets, setTickets] = useState(0)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)

  useEffect(() => {
    const savedWorkoutSpot = localStorage.getItem("gymonad_workout_spot")
    const savedLastSpotChange = localStorage.getItem("gymonad_last_spot_change")
    const savedCheckedIn = localStorage.getItem("gymonad_checked_in_today")
    const savedLastCheckIn = localStorage.getItem("gymonad_last_checkin")
    const savedTickets = localStorage.getItem("gymonad_tickets")
    const savedWallet = localStorage.getItem("gymonad_connected_wallet")

    if (savedWorkoutSpot) setWorkoutSpot(JSON.parse(savedWorkoutSpot))
    if (savedLastSpotChange) setLastSpotChange(savedLastSpotChange)
    if (savedCheckedIn) setCheckedIn(savedCheckedIn === "true")
    if (savedLastCheckIn) setLastCheckIn(savedLastCheckIn)
    if (savedTickets) setTickets(Number.parseInt(savedTickets))
    if (savedWallet) setConnectedWallet(savedWallet)
  }, [])

  useEffect(() => {
    if (workoutSpot) {
      localStorage.setItem("gymonad_workout_spot", JSON.stringify(workoutSpot))
    }
  }, [workoutSpot])

  useEffect(() => {
    if (lastSpotChange) {
      localStorage.setItem("gymonad_last_spot_change", lastSpotChange)
    }
  }, [lastSpotChange])

  useEffect(() => {
    localStorage.setItem("gymonad_checked_in_today", checkedIn.toString())
  }, [checkedIn])

  useEffect(() => {
    if (lastCheckIn) {
      localStorage.setItem("gymonad_last_checkin", lastCheckIn)
    }
  }, [lastCheckIn])

  useEffect(() => {
    localStorage.setItem("gymonad_tickets", tickets.toString())
  }, [tickets])

  const playSwordClash = () => {
    const audio = new Audio("/gymonad-assetshttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/swordsclashing1sec-Gu3scJA0wJCm9za9kdnHLXcJdMvdkp.mp3")
    audio.volume = 0.5
    audio.play().catch(() => {})
  }

  const playGuitarMilestone = () => {
    const audio = new Audio("/gymonad-assetshttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/guitarmp3-5NQgvR22O7TRWetiCDZvCln2LFfg6h.mp3")
    audio.volume = 0.6
    audio.play().catch(() => {})
  }

  const setWorkoutSpotLocation = async () => {
    setLocationLoading(true)
    setLocationError(null)

    try {
      const location = await getCurrentLocation()
      setUserLocation(location)
      setSettingSpot(true)
      setLocationLoading(false)
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "Failed to get location")
      setLocationLoading(false)
    }
  }

  const confirmWorkoutSpot = (name: string) => {
    if (userLocation) {
      const newSpot = { ...userLocation, name }
      setWorkoutSpot(newSpot)
      setLastSpotChange(new Date().toISOString())
      setSettingSpot(false)
      setUserLocation(null)
      playSwordClash()
    }
  }

  const getLocationForCheckIn = async () => {
    setLocationLoading(true)
    setLocationError(null)

    try {
      const location = await getCurrentLocation()
      setUserLocation(location)
      setLocationLoading(false)
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "Failed to get location")
      setLocationLoading(false)
    }
  }

  const handleWorkoutCheckIn = async () => {
    if (!workoutSpot || !userLocation) return

    const distance = calculateDistance(userLocation, workoutSpot)
    if (distance > 100) return

    setCheckingIn(true)

    try {
      const supabase = createClient()
      const checkInData = {
        location: userLocation,
        spot_name: workoutSpot.name,
        wallet_address: connectedWallet,
        distance_meters: Math.round(distance),
        verified: true,
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("checkins").insert([checkInData])

      if (error) {
        console.log("Database check-in failed, using local storage:", error.message)
      }

      setCheckedIn(true)
      setLastCheckIn(new Date().toLocaleString())
      setTickets((prev) => prev + 1)
      setUserLocation(null)
      playGuitarMilestone()
    } catch (error) {
      console.error("Check-in error:", error)
      setCheckedIn(true)
      setLastCheckIn(new Date().toLocaleString())
      setTickets((prev) => prev + 1)
      setUserLocation(null)
      playGuitarMilestone()
    } finally {
      setCheckingIn(false)
    }
  }

  const canChangeSpot = () => {
    if (!lastSpotChange) return true
    const lastChange = new Date(lastSpotChange)
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return lastChange <= monthAgo
  }

  const getNextChangeDate = () => {
    if (!lastSpotChange) return null
    const lastChange = new Date(lastSpotChange)
    const nextChange = new Date(lastChange.getTime() + 30 * 24 * 60 * 60 * 1000)
    return nextChange
  }

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 font-serif text-yellow-500">Workout Spot</h1>
          <p className="text-purple-300">Set and check in at your designated workout location</p>
        </div>

        <div className="grid gap-6 max-w-md mx-auto px-4 w-full">
          {/* Current Workout Spot */}
          <Card className="bg-purple-100 border-purple-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
                <MapPin className="h-6 w-6 text-purple-600" />
                Your Workout Spot
              </CardTitle>
              <CardDescription className="text-purple-700">
                Designated location for earning check-in tickets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!workoutSpot ? (
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 border-2 border-dashed border-purple-400 rounded-full mx-auto flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-purple-700 font-medium mb-2">No workout spot set</p>
                    <p className="text-sm text-purple-600">
                      Choose your designated workout location to start earning tickets
                    </p>
                  </div>
                  <Button
                    onClick={setWorkoutSpotLocation}
                    disabled={locationLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        Set Workout Spot
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="h-12 w-12 bg-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-purple-900 text-lg">{workoutSpot.name}</h3>
                    <p className="text-sm text-purple-600">Your designated workout spot</p>
                    {lastSpotChange && (
                      <p className="text-xs text-purple-500 mt-2">
                        Set on: {new Date(lastSpotChange).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-purple-200 pt-4">
                    <Button
                      onClick={setWorkoutSpotLocation}
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-400 text-purple-700 bg-transparent"
                      disabled={!canChangeSpot() || locationLoading}
                    >
                      {locationLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Getting Location...
                        </>
                      ) : canChangeSpot() ? (
                        "Change Workout Spot"
                      ) : (
                        `Next change: ${getNextChangeDate()?.toLocaleDateString()}`
                      )}
                    </Button>
                    {!canChangeSpot() && (
                      <p className="text-xs text-purple-600 text-center mt-2">
                        Workout spots can only be changed once per month
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Check-in Section */}
          {workoutSpot && (
            <Card className="bg-green-100 border-green-300 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-green-900">
                  <Calendar className="h-6 w-6 text-green-600" />
                  Daily Check-in
                </CardTitle>
                <CardDescription className="text-green-700">
                  Check in within 100m of your workout spot • Earn 1 ticket
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {checkedIn ? (
                  <div className="text-center space-y-3">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                    <Badge variant="default" className="bg-green-500 text-white text-lg px-4 py-2">
                      ✓ Checked in today!
                    </Badge>
                    {lastCheckIn && <p className="text-sm text-green-700">Last check-in: {lastCheckIn}</p>}
                    <p className="text-sm text-green-600">at {workoutSpot.name}</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        🎫 You earned 1 ticket! Come back tomorrow for another check-in.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!userLocation ? (
                      <Button
                        onClick={getLocationForCheckIn}
                        disabled={locationLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {locationLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Getting Location...
                          </>
                        ) : (
                          <>
                            <Navigation className="h-4 w-4 mr-2" />
                            Get Location to Check In
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                          <p className="text-sm text-green-800 font-medium">
                            Distance: {Math.round(calculateDistance(userLocation, workoutSpot))}m away
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {calculateDistance(userLocation, workoutSpot) <= 100
                              ? "✓ Within check-in range"
                              : "❌ Too far from workout spot"}
                          </p>
                        </div>
                        <Button
                          onClick={handleWorkoutCheckIn}
                          disabled={checkingIn || calculateDistance(userLocation, workoutSpot) > 100}
                          className={`w-full ${
                            calculateDistance(userLocation, workoutSpot) <= 100
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-400 cursor-not-allowed"
                          } text-white`}
                        >
                          {checkingIn ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Checking In...
                            </>
                          ) : calculateDistance(userLocation, workoutSpot) <= 100 ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Check In Now
                            </>
                          ) : (
                            "Too Far Away (100m max)"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Set Workout Spot Name */}
          {settingSpot && userLocation && (
            <Card className="bg-yellow-100 border-yellow-300 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-yellow-900">Name Your Workout Spot</CardTitle>
                <CardDescription className="text-yellow-700">
                  Give your workout location a memorable name
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="e.g., Home Gym, Local Park, Fitness Center..."
                    className="w-full p-3 border border-yellow-300 rounded-lg text-sm"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        confirmWorkoutSpot((e.target as HTMLInputElement).value)
                      }
                    }}
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="Home Gym"]') as HTMLInputElement
                        confirmWorkoutSpot(input?.value || "My Workout Spot")
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Spot
                    </Button>
                    <Button
                      onClick={() => setSettingSpot(false)}
                      variant="outline"
                      className="flex-1 border-yellow-400 text-yellow-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tickets Earned */}
          <Card className="bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-400 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-amber-900">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                  T
                </div>
                Check-in Tickets
              </CardTitle>
              <CardDescription className="text-amber-700">Earn lottery entries through daily check-ins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-900 mb-2">{tickets}</div>
                <div className="text-amber-700">Total Tickets</div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-center text-sm text-amber-800">
                  <p className="font-medium">Daily Check-in Rewards:</p>
                  <p>• 1 ticket per successful check-in</p>
                  <p>• Must be within 100m of workout spot</p>
                  <p>• One check-in per day maximum</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Error */}
          {locationError && (
            <Card className="bg-red-100 border-red-300 shadow-lg">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-red-600 font-medium">Location Error</p>
                  <p className="text-sm text-red-700 mt-1">{locationError}</p>
                  <Button
                    onClick={() => setLocationError(null)}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-red-400 text-red-700"
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
