"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageLayout } from "@/components/page-layout"
import { TrainerService, type TrainerProfile } from "@/lib/trainer-system"
import { PaymentSystem, type PaymentTransaction } from "@/lib/payment-system"
import {
  Play,
  Square,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  Eye,
  MessageCircle,
  Star,
  BarChart3,
  Clock,
  Gift,
} from "lucide-react"
import Link from "next/link"

interface StreamSession {
  id: string
  title: string
  status: "scheduled" | "live" | "ended"
  scheduledTime: Date
  duration: number
  viewerCount: number
  totalTips: number
  category: string
}

export default function TrainerDashboard() {
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    tipsReceived: 0,
    sessionsCompleted: 0,
    recentTransactions: [] as PaymentTransaction[],
  })
  const [streamSessions, setStreamSessions] = useState<StreamSession[]>([])

  const trainerId = "trainer-1"

  useEffect(() => {
    const trainerData = TrainerService.getTrainerById(trainerId)
    if (trainerData) {
      setTrainer(trainerData)
      setIsLive(trainerData.isLive)
    }

    const earningsData = PaymentSystem.getTrainerEarnings(trainerId)
    setEarnings(earningsData)

    const mockSessions: StreamSession[] = [
      {
        id: "session-1",
        title: "Morning Strength Training - Full Body Power",
        status: "live",
        scheduledTime: new Date(Date.now() - 15 * 60 * 1000),
        duration: 45,
        viewerCount: 47,
        totalTips: 125,
        category: "Strength",
      },
      {
        id: "session-2",
        title: "Evening Cardio Blast",
        status: "scheduled",
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        duration: 30,
        viewerCount: 0,
        totalTips: 0,
        category: "Cardio",
      },
      {
        id: "session-3",
        title: "Strength Training Basics",
        status: "ended",
        scheduledTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        duration: 60,
        viewerCount: 32,
        totalTips: 89,
        category: "Strength",
      },
    ]
    setStreamSessions(mockSessions)
  }, [])

  const handleGoLive = () => {
    const newSession: StreamSession = {
      id: `session-${Date.now()}`,
      title: "Live Workout Session",
      status: "live",
      scheduledTime: new Date(),
      duration: 30,
      viewerCount: 0,
      totalTips: 0,
      category: "Strength",
    }

    setStreamSessions((prev) => [newSession, ...prev])
    setIsLive(true)
  }

  const handleEndStream = () => {
    setIsLive(false)
    setStreamSessions((prev) =>
      prev.map((session) => (session.status === "live" ? { ...session, status: "ended" } : session)),
    )
  }

  const formatTime = (date: Date) => {
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: StreamSession["status"]) => {
    switch (status) {
      case "live":
        return "bg-red-500 text-white"
      case "scheduled":
        return "bg-blue-500 text-white"
      case "ended":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  if (!trainer) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Trainer not found</h1>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={trainer.profileImage || "/placeholder.svg"} alt={trainer.name} />
              <AvatarFallback className="text-lg">
                {trainer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-primary font-serif">Trainer Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {trainer.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={isLive ? "bg-red-500 text-white" : "bg-gray-500 text-white"}>
              {isLive ? "LIVE" : "OFFLINE"}
            </Badge>
            <Link href={`/trainers/${trainer.id}`}>
              <Button variant="outline" className="bg-transparent">
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{earnings.totalEarnings}</div>
                  <div className="text-sm text-muted-foreground">$GYM Earned</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-secondary">{trainer.followers}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent">{earnings.sessionsCompleted}</div>
                  <div className="text-sm text-muted-foreground">Sessions</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 fill-current text-yellow-500" />
                    {trainer.rating}
                  </div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Play className="w-5 h-5 text-red-500" />
                  {isLive ? "Currently Live" : "Go Live"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLive ? (
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="font-medium text-red-800">You are currently live!</span>
                      </div>
                      <p className="text-sm text-red-700">Your stream is active and viewers can join.</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={handleEndStream} variant="destructive" className="bg-red-500 hover:bg-red-600">
                        <Square className="w-4 h-4 mr-2" />
                        End Stream
                      </Button>
                      <Link href="/stream/stream-1">
                        <Button variant="outline" className="bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          View Stream
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                      <h3 className="text-xl font-semibold text-primary mb-2">Ready to Go Live?</h3>
                      <p className="text-muted-foreground mb-4">
                        Start streaming your workout and connect with your audience
                      </p>
                      <Button
                        onClick={handleGoLive}
                        size="lg"
                        className="bg-red-500 hover:bg-red-600 text-white px-8 py-3"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Go Live Now
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  Stream Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {streamSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-card-foreground">{session.title}</h3>
                          <Badge className={getStatusColor(session.status)}>{session.status.toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(session.scheduledTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {session.viewerCount} viewers
                          </span>
                          <span className="flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            {session.totalTips} $GYM
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.status === "live" && (
                          <Link href={`/stream/${session.id}`}>
                            <Button size="sm" variant="outline" className="bg-transparent">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        )}
                        <Button size="sm" variant="ghost">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Earnings Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{earnings.totalEarnings}</div>
                  <div className="text-sm text-muted-foreground">Total $GYM Earned</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tips Received</span>
                    <span className="font-medium text-card-foreground">{earnings.tipsReceived}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sessions Completed</span>
                    <span className="font-medium text-card-foreground">{earnings.sessionsCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">USD Value</span>
                    <span className="font-medium text-accent">
                      {PaymentSystem.formatUSDAmount(earnings.totalEarnings * 0.1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Session
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Clients
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Settings className="w-4 h-4 mr-2" />
                  Profile Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
