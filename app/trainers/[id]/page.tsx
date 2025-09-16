"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageLayout } from "@/components/page-layout"
import { TrainerService, type TrainerProfile } from "@/lib/trainer-system"
import { Star, Users, Calendar, Award, Heart, MessageCircle, Play } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function TrainerProfilePage() {
  const params = useParams()
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    if (params.id) {
      const trainerData = TrainerService.getTrainerById(params.id as string)
      setTrainer(trainerData || null)
    }
  }, [params.id])

  const handleFollow = () => {
    if (trainer && TrainerService.followTrainer(trainer.id)) {
      setIsFollowing(true)
      setTrainer((prev) => (prev ? { ...prev, followers: prev.followers } : null))
    }
  }

  if (!trainer) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Trainer not found</h1>
          <Link href="/trainers">
            <Button className="mt-4 bg-primary hover:bg-primary/90">Back to Trainers</Button>
          </Link>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <Avatar className="w-32 h-32">
              <AvatarImage src={trainer.profileImage || "/placeholder.svg"} alt={trainer.name} />
              <AvatarFallback className="text-2xl">
                {trainer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {trainer.isLive && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold text-primary mb-2 font-serif">{trainer.name}</h1>

          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-medium">{trainer.rating}</span>
              <span className="text-muted-foreground">({trainer.totalSessions} sessions)</span>
            </div>
            <div className="flex items-center gap-1 text-secondary">
              <Users className="w-5 h-5" />
              <span className="font-medium">{trainer.followers} followers</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            {trainer.isLive ? (
              <Link href={`/stream/${trainer.streamUrl}`}>
                <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white">
                  <Play className="w-5 h-5 mr-2" />
                  Join Live Session
                </Button>
              </Link>
            ) : (
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Calendar className="w-5 h-5 mr-2" />
                Book Session
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={handleFollow}
              disabled={isFollowing}
              className="border-secondary text-secondary hover:bg-secondary hover:text-white bg-transparent"
            >
              <Heart className="w-5 h-5 mr-2" />
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button variant="outline" size="lg">
              <MessageCircle className="w-5 h-5 mr-2" />
              Message
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{trainer.bio}</p>
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trainer.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-sm py-1 px-3">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Award className="w-5 h-5 text-accent" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trainer.certifications.map((cert) => (
                    <div key={cert} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      <span className="text-muted-foreground">{cert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium text-card-foreground">{trainer.experience} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hourly Rate</span>
                  <span className="font-medium text-primary">${trainer.hourlyRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sessions</span>
                  <span className="font-medium text-card-foreground">{trainer.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">$GYM Earned</span>
                  <span className="font-medium text-accent">{trainer.totalTipsReceived}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Session
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-secondary text-secondary hover:bg-secondary hover:text-white bg-transparent"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Link href="/trainers" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    Back to Trainers
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
