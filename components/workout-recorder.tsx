"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GYM_TOKEN_ABI, GYM_TOKEN_ADDRESS } from "@/lib/gym-token-abi"
import { toast } from "sonner"
import { SoundEffects } from "@/lib/sound-effects"

const WORKOUT_TYPES = ["Cardio", "Strength Training", "Yoga", "Running", "Cycling", "Swimming", "HIIT", "Pilates"]

const INTENSITY_LEVELS = [
  { value: 1, label: "Light", color: "bg-green-100 text-green-800" },
  { value: 2, label: "Moderate", color: "bg-yellow-100 text-yellow-800" },
  { value: 3, label: "Vigorous", color: "bg-orange-100 text-orange-800" },
  { value: 4, label: "High", color: "bg-red-100 text-red-800" },
  { value: 5, label: "Maximum", color: "bg-purple-100 text-purple-800" },
]

export function WorkoutRecorder() {
  const { address, isConnected } = useAccount()
  const [workoutType, setWorkoutType] = useState("")
  const [duration, setDuration] = useState("")
  const [intensity, setIntensity] = useState<number>(1)

  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isSuccess) {
      // Dispatch custom event to notify streak counter
      const workoutEvent = new CustomEvent("workout-completed", {
        detail: { workoutType, duration, intensity },
      })
      window.dispatchEvent(workoutEvent)

      toast.success("Workout recorded! $GYM tokens earned! 🔥", { id: "workout-tx" })
      // Reset form
      setWorkoutType("")
      setDuration("")
      setIntensity(1)
    }
  }, [isSuccess, workoutType, duration, intensity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address || !workoutType || !duration) {
      toast.error("Please fill in all fields")
      return
    }

    const durationMinutes = Number.parseInt(duration)
    if (durationMinutes <= 0 || durationMinutes > 480) {
      toast.error("Duration must be between 1 and 480 minutes")
      return
    }

    try {
      console.log("[v0] Recording workout:", { workoutType, duration: durationMinutes, intensity })

      SoundEffects.playWorkoutRecord()

      writeContract({
        address: GYM_TOKEN_ADDRESS,
        abi: GYM_TOKEN_ABI,
        functionName: "recordWorkout",
        args: [address, workoutType, BigInt(durationMinutes), intensity],
      })

      toast.loading("Recording workout...", { id: "workout-tx" })
    } catch (err) {
      console.error("[v0] Workout recording error:", err)
      toast.error("Failed to record workout")
    }
  }

  const selectedIntensity = INTENSITY_LEVELS.find((level) => level.value === intensity)

  return (
    <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
      <CardHeader>
        <CardTitle className="text-accent">Record Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workout-type">Workout Type</Label>
              <Select value={workoutType} onValueChange={setWorkoutType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  {WORKOUT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="480"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Intensity Level</Label>
            <div className="flex flex-wrap gap-2">
              {INTENSITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => {
                    SoundEffects.playSwordClash(1)
                    setIntensity(level.value)
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    intensity === level.value
                      ? level.color + " ring-2 ring-offset-2 ring-accent"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90"
            disabled={isPending || isConfirming || !workoutType || !duration}
          >
            {isPending || isConfirming ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {isPending ? "Recording..." : "Confirming..."}
              </div>
            ) : (
              "Record Workout & Earn $GYM"
            )}
          </Button>
        </form>

        {selectedIntensity && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Estimated Reward:</strong> {duration ? Math.ceil(Number.parseInt(duration) * intensity * 0.1) : 0}{" "}
              $GYM tokens
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
