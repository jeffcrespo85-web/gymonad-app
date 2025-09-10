"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Activity, RotateCcw, Loader2, Zap, Target, TrendingUp } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { audioController } from "@/lib/audio-controller"

declare global {
  interface Window {
    gapi?: any
  }
}

export default function WorkoutPage() {
  const [tickets, setTickets] = useState(0)
  const [googleFitConnected, setGoogleFitConnected] = useState(false)
  const [googleFitLoading, setGoogleFitLoading] = useState(false)
  const [googleFitConfigError, setGoogleFitConfigError] = useState<string | null>(null)

  const [googleFitGoals, setGoogleFitGoals] = useState({
    steps: { target: 10000, achieved: 0, completed: false },
    activeMinutes: { target: 30, achieved: 0, completed: false },
    calories: { target: 2000, achieved: 0, completed: false },
    distance: { target: 8000, achieved: 0, completed: false }, // in meters
    heartPoints: { target: 150, achieved: 0, completed: false }, // weekly target
    workouts: { target: 3, achieved: 0, completed: false }, // weekly workouts
  })

  const [weeklyGoalsCompleted, setWeeklyGoalsCompleted] = useState(false)
  const [weeklyRewardClaimed, setWeeklyRewardClaimed] = useState(false)
  const [achievementStreak, setAchievementStreak] = useState(0)
  const [lastAchievementDate, setLastAchievementDate] = useState<string | null>(null)

  useEffect(() => {
    const savedTickets = localStorage.getItem("gymonad_tickets")
    const savedGoals = localStorage.getItem("gymonad_workout_goals")
    const savedWeeklyReward = localStorage.getItem("gymonad_weekly_reward")
    const savedStreak = localStorage.getItem("gymonad_achievement_streak")
    const savedLastAchievement = localStorage.getItem("gymonad_last_achievement")

    const currentWeek = getWeekKey()
    const savedWeek = localStorage.getItem("gymonad_goals_week")

    if (savedTickets) setTickets(Number.parseInt(savedTickets))
    if (savedStreak) setAchievementStreak(Number.parseInt(savedStreak))
    if (savedLastAchievement) setLastAchievementDate(savedLastAchievement)

    // Reset weekly goals if it's a new week
    if (savedWeek !== currentWeek) {
      setGoogleFitGoals({
        steps: { target: 70000, achieved: 0, completed: false }, // weekly target
        activeMinutes: { target: 210, achieved: 0, completed: false }, // weekly target
        calories: { target: 14000, achieved: 0, completed: false }, // weekly target
        distance: { target: 56000, achieved: 0, completed: false }, // weekly target in meters
        heartPoints: { target: 150, achieved: 0, completed: false },
        workouts: { target: 3, achieved: 0, completed: false },
      })
      setWeeklyRewardClaimed(false)
      localStorage.setItem("gymonad_goals_week", currentWeek)
    } else {
      if (savedGoals) setGoogleFitGoals(JSON.parse(savedGoals))
      if (savedWeeklyReward) setWeeklyRewardClaimed(JSON.parse(savedWeeklyReward))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("gymonad_tickets", tickets.toString())
  }, [tickets])

  useEffect(() => {
    localStorage.setItem("gymonad_workout_goals", JSON.stringify(googleFitGoals))
  }, [googleFitGoals])

  useEffect(() => {
    localStorage.setItem("gymonad_weekly_reward", JSON.stringify(weeklyRewardClaimed))
  }, [weeklyRewardClaimed])

  useEffect(() => {
    localStorage.setItem("gymonad_achievement_streak", achievementStreak.toString())
  }, [achievementStreak])

  useEffect(() => {
    if (lastAchievementDate) {
      localStorage.setItem("gymonad_last_achievement", lastAchievementDate)
    }
  }, [lastAchievementDate])

  useEffect(() => {
    const allCompleted = Object.values(googleFitGoals).every((goal) => goal.completed)
    setWeeklyGoalsCompleted(allCompleted)

    if (allCompleted && !weeklyRewardClaimed) {
      triggerWeeklyGoalsReward()
    }
  }, [googleFitGoals, weeklyRewardClaimed])

  const getWeekKey = () => {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    return startOfWeek.toISOString().split("T")[0]
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
        return
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
      setGoogleFitConfigError("Google Fit connection failed. Using demo mode instead.")
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

  const fetchGoogleFitAchievements = async () => {
    try {
      const simulatedWeeklyData = {
        steps: Math.floor(Math.random() * 30000) + 40000,
        activeMinutes: Math.floor(Math.random() * 100) + 150,
        calories: Math.floor(Math.random() * 5000) + 10000,
        distance: Math.floor(Math.random() * 20000) + 35000,
        heartPoints: Math.floor(Math.random() * 50) + 100,
        workouts: Math.floor(Math.random() * 2) + 2,
      }

      setGoogleFitGoals((prev) => ({
        steps: {
          ...prev.steps,
          achieved: simulatedWeeklyData.steps,
          completed: simulatedWeeklyData.steps >= prev.steps.target,
        },
        activeMinutes: {
          ...prev.activeMinutes,
          achieved: simulatedWeeklyData.activeMinutes,
          completed: simulatedWeeklyData.activeMinutes >= prev.activeMinutes.target,
        },
        calories: {
          ...prev.calories,
          achieved: simulatedWeeklyData.calories,
          completed: simulatedWeeklyData.calories >= prev.calories.target,
        },
        distance: {
          ...prev.distance,
          achieved: simulatedWeeklyData.distance,
          completed: simulatedWeeklyData.distance >= prev.distance.target,
        },
        heartPoints: {
          ...prev.heartPoints,
          achieved: simulatedWeeklyData.heartPoints,
          completed: simulatedWeeklyData.heartPoints >= prev.heartPoints.target,
        },
        workouts: {
          ...prev.workouts,
          achieved: simulatedWeeklyData.workouts,
          completed: simulatedWeeklyData.workouts >= prev.workouts.target,
        },
      }))

      // Update achievement streak
      const today = new Date().toDateString()
      if (lastAchievementDate !== today) {
        setAchievementStreak((prev) => prev + 1)
        setLastAchievementDate(today)
      }
    } catch (error) {
      console.error("Failed to fetch Google Fit data:", error)
    }
  }

  const triggerWeeklyGoalsReward = () => {
    if (navigator.vibrate) {
      navigator.vibrate([300, 150, 300, 150, 300])
    }

    const thunderAudio = new Audio("/gymonad-assets/thunder.mp3")
    thunderAudio.volume = 0.8
    thunderAudio.play().catch(console.error)

    // Award bonus tickets for weekly completion
    setTickets((prev) => prev + 3)
    setWeeklyRewardClaimed(true)

    audioController.playAchievementSound()
  }

  const resetWeeklyProgress = () => {
    setGoogleFitGoals({
      steps: { target: 70000, achieved: 0, completed: false },
      activeMinutes: { target: 210, achieved: 0, completed: false },
      calories: { target: 14000, achieved: 0, completed: false },
      distance: { target: 56000, achieved: 0, completed: false },
      heartPoints: { target: 150, achieved: 0, completed: false },
      workouts: { target: 3, achieved: 0, completed: false },
    })
    setWeeklyRewardClaimed(false)
    setAchievementStreak(0)
    setLastAchievementDate(null)

    const currentWeek = getWeekKey()
    localStorage.setItem("gymonad_goals_week", currentWeek)
  }

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 font-serif text-yellow-500">Google Fit Achievements</h1>
          <p className="text-purple-300">Complete weekly fitness goals for bonus tickets</p>
        </div>

        <div className="grid gap-6 max-w-md mx-auto px-4 w-full">
          {/* Weekly Goals Completion Banner */}
          {weeklyGoalsCompleted && (
            <Card className="bg-gradient-to-br from-yellow-200 to-amber-200 border-yellow-500 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-amber-900">
                  <Zap className="h-6 w-6 text-yellow-600" />
                  Weekly Goals Completed!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl mb-2">🏆</div>
                <p className="text-amber-800 font-bold">
                  {weeklyRewardClaimed ? "3 bonus tickets awarded!" : "Claiming bonus tickets..."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Achievement Streak */}
          <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                Achievement Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{achievementStreak}</div>
              <div className="text-purple-700">Days Active</div>
              <div className="text-sm text-purple-600 mt-2">Keep completing goals to maintain your streak!</div>
            </CardContent>
          </Card>

          {/* Weekly Google Fit Goals */}
          <Card className="bg-blue-100 border-blue-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-blue-900">
                <Target className="h-6 w-6 text-blue-600" />
                Weekly Fitness Goals
              </CardTitle>
              <CardDescription className="text-blue-700">
                Complete all goals for 3 bonus tickets + thunder reward
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(googleFitGoals).map(([key, goal]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-blue-900 capitalize">
                      {key === "activeMinutes" ? "Active Minutes" : key === "heartPoints" ? "Heart Points" : key}
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        goal.completed ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {goal.completed ? "✓" : "○"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-blue-700">
                      <span>
                        {goal.achieved.toLocaleString()} / {goal.target.toLocaleString()}
                        {key === "distance"
                          ? "m"
                          : key === "calories"
                            ? " cal"
                            : key === "activeMinutes"
                              ? " min"
                              : key === "heartPoints"
                                ? " pts"
                                : key === "workouts"
                                  ? " sessions"
                                  : ""}
                      </span>
                      <span>{Math.round((goal.achieved / goal.target) * 100)}%</span>
                    </div>
                    <Progress
                      value={Math.min((goal.achieved / goal.target) * 100, 100)}
                      className="h-2 bg-blue-200 [&>div]:bg-blue-500"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Google Fit Connection */}
          <Card className="bg-green-100 border-green-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-green-900">
                <Activity className="h-6 w-6 text-green-600" />
                Google Fit Connection
              </CardTitle>
              <CardDescription className="text-green-700">Required for comprehensive fitness tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {googleFitConfigError && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-amber-600 text-xl">⚠️</div>
                    <div>
                      <h4 className="font-medium text-amber-800 mb-1">Demo Mode Active</h4>
                      <p className="text-sm text-amber-700">{googleFitConfigError}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-green-800 font-medium">Connection Status</span>
                <button
                  onClick={() => {
                    if (googleFitConnected) {
                      setGoogleFitConnected(false)
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Demo Mode:</strong> Try achievement functionality
                </p>
                <button
                  onClick={fetchGoogleFitAchievements}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Simulate Weekly Progress (Demo)
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Earned */}
          <Card className="bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-400 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-amber-900">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                  T
                </div>
                Achievement Tickets
              </CardTitle>
              <CardDescription className="text-amber-700">Weekly goal completion rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-900 mb-2">{tickets}</div>
                <div className="text-amber-700">Total Tickets</div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-center text-sm text-amber-800">
                  <p className="font-medium">Weekly Achievement Rewards:</p>
                  <p>• 3 tickets for completing all weekly goals</p>
                  <p>• Thunder sound + vibration celebration</p>
                  <p>• Streak bonus for consecutive weeks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <Card className="bg-red-100 border-red-300 shadow-lg">
            <CardContent className="pt-6">
              <Button
                onClick={resetWeeklyProgress}
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Weekly Progress
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
