"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, RotateCcw, Loader2, Zap, Target, TrendingUp } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { audioController } from "@/lib/audio-controller"
import { GymTokenSystem } from "@/lib/gym-token-system"

declare global {
  interface Window {
    gapi?: any
    google?: any
  }
}

export default function WorkoutPage() {
  const [steps, setSteps] = useState(0)
  const [dailyGoal] = useState(10000)
  const [lastTicketSteps, setLastTicketSteps] = useState(0)
  const [achievedMilestones, setAchievedMilestones] = useState<Set<string>>(new Set())
  const [totalDistance, setTotalDistance] = useState(0)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [autoStepTracking, setAutoStepTracking] = useState(false)
  const [dailyGoalsRewardClaimed, setDailyGoalsRewardClaimed] = useState(false)
  const [allGoalsCompleted, setAllGoalsCompleted] = useState(false)

  const [tickets, setTickets] = useState(0)
  const [googleFitConnected, setGoogleFitConnected] = useState(false)
  const [googleFitLoading, setGoogleFitLoading] = useState(false)
  const [googleFitConfigError, setGoogleFitConfigError] = useState<string | null>(null)
  const [googleFitConfig, setGoogleFitConfig] = useState<{ hasConfig: boolean; authUrl: string | null }>({
    hasConfig: false,
    authUrl: null,
  })

  const [dailyGoogleFitGoals, setDailyGoogleFitGoals] = useState({
    steps: { target: 10000, achieved: 0, completed: false },
    activeMinutes: { target: 30, achieved: 0, completed: false },
    calories: { target: 2000, achieved: 0, completed: false },
    distance: { target: 8000, achieved: 0, completed: false }, // in meters
  })

  const [weeklyGoogleFitGoals, setWeeklyGoogleFitGoals] = useState({
    steps: { target: 70000, achieved: 0, completed: false }, // weekly target
    activeMinutes: { target: 210, achieved: 0, completed: false }, // weekly target
    calories: { target: 14000, achieved: 0, completed: false }, // weekly target
    distance: { target: 56000, achieved: 0, completed: false }, // weekly target in meters
    heartPoints: { target: 150, achieved: 0, completed: false },
    workouts: { target: 3, achieved: 0, completed: false },
  })

  const [weeklyGoalsCompleted, setWeeklyGoalsCompleted] = useState(false)
  const [weeklyRewardClaimed, setWeeklyRewardClaimed] = useState(false)
  const [achievementStreak, setAchievementStreak] = useState(0)
  const [lastAchievementDate, setLastAchievementDate] = useState<string | null>(null)

  const [gymTokens, setGymTokens] = useState(0)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)

  useEffect(() => {
    const savedSteps = localStorage.getItem("gymonad_steps")
    const savedTickets = localStorage.getItem("gymonad_tickets")
    const savedLastTicketSteps = localStorage.getItem("gymonad_last_ticket_steps")
    const savedMilestones = localStorage.getItem("gymonad_achieved_milestones")
    const savedDistance = localStorage.getItem("gymonad_total_distance")
    const savedDailyGoals = localStorage.getItem("gymonad_google_fit_goals")
    const savedWeeklyGoals = localStorage.getItem("gymonad_workout_goals")
    const savedWeeklyReward = localStorage.getItem("gymonad_weekly_reward")
    const savedStreak = localStorage.getItem("gymonad_achievement_streak")
    const savedLastAchievement = localStorage.getItem("gymonad_last_achievement")
    const savedDailyGoalsReward = localStorage.getItem("gymonad_daily_goals_reward")
    const savedWallet = localStorage.getItem("gymonad_wallet_address")

    const today = new Date().toDateString()
    const savedDate = localStorage.getItem("gymonad_goals_date")
    const currentWeek = getWeekKey()
    const savedWeek = localStorage.getItem("gymonad_goals_week")

    if (savedSteps) setSteps(Number.parseInt(savedSteps))
    if (savedTickets) setTickets(Number.parseInt(savedTickets))
    if (savedLastTicketSteps) setLastTicketSteps(Number.parseInt(savedLastTicketSteps))
    if (savedMilestones) setAchievedMilestones(new Set(JSON.parse(savedMilestones)))
    if (savedDistance) setTotalDistance(Number.parseFloat(savedDistance))
    if (savedStreak) setAchievementStreak(Number.parseInt(savedStreak))
    if (savedLastAchievement) setLastAchievementDate(savedLastAchievement)

    if (savedWallet) {
      setConnectedWallet(savedWallet)
      setGymTokens(GymTokenSystem.getTokenBalance(savedWallet))
    }

    // Reset daily goals if it's a new day
    if (savedDate !== today) {
      setDailyGoogleFitGoals({
        steps: { target: 10000, achieved: 0, completed: false },
        activeMinutes: { target: 30, achieved: 0, completed: false },
        calories: { target: 2000, achieved: 0, completed: false },
        distance: { target: 8000, achieved: 0, completed: false },
      })
      setDailyGoalsRewardClaimed(false)
      localStorage.setItem("gymonad_goals_date", today)
    } else {
      if (savedDailyGoals) setDailyGoogleFitGoals(JSON.parse(savedDailyGoals))
      if (savedDailyGoalsReward) setDailyGoalsRewardClaimed(JSON.parse(savedDailyGoalsReward))
    }

    // Reset weekly goals if it's a new week
    if (savedWeek !== currentWeek) {
      setWeeklyGoogleFitGoals({
        steps: { target: 70000, achieved: 0, completed: false },
        activeMinutes: { target: 210, achieved: 0, completed: false },
        calories: { target: 14000, achieved: 0, completed: false },
        distance: { target: 56000, achieved: 0, completed: false },
        heartPoints: { target: 150, achieved: 0, completed: false },
        workouts: { target: 3, achieved: 0, completed: false },
      })
      setWeeklyRewardClaimed(false)
      localStorage.setItem("gymonad_goals_week", currentWeek)
    } else {
      if (savedWeeklyGoals) setWeeklyGoogleFitGoals(JSON.parse(savedWeeklyGoals))
      if (savedWeeklyReward) setWeeklyRewardClaimed(JSON.parse(savedWeeklyReward))
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
    localStorage.setItem("gymonad_google_fit_goals", JSON.stringify(dailyGoogleFitGoals))
  }, [dailyGoogleFitGoals])

  useEffect(() => {
    localStorage.setItem("gymonad_workout_goals", JSON.stringify(weeklyGoogleFitGoals))
  }, [weeklyGoogleFitGoals])

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
    localStorage.setItem("gymonad_daily_goals_reward", JSON.stringify(dailyGoalsRewardClaimed))
  }, [dailyGoalsRewardClaimed])

  useEffect(() => {
    const dailyCompleted = Object.values(dailyGoogleFitGoals).every((goal) => goal.completed)
    setAllGoalsCompleted(dailyCompleted)

    if (dailyCompleted && !dailyGoalsRewardClaimed) {
      triggerDailyGoalsReward()
    }
  }, [dailyGoogleFitGoals, dailyGoalsRewardClaimed])

  useEffect(() => {
    const weeklyCompleted = Object.values(weeklyGoogleFitGoals).every((goal) => goal.completed)
    setWeeklyGoalsCompleted(weeklyCompleted)

    if (weeklyCompleted && !weeklyRewardClaimed) {
      triggerWeeklyGoalsReward()
    }
  }, [weeklyGoogleFitGoals, weeklyRewardClaimed])

  useEffect(() => {
    fetch("/api/google-fit/config")
      .then((res) => res.json())
      .then((config) => {
        setGoogleFitConfig(config)
        if (!config.hasConfig) {
          setGoogleFitConfigError(
            "Google Fit requires setup. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables for full functionality.",
          )
        }
      })
      .catch(console.error)
  }, [])

  const getWeekKey = () => {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    return startOfWeek.toISOString().split("T")[0]
  }

  const playGuitarMilestone = () => {
    audioController.playAchievementSound()
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

  const connectGoogleFit = async () => {
    setGoogleFitLoading(true)
    setGoogleFitConfigError(null)

    try {
      if (!googleFitConfig.hasConfig) {
        alert(
          `Google Fit Setup Required:\n\n1. Go to Google Cloud Console: https://console.cloud.google.com/\n2. Create or select your project\n3. Enable the Fitness API: https://console.cloud.google.com/apis/library/fitness.googleapis.com\n4. Create credentials:\n   - OAuth 2.0 Client ID (for web application)\n   - API Key (restrict to Fitness API)\n5. Add your environment variables:\n   - GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com\n   - GOOGLE_CLIENT_SECRET=your-client-secret\n\nNote: Remove NEXT_PUBLIC_ prefix from environment variables for security.`,
        )
        setGoogleFitLoading(false)
        return
      }

      if (googleFitConfig.authUrl) {
        // Redirect to Google OAuth
        window.location.href = googleFitConfig.authUrl
      }

      setGoogleFitConnected(true)
      setGoogleFitLoading(false)
    } catch (error: any) {
      console.error("Google Fit initialization failed:", error)
      setGoogleFitLoading(false)
      setGoogleFitConfigError("Google Fit connection failed. Demo mode available below.")
    }
  }

  const fetchGoogleFitSteps = async () => {
    if (!googleFitConnected || !accessToken) return

    try {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

      // Fetch different data types
      const [stepsData, caloriesData, distanceData] = await Promise.all([
        fetch("/api/google-fit/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken,
            dataType: "steps",
            startTime: startOfDay.getTime() * 1000000,
            endTime: endOfDay.getTime() * 1000000,
          }),
        }).then((res) => res.json()),
        fetch("/api/google-fit/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken,
            dataType: "calories",
            startTime: startOfDay.getTime() * 1000000,
            endTime: endOfDay.getTime() * 1000000,
          }),
        }).then((res) => res.json()),
        fetch("/api/google-fit/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken,
            dataType: "distance",
            startTime: startOfDay.getTime() * 1000000,
            endTime: endOfDay.getTime() * 1000000,
          }),
        }).then((res) => res.json()),
      ])

      const totalSteps = stepsData.value || 0
      const totalCalories = caloriesData.value || 0
      const totalDistance = distanceData.value || 0
      const activeMinutes = Math.floor(totalSteps / 100)

      setSteps(totalSteps)

      setDailyGoogleFitGoals((prev) => ({
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
          achieved: totalCalories,
          completed: totalCalories >= prev.calories.target,
        },
        distance: {
          ...prev.distance,
          achieved: totalDistance,
          completed: totalDistance >= prev.distance.target,
        },
      }))

      checkMilestones(totalSteps)
    } catch (error) {
      console.error("Failed to fetch Google Fit data:", error)
      alert("Failed to sync with Google Fit. Please try reconnecting.")
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

      setWeeklyGoogleFitGoals((prev) => ({
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

  const resetAllProgress = () => {
    setSteps(0)
    setLastTicketSteps(0)
    setAchievedMilestones(new Set())
    setTotalDistance(0)
    setDailyGoogleFitGoals({
      steps: { target: 10000, achieved: 0, completed: false },
      activeMinutes: { target: 30, achieved: 0, completed: false },
      calories: { target: 2000, achieved: 0, completed: false },
      distance: { target: 8000, achieved: 0, completed: false },
    })
    setWeeklyGoogleFitGoals({
      steps: { target: 70000, achieved: 0, completed: false },
      activeMinutes: { target: 210, achieved: 0, completed: false },
      calories: { target: 14000, achieved: 0, completed: false },
      distance: { target: 56000, achieved: 0, completed: false },
      heartPoints: { target: 150, achieved: 0, completed: false },
      workouts: { target: 3, achieved: 0, completed: false },
    })
    setDailyGoalsRewardClaimed(false)
    setWeeklyRewardClaimed(false)
    setAchievementStreak(0)
    setLastAchievementDate(null)

    const today = new Date().toDateString()
    const currentWeek = getWeekKey()
    localStorage.setItem("gymonad_last_reset", today)
    localStorage.setItem("gymonad_goals_date", today)
    localStorage.setItem("gymonad_goals_week", currentWeek)
  }

  const progressPercentage = Math.min((steps / dailyGoal) * 100, 100)

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 font-serif text-yellow-500">Fitness Tracking</h1>
          <p className="text-purple-300">Daily steps & weekly achievements with Google Fit</p>
        </div>

        <div className="grid gap-6 max-w-md mx-auto px-4 w-full">
          {/* $GYM Token Balance */}
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
                    <span className="text-xs">Check leaderboard in NFT tab</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Goals Completion Banner */}
          {allGoalsCompleted && (
            <Card className="bg-gradient-to-br from-yellow-200 to-amber-200 border-yellow-500 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-amber-900">
                  <Zap className="h-6 w-6 text-yellow-600" />
                  Daily Goals Completed!
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

          {/* Weekly Goals Completion Banner */}
          {weeklyGoalsCompleted && (
            <Card className="bg-gradient-to-br from-purple-200 to-indigo-200 border-purple-500 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
                  <Zap className="h-6 w-6 text-purple-600" />
                  Weekly Goals Completed!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl mb-2">🏆</div>
                <p className="text-purple-800 font-bold">
                  {weeklyRewardClaimed ? "3 bonus tickets awarded!" : "Claiming bonus tickets..."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Daily Steps Tracking */}
          <Card className="bg-purple-100 border-purple-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
                <Activity className="h-6 w-6 text-purple-600" />
                Daily Steps
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

          {/* Daily Google Fit Goals */}
          <Card className="bg-blue-100 border-blue-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-blue-900">Daily Fitness Goals</CardTitle>
              <CardDescription className="text-blue-700">
                Complete all goals for bonus ticket + thunder reward
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(dailyGoogleFitGoals).map(([key, goal]) => (
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
          <Card className="bg-indigo-100 border-indigo-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-indigo-900">
                <Target className="h-6 w-6 text-indigo-600" />
                Weekly Fitness Goals
              </CardTitle>
              <CardDescription className="text-indigo-700">
                Complete all goals for 3 bonus tickets + thunder reward
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(weeklyGoogleFitGoals).map(([key, goal]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-indigo-900 capitalize">
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
                    <div className="flex justify-between text-sm text-indigo-700">
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
                      className="h-2 bg-indigo-200 [&>div]:bg-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Google Fit Connection */}
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
                      <p className="text-sm text-amber-700">{googleFitConfigError}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  📱 Google Fit provides comprehensive fitness data including steps, active minutes, calories, and
                  distance.
                  <br />• Data syncs securely through server-side API
                  <br />• Complete all daily goals for bonus rewards
                  <br />
                  <br />
                  {!googleFitConfig.hasConfig && (
                    <>
                      <strong>Setup Required:</strong>
                      <br />• Enable Fitness API in Google Cloud Console
                      <br />• Configure OAuth2 Client ID and Client Secret
                      <br />• Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables
                    </>
                  )}
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
                        setAutoStepTracking(false)
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
                Tickets Earned
              </CardTitle>
              <CardDescription className="text-amber-700">
                Step milestones + daily & weekly goal completion
              </CardDescription>
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
                  <br />
                  <span className="text-xs">+ 3 bonus tickets for completing all weekly goals</span>
                  <br />
                  <span className="text-xs">+ Tickets used for community rewards</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <Card className="bg-red-100 border-red-300 shadow-lg">
            <CardContent className="pt-6">
              <Button onClick={resetAllProgress} variant="destructive" className="w-full bg-red-600 hover:bg-red-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All Progress
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
