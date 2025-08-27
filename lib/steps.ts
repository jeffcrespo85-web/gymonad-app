// Step tracking utilities
export interface StepData {
  steps: number
  date: string
  calories?: number
  distance?: number // in meters
}

export interface DailyStepGoal {
  target: number
  achieved: number
  percentage: number
}

// Mock step data for demonstration (in a real app, this would come from device sensors or fitness APIs)
export function generateMockStepData(): StepData[] {
  const today = new Date()
  const data: StepData[] = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const steps = Math.floor(Math.random() * 8000) + 2000 // 2000-10000 steps
    const calories = Math.floor(steps * 0.04) // Rough calculation
    const distance = Math.floor(steps * 0.762) // Average step length in meters
    
    data.push({
      steps,
      date: date.toISOString().split('T')[0],
      calories,
      distance
    })
  }
  
  return data
}

// Calculate daily step goal progress
export function calculateStepGoal(currentSteps: number, targetSteps: number = 10000): DailyStepGoal {
  const percentage = Math.min((currentSteps / targetSteps) * 100, 100)
  
  return {
    target: targetSteps,
    achieved: currentSteps,
    percentage: Math.round(percentage)
  }
}

// Format step count for display
export function formatStepCount(steps: number): string {
  if (steps >= 1000) {
    return `${(steps / 1000).toFixed(1)}k`
  }
  return steps.toString()
}

// Format distance for display
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${meters} m`
}

// Get step data from device (Web API - limited browser support)
export async function getDeviceStepData(): Promise<number | null> {
  try {
    // Check if the device supports step counting
    if ('permissions' in navigator && 'query' in navigator.permissions) {
      const permission = await navigator.permissions.query({ name: 'accelerometer' as PermissionName })
      
      if (permission.state === 'granted') {
        // In a real implementation, you would use device sensors or fitness APIs
        // For now, we'll return mock data
        return Math.floor(Math.random() * 8000) + 2000
      }
    }
    
    return null
  } catch (error) {
    console.warn('Step tracking not supported on this device:', error)
    return null
  }
}

// Store step data locally
export function storeStepData(stepData: StepData[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gymonad_step_data', JSON.stringify(stepData))
  }
}

// Retrieve stored step data
export function getStoredStepData(): StepData[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('gymonad_step_data')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.warn('Error parsing stored step data:', error)
      }
    }
  }
  
  return generateMockStepData()
}