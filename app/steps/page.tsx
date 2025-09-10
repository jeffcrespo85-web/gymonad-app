"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, RotateCcw, Loader2, Zap } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { audioController } from "@/lib/audio-controller"
import { GymTokenSystem } from "@/lib/gym-token-system"

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
  const [googleFitConfigError, setGoogleFitConfigError] = useState<string | null>(null)

  const [googleFitGoals, setGoogleFitGoals] = useState({
    steps: { target: 10000, achieved: 0, completed: false },
    activeMinutes: { target: 30, achieved: 0, completed: false },
    calories: { target: 2000, achieved: 0, completed: false },
    distance: { target: 8000, achieved: 0, completed: false }, // in meters
  })
  const [allGoalsCompleted, setAllGoalsCompleted] = useState(false)
  const [dailyGoalsRewardClaimed, setDailyGoalsRewardClaimed] = useState(false)

  const [gymTokens, setGymTokens] = useState(0)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)

  useEffect(() => {
    const savedSteps = localStorage.getItem("gymonad_steps")
    const savedTickets = localStorage.getItem("gymonad_tickets")
    const savedLastTicketSteps = localStorage.getItem("gymonad_last_ticket_steps")
    const savedMilestones = localStorage.getItem("gymonad_achieved_milestones")
    const savedDistance = localStorage.getItem("gymonad_total_distance")
    const savedGoals = localStorage.getItem("gymonad_google_fit_goals")
    const savedGoalsReward = localStorage.getItem("gymonad_daily_goals_reward")
    const savedWallet = localStorage.getItem("gymonad_wallet_address")
    const today = new Date().toDateString()
    const savedDate = localStorage.getItem("gymonad_goals_date")

    if (savedSteps) setSteps(Number.parseInt(savedSteps))
    if (savedTickets) setTickets(Number.parseInt(savedTickets))
    if (savedLastTicketSteps) setLastTicketSteps(Number.parseInt(savedLastTicketSteps))
    if (savedMilestones) setAchievedMilestones(new Set(JSON.parse(savedMilestones)))
    if (savedDistance) setTotalDistance(Number.parseFloat(savedDistance))

    if (savedWallet) {
      setConnectedWallet(savedWallet)
      setGymTokens(GymTokenSystem.getTokenBalance(savedWallet))
    }

    // Reset goals if it's a new day
    if (savedDate !== today) {
      setGoogleFitGoals({
        steps: { target: 10000, achieved: 0, completed: false },
        activeMinutes: { target: 30, achieved: 0, completed: false },
        calories: { target: 2000, achieved: 0, completed: false },
        distance: { target: 8000, achieved: 0, completed: false },
      })
      setDailyGoalsRewardClaimed(false)
      localStorage.setItem("gymonad_goals_date", today)
    } else {
      if (savedGoals) setGoogleFitGoals(JSON.parse(savedGoals))
      if (savedGoalsReward) setDailyGoalsRewardClaimed(JSON.parse(savedGoalsReward))
    }
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

  useEffect(() => {
    localStorage.setItem("gymonad_google_fit_goals", JSON.stringify(googleFitGoals))
  }, [googleFitGoals])

  useEffect(() => {
    localStorage.setItem("gymonad_daily_goals_reward", JSON.stringify(dailyGoalsRewardClaimed))
  }, [dailyGoalsRewardClaimed])

  useEffect(() => {
    const allCompleted = Object.values(googleFitGoals).every((goal) => goal.completed)
    setAllGoalsCompleted(allCompleted)

    if (allCompleted && !dailyGoalsRewardClaimed) {
      triggerDailyGoalsReward()
    }
  }, [googleFitGoals, dailyGoalsRewardClaimed])

  const playGuitarMilestone = () => {
    audioController.playAchievementSound()
  }

  const addSteps = (amount: number) => {
    const newSteps = steps + amount
    setSteps(newSteps)
    checkMilestones(newSteps)
  }

  const resetStepsValue = () => {
    setSteps(0)
    setLastTicketSteps(0)
    setAchievedMilestones(new Set())
    setTotalDistance(0)
    setGoogleFitGoals({
      steps: { target: 10000, achieved: 0, completed: false },
      activeMinutes: { target: 30, achieved: 0, completed: false },
      calories: { target: 2000, achieved: 0, completed: false },
      distance: { target: 8000, achieved: 0, completed: false },
    })
    setDailyGoalsRewardClaimed(false)

    const today = new Date().toDateString()
    localStorage.setItem("gymonad_last_reset", today)
    localStorage.setItem("gymonad_goals_date", today)
  }

  const initializeGoogleFit = async () => {
    setGoogleFitLoading(true)
    setGoogleFitConfigError(null)

    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

      if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
        setGoogleFitConfigError(
          "Google Fit requires setup. Using demo mode for now. Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID for full functionality.",
        )
        setGoogleFitLoading(false)
        return // Exit early to allow demo mode
      }

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
        client_id: clientId,
      })

      setGoogleFitConnected(true)
      setGoogleFitLoading(false)
    } catch (error: any) {
      console.error("Google Fit initialization failed:", error)
      setGoogleFitLoading(false)

      if (error.error === "idpiframe_initialization_failed") {
        setGoogleFitConfigError(
          "Google Fit setup incomplete. Please register your domain in Google Console or use demo mode.",
        )
      } else {
        setGoogleFitConfigError("Google Fit connection failed. Using demo mode instead.")
      }
    }
  }

  const connectGoogleFit = async () => {
    try {
      await initializeGoogleFit()
    } catch (error) {
      console.error("Failed to connect Google Fit:", error)
      setGoogleFitConfigError("Google Fit connection failed. Demo mode available below.")
    }
  }

  const fetchGoogleFitSteps = async () => {
    if (!googleFitConnected) return

    try {
      const simulatedData = {
        steps: Math.floor(Math.random() * 5000) + steps,
        activeMinutes: Math.floor(Math.random() * 45),
        calories: Math.floor(Math.random() * 1500) + 500,
        distance: Math.floor(Math.random() * 6000) + 2000,
      }

      setSteps(simulatedData.steps)

      // Update Google Fit goals
      setGoogleFitGoals((prev) => ({
        steps: {
          ...prev.steps,
          achieved: simulatedData.steps,
          completed: simulatedData.steps >= prev.steps.target,
        },
        activeMinutes: {
          ...prev.activeMinutes,
          achieved: simulatedData.activeMinutes,
          completed: simulatedData.activeMinutes >= prev.activeMinutes.target,
        },
        calories: {
          ...prev.calories,
          achieved: simulatedData.calories,
          completed: simulatedData.calories >= prev.calories.target,
        },
        distance: {
          ...prev.distance,
          achieved: simulatedData.distance,
          completed: simulatedData.distance >= prev.distance.target,
        },
      }))

      checkMilestones(simulatedData.steps)
    } catch (error) {
      console.error("Failed to fetch Google Fit data:", error)
    }
  }

  const stopAutoStepTracking = () => {
    setAutoStepTracking(false)
  }

  const checkMilestones = (newSteps: number) => {
    const milestones = [1000, 2500, 5000, 7500, 10000, 12500, 15000, 20000]
    const percentageMilestones = [25, 50, 75, 100]

    milestones.forEach((milestone) => {
      const milestoneKey = `steps_${milestone}`
      if (newSteps >= milestone && !achievedMilestones.has(milestoneKey)) {
        setAchievedMilestones((prev) => new Set([...prev, milestoneKey]))
        playGuitarMilestone()

        if (connectedWallet) {
          const newBalance = GymTokenSystem.addTokens(connectedWallet, 10)
          setGymTokens(newBalance)
        }
      }
    })

    percentageMilestones.forEach((percentage) => {
      const milestoneKey = `percentage_${percentage}`
      const targetSteps = (dailyGoal * percentage) / 100
      if (newSteps >= targetSteps && !achievedMilestones.has(milestoneKey)) {
        setAchievedMilestones((prev) => new Set([...prev, milestoneKey]))
        playGuitarMilestone()

        if (connectedWallet) {
          const newBalance = GymTokenSystem.addTokens(connectedWallet, 10)
          setGymTokens(newBalance)
        }
      }
    })

    // Award tickets for every 2,000 steps
    const ticketSteps = Math.floor(newSteps / 2000) * 2000
    if (ticketSteps > lastTicketSteps) {
      const newTickets = Math.floor((ticketSteps - lastTicketSteps) / 2000)
      setTickets((prev) => prev + newTickets)
      setLastTicketSteps(ticketSteps)
      playGuitarMilestone()

      if (connectedWallet) {
        const tokensToAward = newTickets * 10
        const newBalance = GymTokenSystem.addTokens(connectedWallet, tokensToAward)
        setGymTokens(newBalance)
      }
    }
  }

  const triggerDailyGoalsReward = () => {
    // Trigger phone vibration
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200])
    }

    // Play thunder sound effect
    const thunderAudio = new Audio("/gymonad-assets/thunder.mp3")
    thunderAudio.volume = 0.7
    thunderAudio.play().catch(console.error)

    // Award bonus ticket
    setTickets((prev) => prev + 1)
    setDailyGoalsRewardClaimed(true)

    // Play achievement sound
    audioController.playAchievementSound()

    if (connectedWallet) {
      const newBalance = GymTokenSystem.addTokens(connectedWallet, 10)
      setGymTokens(newBalance)
    }
  }

  const progressPercentage = Math.min((steps / dailyGoal) * 100, 100)

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 font-serif text-yellow-500">Step Tracking</h1>
          <p className="text-purple-300">Complete all Google Fit goals for bonus rewards</p>
        </div>

        <div className="grid gap-6 max-w-md mx-auto px-4 w-full">
          {connectedWallet && (
            <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-green-400 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-green-900">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    $
                  </div>
                  $GYM Token Balance
                </CardTitle>
                <CardDescription className="text-green-700">Earn 10 $GYM per milestone achieved</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600 mb-2">{gymTokens}</div>
                  <div className="text-lg text-green-700">$GYM Tokens</div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800 text-center">
                    Rank: #{GymTokenSystem.getUserRank(connectedWallet) || "Unranked"}
                    <br />
                    <span className="text-xs">Check leaderboard in Lottery tab</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {allGoalsCompleted && (
            <Card className="bg-gradient-to-br from-yellow-200 to-amber-200 border-yellow-500 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-amber-900">
                  <Zap className="h-6 w-6 text-yellow-600" />
                  All Goals Completed!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl mb-2">🏆</div>
                <p className="text-amber-800 font-bold">
                  {dailyGoalsRewardClaimed ? "Bonus ticket awarded!" : "Claiming bonus ticket..."}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-purple-100 border-purple-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
                <Activity className="h-6 w-6 text-purple-600" />
                Google Fit Steps
              </CardTitle>
              <CardDescription className="text-purple-700">
                Synced from Google Fit • Earn 1 ticket per 2,000 steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">{steps.toLocaleString()}</div>
                <div className="text-lg text-purple-700">of {dailyGoal.toLocaleString()} steps</div>
              </div>

              <Progress value={progressPercentage} className="h-4 bg-purple-200 [&>div]:bg-purple-500" />

              <div className="text-center">
                {progressPercentage >= 100 ? (
                  <Badge variant="default" className="bg-green-500 text-white text-lg px-4 py-2">
                    🎉 Step Goal Achieved!
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

          <Card className="bg-blue-100 border-blue-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-blue-900">Google Fit Daily Goals</CardTitle>
              <CardDescription className="text-blue-700">
                Complete all goals for bonus ticket + thunder reward
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(googleFitGoals).map(([key, goal]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-blue-900 capitalize">
                      {key === "activeMinutes" ? "Active Minutes" : key}
                    </div>
                    <div className="text-sm text-blue-700">
                      {goal.achieved.toLocaleString()} / {goal.target.toLocaleString()}
                      {key === "distance" ? "m" : key === "calories" ? " cal" : key === "activeMinutes" ? " min" : ""}
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      goal.completed ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {goal.completed ? "✓" : "○"}
                  </div>
                </div>
              ))}

              {!googleFitConnected && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-700 text-center">Connect Google Fit to track all daily goals</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Google Fit Integration */}
          <Card className="bg-green-100 border-green-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-green-900">Google Fit Connection</CardTitle>
              <CardDescription className="text-green-700">
                Required for step tracking and goal completion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {googleFitConfigError && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-amber-600 text-xl">⚠️</div>
                    <div>
                      <h4 className="font-medium text-amber-800 mb-1">Demo Mode Active</h4>
                      <p className="text-sm text-amber-700 mb-3">{googleFitConfigError}</p>
                      <div className="text-xs text-amber-600 space-y-1">
                        <p>
                          <strong>To enable full Google Fit integration:</strong>
                        </p>
                        <p>1. Get a Google Client ID from Google Console</p>
                        <p>2. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to environment variables</p>
                        <p>3. Register your domain as authorized origin</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  📱 Google Fit provides comprehensive fitness data including steps, active minutes, calories, and
                  distance.
                  <br />• Data syncs automatically every 5 minutes
                  <br />• Complete all daily goals for bonus rewards
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-green-800 font-medium">Connection Status</span>
                <button
                  onClick={() => {
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
                        : "bg-green-500 text-white hover:bg-green-600"
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

              {!googleFitConnected && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Demo Mode:</strong>{" "}
                    {googleFitConfigError ? "Google Fit not configured" : "Try demo functionality"}
                  </p>
                  <button
                    onClick={fetchGoogleFitSteps}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Simulate Fitness Data (Demo)
                  </button>
                </div>
              )}

              {googleFitConnected && (
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-medium">Auto Sync</span>
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
                      autoStepTracking ? "bg-green-600 text-white" : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {autoStepTracking ? "✓ Syncing" : "Start Sync"}
                  </button>
                </div>
              )}

              {googleFitConnected && autoStepTracking && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    ✓ Google Fit connected • All fitness data syncs automatically
                  </p>
                </div>
              )}
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
              <CardDescription className="text-amber-700">Step milestones + daily goal completion</CardDescription>
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
                  <br />
                  <span className="text-xs">+ 1 bonus ticket for completing all daily goals</span>
                </p>
              </div>

              <div className="text-center text-xs text-amber-700">
                <p>• 1 ticket per 2,000 steps</p>
                <p>• 1 bonus ticket for all Google Fit goals</p>
                <p>• Tickets used for weekly MONAD lottery</p>
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <Card className="bg-red-100 border-red-300 shadow-lg">
            <CardContent className="pt-6">
              <Button onClick={resetStepsValue} variant="destructive" className="w-full bg-red-600 hover:bg-red-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Daily Progress
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
