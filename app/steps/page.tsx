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
    google?: any
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

  const [accessToken, setAccessToken] = useState<string | null>(null)

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

    try {
      const CLIENT_ID = "1096427001935-your-client-id.apps.googleusercontent.com" // Replace with actual OAuth2 Client ID
      const API_KEY = "AIzaSyAj0jVbmQOEYMMTGRJv6s4VS2FsUxTya9Y"
      const SCOPES = [
        "https://www.googleapis.com/auth/fitness.activity.read",
        "https://www.googleapis.com/auth/fitness.body.read",
        "https://www.googleapis.com/auth/fitness.location.read",
      ]

      await new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "https://accounts.google.com/gsi/client"
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })

      await new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "https://apis.google.com/js/api.js"
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })

      await new Promise((resolve) => {
        window.gapi.load("client", resolve)
      })

      await window.gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest"],
      })

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES.join(" "),
        callback: (response: any) => {
          if (response.access_token) {
            setAccessToken(response.access_token)
            window.gapi.client.setToken({ access_token: response.access_token })
            setGoogleFitConnected(true)
            setGoogleFitLoading(false)
          }
        },
      })

      tokenClient.requestAccessToken()
    } catch (error: any) {
      console.error("Google Fit initialization failed:", error)
      setGoogleFitLoading(false)

      if (error?.error?.code === 403 && error?.error?.message?.includes("Fitness API has not been used")) {
        alert(`Google Fitness API Setup Required:

1. Go to Google Cloud Console: https://console.developers.google.com/
2. Select your project (ID: 1096427001935)
3. Enable the Fitness API: https://console.developers.google.com/apis/api/fitness.googleapis.com/overview?project=1096427001935
4. Create OAuth2 credentials and update the Client ID in the code
5. Wait a few minutes for changes to propagate

Current error: Fitness API is not enabled for your project.`)
      } else {
        alert("Failed to connect to Google Fit. Please check your internet connection and try again.")
      }
    }
  }

  const connectGoogleFit = async () => {
    try {
      await initializeGoogleFit()
    } catch (error) {
      console.error("Failed to connect Google Fit:", error)
      alert("Google Fit connection failed. Please try again.")
    }
  }

  const fetchGoogleFitSteps = async () => {
    if (!googleFitConnected || !accessToken) return

    try {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

      const startTimeNanos = startOfDay.getTime() * 1000000
      const endTimeNanos = endOfDay.getTime() * 1000000

      const stepsResponse = await window.gapi.client.fitness.users.dataSources.dataPointChanges.list({
        userId: "me",
        dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
        startTime: startTimeNanos.toString(),
        endTime: endTimeNanos.toString(),
      })

      const caloriesResponse = await window.gapi.client.fitness.users.dataSources.dataPointChanges.list({
        userId: "me",
        dataSourceId: "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended",
        startTime: startTimeNanos.toString(),
        endTime: endTimeNanos.toString(),
      })

      const distanceResponse = await window.gapi.client.fitness.users.dataSources.dataPointChanges.list({
        userId: "me",
        dataSourceId: "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta",
        startTime: startTimeNanos.toString(),
        endTime: endTimeNanos.toString(),
      })

      const totalSteps =
        stepsResponse.result.insertedDataPoint?.reduce((sum: number, point: any) => {
          return sum + (point.value?.[0]?.intVal || 0)
        }, 0) || 0

      const totalCalories =
        caloriesResponse.result.insertedDataPoint?.reduce((sum: number, point: any) => {
          return sum + (point.value?.[0]?.fpVal || 0)
        }, 0) || 0

      const totalDistance =
        distanceResponse.result.insertedDataPoint?.reduce((sum: number, point: any) => {
          return sum + (point.value?.[0]?.fpVal || 0)
        }, 0) || 0

      const activeMinutes = Math.floor(totalSteps / 100)

      setSteps(totalSteps)

      setGoogleFitGoals((prev) => ({
        steps: {
          ...prev.steps,
          achieved: totalSteps,
          completed: totalSteps >= prev.steps.target,
        },
        activeMinutes: {
          ...prev.activeMinutes,
          achieved: activeMinutes,
          completed: activeMinutes >= prev.activeMinutes.target,
        },
        calories: {
          ...prev.calories,
          achieved: Math.floor(totalCalories),
          completed: totalCalories >= prev.calories.target,
        },
        distance: {
          ...prev.distance,
          achieved: Math.floor(totalDistance),
          completed: totalDistance >= prev.distance.target,
        },
      }))

      checkMilestones(totalSteps)
    } catch (error) {
      console.error("Failed to fetch Google Fit data:", error)
      alert("Failed to sync with Google Fit. Please try reconnecting.")
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
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200])
    }

    const thunderAudio = new Audio("/gymonad-assets/thunder.mp3")
    thunderAudio.volume = 0.7
    thunderAudio.play().catch(console.error)

    setTickets((prev) => prev + 1)
    setDailyGoalsRewardClaimed(true)

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
            </CardContent>
          </Card>

          <Card className="bg-green-100 border-green-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-green-900">Google Fit Connection</CardTitle>
              <CardDescription className="text-green-700">
                Required for step tracking and goal completion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  📱 Google Fit provides comprehensive fitness data including steps, active minutes, calories, and
                  distance.
                  <br />• Data syncs automatically every 5 minutes
                  <br />• Complete all daily goals for bonus rewards
                  <br />
                  <br />
                  <strong>Setup Required:</strong>
                  <br />• Enable Fitness API in Google Cloud Console
                  <br />• Configure OAuth2 Client ID
                  <br />• Project ID: 1096427001935
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-green-800 font-medium">Connection Status</span>
                <button
                  onClick={() => {
                    if (googleFitConnected) {
                      setGoogleFitConnected(false)
                      setAutoStepTracking(false)
                      setAccessToken(null)
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
