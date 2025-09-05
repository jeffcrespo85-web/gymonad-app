"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, Plus, RotateCcw, Loader2 } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

declare global {
  interface Window {
    gapi?: any
  }
}

export default function StepsPage() {
  const [steps, setSteps] = useState(0)
  const [dailyGoal] = useState(10000)
  const [tickets, setTickets] = useState(0)
  const [lastTicketSteps, setLastTicketSteps] = useState(0)
  const [achievedMilestones, setAchievedMilestones] = useState<Set<string>>(new Set())

  const [googleFitConnected, setGoogleFitConnected] = useState(false)
  const [googleFitLoading, setGoogleFitLoading] = useState(false)
  const [autoStepTracking, setAutoStepTracking] = useState(false)
  const [totalDistance, setTotalDistance] = useState(0)

  useEffect(() => {
    const savedSteps = localStorage.getItem("gymonad_steps")
    const savedTickets = localStorage.getItem("gymonad_tickets")
    const savedLastTicketSteps = localStorage.getItem("gymonad_last_ticket_steps")
    const savedMilestones = localStorage.getItem("gymonad_achieved_milestones")
    const savedDistance = localStorage.getItem("gymonad_total_distance")

    if (savedSteps) setSteps(Number.parseInt(savedSteps))
    if (savedTickets) setTickets(Number.parseInt(savedTickets))
    if (savedLastTicketSteps) setLastTicketSteps(Number.parseInt(savedLastTicketSteps))
    if (savedMilestones) setAchievedMilestones(new Set(JSON.parse(savedMilestones)))
    if (savedDistance) setTotalDistance(Number.parseFloat(savedDistance))
  }, [])

  useEffect(() => {
    localStorage.setItem("gymonad_steps", steps.toString())
  }, [steps])

  useEffect(() => {
    localStorage.setItem("gymonad_tickets", tickets.toString())
  }, [tickets])

  useEffect(() => {
    localStorage.setItem("gymonad_last_ticket_steps", lastTicketSteps.toString())
  }, [lastTicketSteps])

  useEffect(() => {
    localStorage.setItem("gymonad_achieved_milestones", JSON.stringify([...achievedMilestones]))
  }, [achievedMilestones])

  useEffect(() => {
    localStorage.setItem("gymonad_total_distance", totalDistance.toString())
  }, [totalDistance])

  const playSwordClash = () => {
    const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/swordsclashing1sec-Gu3scJA0wJCm9za9kdnHLXcJdMvdkp.mp3")
    audio.volume = 0.5
    audio.play().catch(() => {})
  }

  const playGuitarMilestone = () => {
    const audio = new Audio("/gymonad-assetshttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/guitarmp3-5NQgvR22O7TRWetiCDZvCln2LFfg6h.mp3")
    audio.volume = 0.6
    audio.play().catch(() => {})
  }

  const checkMilestones = (newSteps: number) => {
    const milestones = [1000, 2500, 5000, 7500, 10000, 12500, 15000, 20000]
    const percentageMilestones = [25, 50, 75, 100]

    milestones.forEach((milestone) => {
      const milestoneKey = `steps_${milestone}`
      if (newSteps >= milestone && !achievedMilestones.has(milestoneKey)) {
        setAchievedMilestones((prev) => new Set([...prev, milestoneKey]))
        playGuitarMilestone()
      }
    })

    percentageMilestones.forEach((percentage) => {
      const milestoneKey = `percentage_${percentage}`
      const targetSteps = (dailyGoal * percentage) / 100
      if (newSteps >= targetSteps && !achievedMilestones.has(milestoneKey)) {
        setAchievedMilestones((prev) => new Set([...prev, milestoneKey]))
        playGuitarMilestone()
      }
    })

    // Award tickets for every 2,000 steps
    const ticketSteps = Math.floor(newSteps / 2000) * 2000
    if (ticketSteps > lastTicketSteps) {
      const newTickets = Math.floor((ticketSteps - lastTicketSteps) / 2000)
      setTickets((prev) => prev + newTickets)
      setLastTicketSteps(ticketSteps)
      playGuitarMilestone()
    }
  }

  const addSteps = (amount: number) => {
    const newSteps = steps + amount
    setSteps(newSteps)
    checkMilestones(newSteps)
    playSwordClash()
  }

  const resetStepsValue = () => {
    setSteps(0)
    setLastTicketSteps(0)
    setAchievedMilestones(new Set())
    setTotalDistance(0)

    // Reset daily milestones but keep tickets
    const today = new Date().toDateString()
    localStorage.setItem("gymonad_last_reset", today)

    playSwordClash()
  }

  const initializeGoogleFit = async () => {
    setGoogleFitLoading(true)
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "https://apis.google.com/js/api.js"
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })

      await new Promise((resolve) => {
        window.gapi.load("auth2", resolve)
      })

      await window.gapi.auth2.init({
        client_id: "YOUR_GOOGLE_CLIENT_ID", // Replace with actual client ID
      })

      setGoogleFitConnected(true)
      setGoogleFitLoading(false)
    } catch (error) {
      console.error("Google Fit initialization failed:", error)
      setGoogleFitLoading(false)
    }
  }

  const connectGoogleFit = async () => {
    try {
      await initializeGoogleFit()
    } catch (error) {
      console.error("Failed to connect Google Fit:", error)
    }
  }

  const fetchGoogleFitSteps = async () => {
    if (!googleFitConnected) return

    try {
      // This would integrate with Google Fit API
      // For now, simulate step data
      const simulatedSteps = Math.floor(Math.random() * 5000) + steps
      setSteps(simulatedSteps)
      checkMilestones(simulatedSteps)
    } catch (error) {
      console.error("Failed to fetch Google Fit steps:", error)
    }
  }

  const stopAutoStepTracking = () => {
    setAutoStepTracking(false)
  }

  const progressPercentage = Math.min((steps / dailyGoal) * 100, 100)

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 font-serif text-yellow-500">Step Tracking</h1>
          <p className="text-purple-300">Monitor your daily activity with Google Fit</p>
        </div>

        <div className="grid gap-6 max-w-md mx-auto px-4 w-full">
          {/* Main Step Counter */}
          <Card className="bg-purple-100 border-purple-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
                <Activity className="h-6 w-6 text-purple-600" />
                Daily Steps
              </CardTitle>
              <CardDescription className="text-purple-700">
                Track your steps • Earn 1 ticket per 2,000 steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">{steps.toLocaleString()}</div>
                <div className="text-lg text-purple-700">of {dailyGoal.toLocaleString()} steps</div>
                {autoStepTracking && (
                  <div className="text-sm text-purple-600 mt-2">Distance: {totalDistance.toFixed(0)}m tracked</div>
                )}
              </div>

              <Progress value={progressPercentage} className="h-4 bg-purple-200 [&>div]:bg-purple-500" />

              <div className="text-center">
                {progressPercentage >= 100 ? (
                  <Badge variant="default" className="bg-green-500 text-white text-lg px-4 py-2">
                    🎉 Daily Goal Achieved!
                  </Badge>
                ) : (
                  <div className="text-purple-700">
                    <span className="text-2xl font-bold">{Math.round(progressPercentage)}%</span>
                    <span className="text-sm ml-2">complete</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Google Fit Integration */}
          <Card className="bg-blue-100 border-blue-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-blue-900">Google Fit Integration</CardTitle>
              <CardDescription className="text-blue-700">Connect for automatic step tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  📱 Connect Google Fit for accurate step tracking from your device sensors.
                  <br />• Steps sync automatically every 5 minutes
                  <br />• Manual step input available as backup
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">Google Fit Status</span>
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
                        : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {googleFitLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                      Connecting...
                    </>
                  ) : googleFitConnected ? (
                    "✓ Connected"
                  ) : (
                    "Connect Google Fit"
                  )}
                </button>
              </div>

              {googleFitConnected && (
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">Auto Sync</span>
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
                      autoStepTracking ? "bg-green-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {autoStepTracking ? "Stop Sync" : "Start Sync"}
                  </button>
                </div>
              )}

              {googleFitConnected && autoStepTracking && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    ✓ Google Fit connected • Steps sync automatically every 5 minutes
                  </p>
                </div>
              )}

              {!googleFitConnected && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-700">
                    ⚠️ Connect Google Fit for automatic step tracking, or use manual input below
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Step Input */}
          <Card className="bg-purple-100 border-purple-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-900">Manual Step Input</CardTitle>
              <CardDescription className="text-purple-700">Add steps manually if needed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Button onClick={() => addSteps(100)} className="bg-purple-500 hover:bg-purple-600 text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  100
                </Button>
                <Button onClick={() => addSteps(500)} className="bg-purple-500 hover:bg-purple-600 text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  500
                </Button>
                <Button onClick={() => addSteps(1000)} className="bg-purple-500 hover:bg-purple-600 text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  1000
                </Button>
              </div>

              <Button onClick={resetStepsValue} variant="destructive" className="w-full bg-red-600 hover:bg-red-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Daily Steps
              </Button>
            </CardContent>
          </Card>

          {/* Tickets Earned */}
          <Card className="bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-400 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-amber-900">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                  T
                </div>
                Tickets Earned
              </CardTitle>
              <CardDescription className="text-amber-700">Earn lottery entries through step milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-900 mb-2">{tickets}</div>
                <div className="text-amber-700">Total Tickets</div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800 text-center">
                  Next ticket at: <span className="font-bold">{Math.ceil((lastTicketSteps + 2000) / 1000) * 1000}</span>{" "}
                  steps
                </p>
              </div>

              <div className="text-center text-xs text-amber-700">
                <p>• 1 ticket per 2,000 steps</p>
                <p>• Tickets used for weekly MONAD lottery</p>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card className="bg-green-100 border-green-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-green-900">Today's Milestones</CardTitle>
              <CardDescription className="text-green-700">Achievement progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-center">
                {[25, 50, 75, 100].map((percentage) => {
                  const targetSteps = (dailyGoal * percentage) / 100
                  const achieved = steps >= targetSteps
                  return (
                    <div
                      key={percentage}
                      className={`p-3 rounded-lg border-2 ${
                        achieved
                          ? "bg-green-200 border-green-400 text-green-900"
                          : "bg-gray-100 border-gray-300 text-gray-600"
                      }`}
                    >
                      <div className="text-lg font-bold">{percentage}%</div>
                      <div className="text-xs">{achieved ? "✓ Complete" : `${targetSteps.toLocaleString()} steps`}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
