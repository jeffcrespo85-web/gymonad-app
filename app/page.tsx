"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, Trophy, Wallet, ExternalLink, Download, Volume2, VolumeX, Play } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import Link from "next/link"
import { audioController } from "@/lib/audio-controller"

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const [steps, setSteps] = useState(0)
  const [dailyGoal] = useState(10000)
  const [tickets, setTickets] = useState(0)
  const [checkedIn, setCheckedIn] = useState(false)
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [lotteryEntries, setLotteryEntries] = useState(0)
  const [lastWinner, setLastWinner] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = () => {
      audioController.startBackgroundMusic()
      setIsMuted(audioController.getMuteState())

      const savedSteps = localStorage.getItem("gymonad_steps")
      const savedTickets = localStorage.getItem("gymonad_tickets")
      const savedCheckedIn = localStorage.getItem("gymonad_checked_in_today")
      const savedLastCheckIn = localStorage.getItem("gymonad_last_checkin")
      const savedWallet = localStorage.getItem("gymonad_connected_wallet")
      const savedWalletAddress = localStorage.getItem("gymonad_wallet_address")
      const savedLotteryEntries = localStorage.getItem("gymonad_lottery_entries")
      const savedLastWinner = localStorage.getItem("gymonad_last_winner")

      if (savedSteps) setSteps(Number.parseInt(savedSteps))
      if (savedTickets) setTickets(Number.parseInt(savedTickets))
      if (savedCheckedIn) setCheckedIn(savedCheckedIn === "true")
      if (savedLastCheckIn) setLastCheckIn(savedLastCheckIn)
      if (savedWallet) setConnectedWallet(savedWallet)
      if (savedWalletAddress) setWalletAddress(savedWalletAddress)
      if (savedLotteryEntries) setLotteryEntries(Number.parseInt(savedLotteryEntries))
      if (savedLastWinner) setLastWinner(savedLastWinner)

      setTimeout(() => {
        setIsLoading(false)
      }, 8000) // 8 seconds loading screen
    }

    loadDashboardData()
  }, [])

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [])

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setShowInstallPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const toggleMute = () => {
    const newMuteState = audioController.toggleMute()
    setIsMuted(newMuteState)
  }

  const progressPercentage = Math.min((steps / dailyGoal) * 100, 100)
  const getTimeUntilLotteryDraw = () => {
    const now = new Date()
    const nextSunday = new Date()
    nextSunday.setDate(now.getDate() + (7 - now.getDay()))
    nextSunday.setHours(20, 0, 0, 0)

    if (now.getDay() === 0 && now.getHours() < 20) {
      nextSunday.setDate(now.getDate())
    }

    const diff = nextSunday.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  if (isLoading) {
    return (
      <PageLayout showSkulls={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <img
              src="/images/gymonad-loading.jpg"
              alt="GYMONAD Loading"
              className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
            />
            <div className="flex justify-center">
              <div className="flex space-x-1">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: "1.5s",
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="text-purple-300 text-lg animate-pulse">Loading GYMONAD...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {showInstallPrompt && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="text-sm">Install GYMONAD App</span>
            <Button
              onClick={handleInstallApp}
              size="sm"
              variant="secondary"
              className="ml-2 bg-white text-purple-600 hover:bg-gray-100"
            >
              Install
            </Button>
            <Button
              onClick={() => setShowInstallPrompt(false)}
              size="sm"
              variant="ghost"
              className="ml-1 text-white hover:bg-purple-700"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl overflow-hidden">
              <img
                src="/images/gymonad-header.jpg"
                alt="GYMONAD Team"
                className="w-full h-64 object-cover object-top"
              />
            </div>
          </div>

          <h1
            className="text-6xl font-bold mb-4 font-serif tracking-wider text-yellow-500"
            style={{
              WebkitTextStroke: "2px #fbbf24",
              textShadow: "0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.6)",
            }}
          >
            GYMONAD
          </h1>
          <p className="text-purple-200 text-lg mb-4">Track your fitness journey in the Monad ecosystem</p>

          <div className="flex justify-center mb-4">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="text-purple-200 hover:text-yellow-400 hover:bg-purple-800/20 transition-colors"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              <span className="ml-2 text-sm">{isMuted ? "Unmute" : "Mute"} Theme</span>
            </Button>
          </div>

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-lg px-4 py-2 mb-4">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
              T
            </div>
            <span className="text-yellow-400 font-bold text-lg">{tickets}</span>
            <span className="text-yellow-300 text-sm">Tickets</span>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 max-w-md mx-auto px-4 w-full">
          {/* Quick Stats Overview */}
          <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-400 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-800 font-bold">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-900">{steps.toLocaleString()}</div>
                  <div className="text-sm text-purple-800">Steps</div>
                  <Progress value={progressPercentage} className="h-2 mt-2 bg-purple-200 [&>div]:bg-purple-500" />
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-900">{checkedIn ? "✓" : "○"}</div>
                  <div className="text-sm text-purple-800">Check-in</div>
                  <div className="text-xs text-purple-700 mt-1">{checkedIn ? "Complete" : "Pending"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-purple-100 border-purple-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/steps" className="block">
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Track Steps
                </Button>
              </Link>
              <Link href="/live" className="block">
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white justify-start">
                  <Play className="h-4 w-4 mr-2" />
                  Live Streams
                </Button>
              </Link>
              <Link href="/lottery" className="block">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white justify-start">
                  <Trophy className="h-4 w-4 mr-2" />
                  View Lottery ({lotteryEntries} entries)
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Wallet Status */}
          <Card className="bg-purple-100 border-purple-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
                <Wallet className="h-6 w-6 text-purple-600" />
                Wallet Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {connectedWallet ? (
                <div className="text-center space-y-2">
                  <Badge variant="default" className="bg-green-500 text-white">
                    {connectedWallet} Connected
                  </Badge>
                  <p className="text-sm text-purple-700 font-mono break-all bg-purple-50 p-2 rounded">
                    {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                  </p>
                  <Link href="/wallet" className="block">
                    <Button variant="outline" className="w-full border-purple-400 text-purple-700 bg-transparent">
                      Manage Wallet
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-purple-700">Connect your wallet to get started</p>
                  <Link href="/wallet" className="block">
                    <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">Connect Wallet</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lottery Preview */}
          <Card className="bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-400 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-amber-900">
                <span className="text-2xl">🎰</span>
                Weekly Lottery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-yellow-200 rounded-lg p-3">
                  <div className="text-xl font-bold text-amber-900">{lotteryEntries}</div>
                  <div className="text-sm text-amber-700">Your Entries</div>
                </div>
                <div className="bg-yellow-200 rounded-lg p-3">
                  <div className="text-lg font-bold text-amber-900">{getTimeUntilLotteryDraw()}</div>
                  <div className="text-sm text-amber-700">Next Draw</div>
                </div>
              </div>
              {lastWinner && (
                <div className="bg-gradient-to-r from-yellow-300 to-amber-300 rounded-lg p-2 text-center">
                  <div className="text-xs text-amber-800 font-semibold">🏆 Last Winner</div>
                  <div className="font-mono text-amber-900 text-xs">
                    {lastWinner.slice(0, 8)}...{lastWinner.slice(-6)}
                  </div>
                </div>
              )}
              <Link href="/lottery" className="block">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">View Full Lottery</Button>
              </Link>
            </CardContent>
          </Card>

          {/* NFT Collection */}
          <Card className="bg-gradient-to-br from-blue-100 to-purple-100 border-blue-400 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-blue-900">
                <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                NFT Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <img
                src="/images/heraklion-membership-pass.jpg"
                alt="Heraklion Gym Membership Pass NFT"
                className="w-full max-w-48 mx-auto rounded-lg shadow-lg"
              />
              <Link href="/nft" className="block">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Collection
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
