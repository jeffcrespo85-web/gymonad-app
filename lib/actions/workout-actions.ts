"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function recordWorkout(formData: FormData) {
  const supabase = createServerClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: "User not authenticated" }
  }

  const workoutType = formData.get("workoutType")?.toString()
  const duration = Number.parseInt(formData.get("duration")?.toString() || "0")
  const intensity = Number.parseInt(formData.get("intensity")?.toString() || "1")
  const calories = Number.parseInt(formData.get("calories")?.toString() || "0")

  if (!workoutType || duration <= 0) {
    return { error: "Invalid workout data" }
  }

  try {
    // Calculate GYM tokens earned (base rate + intensity bonus)
    const baseTokens = duration * 0.1 // 0.1 tokens per minute
    const intensityBonus = intensity * 0.05 // bonus based on intensity
    const tokensEarned = baseTokens + baseTokens * intensityBonus

    // Insert workout record
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        workout_type: workoutType,
        duration_minutes: duration,
        intensity_level: intensity,
        calories_burned: calories,
        gym_tokens_earned: tokensEarned,
      })
      .select()
      .single()

    if (workoutError) {
      return { error: workoutError.message }
    }

    // Update user stats
    const { error: updateError } = await supabase.rpc("update_user_workout_stats", {
      user_id: user.id,
      tokens_earned: tokensEarned,
    })

    if (updateError) {
      console.error("Error updating user stats:", updateError)
    }

    revalidatePath("/")
    return { success: true, tokensEarned, workout }
  } catch (error) {
    console.error("Workout recording error:", error)
    return { error: "Failed to record workout" }
  }
}

export async function getWorkoutHistory(limit = 10) {
  const supabase = createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: "User not authenticated" }
  }

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message }
  }

  return { workouts }
}

export async function getLeaderboard(limit = 10) {
  const supabase = createServerClient()

  const { data: leaderboard, error } = await supabase.from("leaderboard").select("*").limit(limit)

  if (error) {
    return { error: error.message }
  }

  return { leaderboard }
}
