"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageLayout } from "@/components/page-layout"
import { TrainerService, type TrainerProfile } from "@/lib/trainer-system"
import { Star, Users, Play, Heart, DollarSign } from "lucide-react"
import Link from "next/link"

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<TrainerProfile[]>([])
  const [filter, setFilter] = useState<"all" | "live" | "available">("all")

  useEffect(() => {
    setTrainers(TrainerService.getTrainers())
  }, [])

  const filteredTrainers = trainers.filter((trainer) => {
    if (filter === "live") return trainer.isLive
    if (filter === "available") return !trainer.isLive
    return true
  })

  const handleFollow = (trainerId: string) => {
    if (TrainerService.followTrainer(trainerId)) {
      setTrainers((prev) =>
        prev.map((trainer) => (trainer.id === trainerId ? { ...trainer, followers: trainer.followers } : trainer)),
      )
    }
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4 font-serif">Personal Trainers</h1>
          <p className="text-muted-foreground text-lg">
            Connect with certified trainers and join live workout sessions
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="bg-primary hover:bg-primary/90"
          >
            All Trainers
          </Button>
          <Button
            variant={filter === "live" ? "default" : "outline"}
            onClick={() => setFilter("live")}
            className="bg-secondary hover:bg-secondary/90"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
            Live Now
          </Button>
          <Button variant={filter === "available" ? "default" : "outline"} onClick={() => setFilter("available")}>
            Available
          </Button>
        </div>

        {/* Trainers Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrainers.map((trainer) => (
            <Card key={trainer.id} className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={trainer.profileImage || "/placeholder.svg"} alt={trainer.name} />
                    <AvatarFallback>
                      {trainer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {trainer.isLive && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                  )}
                </div>
                <CardTitle className="text-card-foreground">{trainer.name}</CardTitle>
                <div className="flex items-center justify-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{trainer.rating}</span>
                  <span className="text-muted-foreground text-sm">({trainer.totalSessions} sessions)</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center line-clamp-3">{trainer.bio}</p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {trainer.specialties.slice(0, 3).map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-semibold text-primary">${trainer.hourlyRate}</div>
                    <div className="text-muted-foreground text-xs">per hour</div>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" />
                      {trainer.followers}
                    </div>
                    <div className="text-muted-foreground text-xs">followers</div>
                  </div>
                  <div>
                    <div className="font-semibold text-accent flex items-center justify-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {trainer.totalTipsReceived}
                    </div>
                    <div className="text-muted-foreground text-xs">$GYM earned</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {trainer.isLive ? (
                    <Link href={`/stream/${trainer.streamUrl}`} className="flex-1">
                      <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                        <Play className="w-4 h-4 mr-2" />
                        Join Live
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/trainers/${trainer.id}`} className="flex-1">
                      <Button className="w-full bg-primary hover:bg-primary/90">View Profile</Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFollow(trainer.id)}
                    className="border-secondary text-secondary hover:bg-secondary hover:text-white"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTrainers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No trainers found for the selected filter.</p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
