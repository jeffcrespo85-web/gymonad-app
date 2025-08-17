"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function StreakCounter() {
  const [currentStreak, setCurrentStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null)

  useEffect(() => {
    // Load streak data from localStorage
    const savedStreak = localStorage.getItem("gymonad-current-streak")
    const savedLongest = localStorage.getItem("gymonad-longest-streak")
    const savedLastWorkout = localStorage.getItem("gymonad-last-workout")

    if (savedStreak) setCurrentStreak(Number.parseInt(savedStreak))
    if (savedLongest) setLongestStreak(Number.parseInt(savedLongest))
    if (savedLastWorkout) setLastWorkoutDate(savedLastWorkout)

    // Check if streak should be reset (more than 24 hours since last workout)
    if (savedLastWorkout) {
      const lastWorkout = new Date(savedLastWorkout)
      const now = new Date()
      const hoursDiff = (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60)

      if (hoursDiff > 48) {
        // Reset if more than 48 hours
        setCurrentStreak(0)
        localStorage.setItem("gymonad-current-streak", "0")
      }
    }

    // Listen for workout events
    const handleWorkoutCompleted = () => {
      const today = new Date().toDateString()
      const lastWorkout = lastWorkoutDate ? new Date(lastWorkoutDate).toDateString() : null

      if (lastWorkout !== today) {
        const newStreak = currentStreak + 1
        setCurrentStreak(newStreak)
        setLastWorkoutDate(new Date().toISOString())

        localStorage.setItem("gymonad-current-streak", newStreak.toString())
        localStorage.setItem("gymonad-last-workout", new Date().toISOString())

        if (newStreak > longestStreak) {
          setLongestStreak(newStreak)
          localStorage.setItem("gymonad-longest-streak", newStreak.toString())
        }
      }
    }

    window.addEventListener("workout-completed", handleWorkoutCompleted)
    return () => window.removeEventListener("workout-completed", handleWorkoutCompleted)
  }, [currentStreak, longestStreak, lastWorkoutDate])

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🏆"
    if (streak >= 14) return "🔥"
    if (streak >= 7) return "💪"
    if (streak >= 3) return "⚡"
    return "🎯"
  }

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "Legendary Streak!"
    if (streak >= 14) return "On Fire!"
    if (streak >= 7) return "Strong Streak!"
    if (streak >= 3) return "Building Momentum!"
    if (streak >= 1) return "Great Start!"
    return "Start Your Journey!"
  }

  const bonusMultiplier = Math.min(1 + currentStreak * 0.1, 3) // Max 3x multiplier

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-gold/10 border-purple-600/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-purple-400 flex items-center gap-2">
          <span className="text-2xl">{getStreakEmoji(currentStreak)}</span>
          Workout Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-600 mb-1">{currentStreak}</div>
          <div className="text-sm text-muted-foreground">{currentStreak === 1 ? "Day" : "Days"}</div>
          <Badge variant="secondary" className="mt-2 bg-purple-600/20 text-purple-300">
            {getStreakMessage(currentStreak)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xl font-bold text-gold">{longestStreak}</div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xl font-bold text-gold">{bonusMultiplier.toFixed(1)}x</div>
            <div className="text-xs text-muted-foreground">Bonus Multiplier</div>
          </div>
        </div>

        {currentStreak > 0 && (
          <div className="text-center">
            <div className="text-xs text-purple-400 mb-2">
              Next milestone:{" "}
              {currentStreak < 3 ? "3 days" : currentStreak < 7 ? "7 days" : currentStreak < 14 ? "14 days" : "30 days"}
            </div>
            <div className="w-full bg-black/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-gold h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(((currentStreak % (currentStreak < 3 ? 3 : currentStreak < 7 ? 7 : currentStreak < 14 ? 14 : 30)) / (currentStreak < 3 ? 3 : currentStreak < 7 ? 7 : currentStreak < 14 ? 14 : 30)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground">Maintain your streak to earn bonus $GYM tokens!</div>
      </CardContent>
    </Card>
  )
}
