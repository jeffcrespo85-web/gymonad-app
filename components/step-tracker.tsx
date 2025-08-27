'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  getStoredStepData, 
  generateMockStepData, 
  calculateStepGoal, 
  formatStepCount, 
  formatDistance,
  getDeviceStepData,
  storeStepData,
  type StepData 
} from '@/lib/steps'
import { Activity, Target, Zap, MapPin, RefreshCw } from 'lucide-react'

export function StepTracker() {
  const [stepData, setStepData] = useState<StepData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadStepData()
  }, [])

  const loadStepData = async () => {
    setIsLoading(true)
    try {
      // Try to get real device data first
      const deviceSteps = await getDeviceStepData()
      
      let data = getStoredStepData()
      
      // If we got device data, update today's entry
      if (deviceSteps !== null && data.length > 0) {
        const today = new Date().toISOString().split('T')[0]
        const todayIndex = data.findIndex(d => d.date === today)
        
        if (todayIndex >= 0) {
          data[todayIndex] = {
            ...data[todayIndex],
            steps: deviceSteps,
            calories: Math.floor(deviceSteps * 0.04),
            distance: Math.floor(deviceSteps * 0.762)
          }
        }
      }
      
      setStepData(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading step data:', error)
      // Fallback to mock data
      const mockData = generateMockStepData()
      setStepData(mockData)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshStepData = async () => {
    await loadStepData()
  }

  const todayData = stepData.find(d => d.date === new Date().toISOString().split('T')[0])
  const currentSteps = todayData?.steps || 0
  const stepGoal = calculateStepGoal(currentSteps)
  
  const weeklyTotal = stepData.reduce((sum, day) => sum + day.steps, 0)
  const weeklyAverage = Math.floor(weeklyTotal / stepData.length)

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            Loading Step Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Today's Steps */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            Today's Steps
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshStepData}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {formatStepCount(currentSteps)}
              </div>
              <div className="text-sm text-muted-foreground">
                of {formatStepCount(stepGoal.target)} goal
              </div>
            </div>
            <div className="text-right">
              <Badge variant={stepGoal.percentage >= 100 ? "default" : "secondary"}>
                {stepGoal.percentage}%
              </Badge>
            </div>
          </div>
          
          <Progress value={stepGoal.percentage} className="h-3" />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                Calories
              </div>
              <div className="font-semibold">{todayData?.calories || 0}</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Distance
              </div>
              <div className="font-semibold">
                {formatDistance(todayData?.distance || 0)}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                Goal
              </div>
              <div className="font-semibold">
                {stepGoal.percentage >= 100 ? '✅' : '🎯'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatStepCount(weeklyTotal)}
                </div>
                <div className="text-sm text-muted-foreground">Total Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatStepCount(weeklyAverage)}
                </div>
                <div className="text-sm text-muted-foreground">Daily Average</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {stepData.map((day, index) => {
                const dayGoal = calculateStepGoal(day.steps)
                const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
                const isToday = day.date === new Date().toISOString().split('T')[0]
                
                return (
                  <div key={day.date} className="flex items-center gap-3">
                    <div className={`w-12 text-sm ${isToday ? 'font-bold text-purple-600' : 'text-muted-foreground'}`}>
                      {dayName}
                    </div>
                    <div className="flex-1">
                      <Progress value={dayGoal.percentage} className="h-2" />
                    </div>
                    <div className="w-16 text-sm text-right">
                      {formatStepCount(day.steps)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  )
}