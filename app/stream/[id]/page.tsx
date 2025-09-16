"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PageLayout } from "@/components/page-layout"
import { TrainerService, type LiveStream, type TrainerProfile } from "@/lib/trainer-system"
import { TipModal } from "@/components/tip-modal"
import { PaymentSystem } from "@/lib/payment-system"
import {
  Heart,
  MessageCircle,
  Send,
  Users,
  DollarSign,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Gift,
  Star,
} from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: Date
  isHighlighted?: boolean
  tipAmount?: number
}

export default function LiveStreamPage() {
  const params = useParams()
  const [stream, setStream] = useState<LiveStream | null>(null)
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showTipModal, setShowTipModal] = useState(false)
  const [tipAmount, setTipAmount] = useState("")
  const [tipMessage, setTipMessage] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [userAddress, setUserAddress] = useState<string>("")
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (params.id) {
      const streamData = TrainerService.getStreamById(params.id as string)
      if (streamData) {
        setStream(streamData)
        setViewerCount(streamData.viewerCount)
        const trainerData = TrainerService.getTrainerById(streamData.trainerId)
        setTrainer(trainerData || null)
      }
    }

    // Mock chat messages
    const mockMessages: ChatMessage[] = [
      {
        id: "1",
        username: "FitnessFan23",
        message: "Great workout Sarah! 💪",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        id: "2",
        username: "HealthyLife",
        message: "Just joined! What exercise are we doing?",
        timestamp: new Date(Date.now() - 4 * 60 * 1000),
      },
      {
        id: "3",
        username: "GymRat2024",
        message: "Thanks for the motivation! 🔥",
        timestamp: new Date(Date.now() - 3 * 60 * 1000),
        isHighlighted: true,
        tipAmount: 25,
      },
      {
        id: "4",
        username: "NewbieFit",
        message: "Can you show the modification for beginners?",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
      },
    ]
    setChatMessages(mockMessages)
  }, [params.id])

  useEffect(() => {
    // Auto-scroll chat to bottom
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages])

  useEffect(() => {
    // Get user wallet address
    const savedWalletAddress = localStorage.getItem("gymonad_wallet_address")
    if (savedWalletAddress) {
      setUserAddress(savedWalletAddress)
    }
  }, [params.id])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        username: "You",
        message: newMessage,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, message])
      setNewMessage("")
    }
  }

  const handleSendTip = async (amount: number, message: string) => {
    if (stream && trainer && amount > 0) {
      try {
        await PaymentSystem.sendTip(userAddress, trainer.id, amount, message)

        // Add tip message to chat
        const tipChatMessage: ChatMessage = {
          id: Date.now().toString(),
          username: "You",
          message: message || `Sent ${amount} $GYM tokens!`,
          timestamp: new Date(),
          isHighlighted: true,
          tipAmount: amount,
        }
        setChatMessages((prev) => [...prev, tipChatMessage])

        setShowTipModal(false)
        setTipAmount("")
        setTipMessage("")
      } catch (error) {
        console.error("Failed to send tip:", error)
      }
    }
  }

  const handleTipSent = (amount: number, message: string) => {
    // Add tip message to chat
    const tipChatMessage: ChatMessage = {
      id: Date.now().toString(),
      username: "You",
      message: message || `Sent ${amount} $GYM tokens!`,
      timestamp: new Date(),
      isHighlighted: true,
      tipAmount: amount,
    }
    setChatMessages((prev) => [...prev, tipChatMessage])

    // Update stream stats
    if (stream) {
      setStream((prev) => (prev ? { ...prev, totalTips: prev.totalTips + amount } : null))
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!stream || !trainer) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Stream not found</h1>
          <Link href="/trainers">
            <Button className="mt-4 bg-primary hover:bg-primary/90">Back to Trainers</Button>
          </Link>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-4">
          {/* Main Video Area */}
          <div className="lg:col-span-3">
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                {/* Video Player */}
                <div className="relative bg-black rounded-t-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    poster={stream.thumbnailUrl || "/diverse-fitness-workout.png"}
                    controls={false}
                    autoPlay
                    muted={isMuted}
                  >
                    <source src={stream.streamUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Video Overlay Controls */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <Badge className="bg-red-500 text-white">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                      LIVE
                    </Badge>
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      <Users className="w-3 h-3 mr-1" />
                      {viewerCount}
                    </Badge>
                  </div>

                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                      className="bg-black/50 text-white hover:bg-black/70"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="bg-black/50 text-white hover:bg-black/70"
                    >
                      <Maximize className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="bg-black/50 text-white hover:bg-black/70">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Stream Info Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/70 rounded-lg p-3 text-white">
                      <h2 className="font-bold text-lg mb-1">{stream.title}</h2>
                      <p className="text-sm text-gray-300 mb-2">{stream.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={trainer.profileImage || "/placeholder.svg"} alt={trainer.name} />
                            <AvatarFallback>
                              {trainer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{trainer.name}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current text-yellow-500" />
                              {trainer.rating}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsLiked(!isLiked)}
                            className={`${isLiked ? "text-red-500" : "text-white"} hover:text-red-400`}
                          >
                            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setShowTipModal(true)}
                            className="bg-accent hover:bg-accent/90 text-white"
                          >
                            <Gift className="w-4 h-4 mr-1" />
                            Tip
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stream Stats */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{viewerCount}</div>
                  <div className="text-sm text-muted-foreground">Viewers</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-secondary">{stream.totalTips}</div>
                  <div className="text-sm text-muted-foreground">$GYM Tips</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent">{stream.duration}</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stream.category}</div>
                  <div className="text-sm text-muted-foreground">Category</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <MessageCircle className="w-5 h-5" />
                  Live Chat
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 px-4" ref={chatScrollRef}>
                  <div className="space-y-3 pb-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-2 rounded-lg ${
                          message.isHighlighted ? "bg-accent/20 border border-accent/30" : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-card-foreground">{message.username}</span>
                          {message.tipAmount && (
                            <Badge variant="secondary" className="text-xs bg-accent text-white">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {message.tipAmount}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">{formatTime(message.timestamp)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Chat Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSendMessage} className="bg-primary hover:bg-primary/90">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tip Modal */}
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          trainerName={trainer?.name || ""}
          trainerId={trainer?.id || ""}
          trainerAddress={trainer?.id || ""} // In real app, this would be trainer's wallet address
          streamId={stream?.id}
          userAddress={userAddress}
          onTipSent={handleTipSent}
        />
      </div>
    </PageLayout>
  )
}
