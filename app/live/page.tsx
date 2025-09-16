"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { PageLayout } from "@/components/page-layout"
import { TrainerService, type LiveStream, type TrainerProfile } from "@/lib/trainer-system"
import { Search, Users, Play, Star, Clock, TrendingUp, Gift } from "lucide-react"
import Link from "next/link"

interface StreamWithTrainer extends LiveStream {
  trainer: TrainerProfile
}

export default function LiveStreamsPage() {
  const [streams, setStreams] = useState<StreamWithTrainer[]>([])
  const [filteredStreams, setFilteredStreams] = useState<StreamWithTrainer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"viewers" | "recent" | "tips">("viewers")

  const categories = ["all", "HIIT", "Yoga", "Strength", "Cardio", "Dance", "Flexibility"]

  useEffect(() => {
    // Load live streams with trainer data
    const liveStreams = TrainerService.getLiveStreams()
    const streamsWithTrainers = liveStreams.map((stream) => {
      const trainer = TrainerService.getTrainerById(stream.trainerId)
      return {
        ...stream,
        trainer: trainer!,
      }
    })

    // Add some mock additional streams for variety
    const additionalMockStreams: StreamWithTrainer[] = [
      {
        id: "stream-4",
        trainerId: "trainer-2",
        title: "Strength Training Fundamentals",
        description: "Learn proper form and technique for basic strength exercises.",
        category: "Strength",
        isLive: true,
        viewerCount: 34,
        startTime: new Date(Date.now() - 20 * 60 * 1000),
        duration: 60,
        thumbnailUrl: "/strength-training.png",
        streamUrl: "https://example.com/stream/4",
        totalTips: 78,
        trainer: {
          id: "trainer-2",
          name: "Mike Rodriguez",
          bio: "Former Olympic athlete turned personal trainer.",
          specialties: ["Athletic Performance", "Functional Training"],
          rating: 4.8,
          totalSessions: 892,
          profileImage: "/male-fitness-trainer.png",
          isLive: true,
          hourlyRate: 85,
          certifications: ["CSCS", "FMS"],
          experience: 12,
          totalTipsReceived: 1890,
          followers: 2800,
        },
      },
      {
        id: "stream-5",
        trainerId: "trainer-4",
        title: "Dance Cardio Party",
        description: "High-energy dance workout that's fun and effective!",
        category: "Dance",
        isLive: true,
        viewerCount: 62,
        startTime: new Date(Date.now() - 5 * 60 * 1000),
        duration: 45,
        thumbnailUrl: "/dance-cardio.png",
        streamUrl: "https://example.com/stream/5",
        totalTips: 156,
        trainer: {
          id: "trainer-4",
          name: "Jessica Martinez",
          bio: "Dance instructor and fitness enthusiast bringing joy to workouts.",
          specialties: ["Dance Fitness", "Cardio", "Fun Workouts"],
          rating: 4.9,
          totalSessions: 567,
          profileImage: "/dance-instructor.png",
          isLive: true,
          hourlyRate: 70,
          certifications: ["Dance Fitness", "Group Fitness"],
          experience: 7,
          totalTipsReceived: 1245,
          followers: 3500,
        },
      },
    ]

    const allStreams = [...streamsWithTrainers, ...additionalMockStreams]
    setStreams(allStreams)
    setFilteredStreams(allStreams)
  }, [])

  useEffect(() => {
    let filtered = streams

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (stream) =>
          stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stream.trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stream.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((stream) => stream.category === selectedCategory)
    }

    // Sort streams
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "viewers":
          return b.viewerCount - a.viewerCount
        case "recent":
          return b.startTime.getTime() - a.startTime.getTime()
        case "tips":
          return b.totalTips - a.totalTips
        default:
          return 0
      }
    })

    setFilteredStreams(filtered)
  }, [streams, searchQuery, selectedCategory, sortBy])

  const getStreamDuration = (startTime: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60))
    if (diff < 60) return `${diff}m`
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return `${hours}h ${minutes}m`
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4 font-serif">Live Fitness Streams</h1>
          <p className="text-muted-foreground text-lg">Join live workout sessions and support your favorite trainers</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search streams, trainers, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSortBy("viewers")}
              className={`${sortBy === "viewers" ? "bg-primary text-white" : "bg-transparent"} hover:bg-primary/90`}
            >
              <Users className="w-4 h-4 mr-2" />
              Most Viewers
            </Button>
            <Button
              variant="outline"
              onClick={() => setSortBy("recent")}
              className={`${sortBy === "recent" ? "bg-secondary text-white" : "bg-transparent"} hover:bg-secondary/90`}
            >
              <Clock className="w-4 h-4 mr-2" />
              Recent
            </Button>
            <Button
              variant="outline"
              onClick={() => setSortBy("tips")}
              className={`${sortBy === "tips" ? "bg-accent text-white" : "bg-transparent"} hover:bg-accent/90`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Top Tips
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category ? "bg-primary hover:bg-primary/90" : "bg-transparent hover:bg-primary/10"
              }
            >
              {category === "all" ? "All Categories" : category}
            </Button>
          ))}
        </div>

        {/* Live Streams Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStreams.map((stream) => (
            <Card key={stream.id} className="bg-card border-border hover:shadow-lg transition-shadow group">
              <CardContent className="p-0">
                {/* Stream Thumbnail */}
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  <img
                    src={stream.thumbnailUrl || "/diverse-fitness-workout.png"}
                    alt={stream.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                  {/* Live Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-red-500 text-white">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                      LIVE
                    </Badge>
                  </div>

                  {/* Stream Stats */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      <Users className="w-3 h-3 mr-1" />
                      {stream.viewerCount}
                    </Badge>
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      <Gift className="w-3 h-3 mr-1" />
                      {stream.totalTips}
                    </Badge>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="bg-black/70 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      {getStreamDuration(stream.startTime)}
                    </Badge>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/stream/${stream.id}`}>
                      <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
                        <Play className="w-6 h-6 mr-2" />
                        Join Stream
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={stream.trainer.profileImage || "/placeholder.svg"} alt={stream.trainer.name} />
                      <AvatarFallback>
                        {stream.trainer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-card-foreground line-clamp-2 mb-1">{stream.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{stream.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/trainers/${stream.trainer.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {stream.trainer.name}
                          </Link>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 fill-current text-yellow-500" />
                            {stream.trainer.rating}
                            <span>•</span>
                            <span>{stream.trainer.followers} followers</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {stream.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredStreams.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">No live streams found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "No trainers are currently streaming"}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                }}
                variant="outline"
                className="bg-transparent"
              >
                Clear Filters
              </Button>
              <Link href="/trainers">
                <Button className="bg-primary hover:bg-primary/90">Browse Trainers</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Call to Action */}
        {filteredStreams.length > 0 && (
          <div className="text-center mt-12 p-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <h3 className="text-2xl font-bold text-primary mb-2">Ready to Start Training?</h3>
            <p className="text-muted-foreground mb-4">
              Join live sessions, support trainers with tips, and achieve your fitness goals
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/trainers">
                <Button className="bg-primary hover:bg-primary/90">
                  <Users className="w-4 h-4 mr-2" />
                  Browse All Trainers
                </Button>
              </Link>
              <Link href="/trainer-dashboard">
                <Button
                  variant="outline"
                  className="bg-transparent border-secondary text-secondary hover:bg-secondary hover:text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Become a Trainer
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
