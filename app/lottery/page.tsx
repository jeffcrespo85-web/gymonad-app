"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, Users, Gift, Dice1 } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function LotteryPage() {
  const [tickets, setTickets] = useState(0)
  const [lotteryEntries, setLotteryEntries] = useState(0)
  const [lastWinner, setLastWinner] = useState<string | null>(null)
  const [nextDrawDate, setNextDrawDate] = useState<Date | null>(null)
  const [lotteryHistory, setLotteryHistory] = useState<Array<{ winner: string; date: string; tickets: number }>>([])
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    const savedTickets = localStorage.getItem("gymonad_tickets")
    const savedLotteryEntries = localStorage.getItem("gymonad_lottery_entries")
    const savedLastWinner = localStorage.getItem("gymonad_last_winner")
    const savedLotteryHistory = localStorage.getItem("gymonad_lottery_history")
    const savedWallet = localStorage.getItem("gymonad_connected_wallet")
    const savedWalletAddress = localStorage.getItem("gymonad_wallet_address")

    if (savedTickets) setTickets(Number.parseInt(savedTickets))
    if (savedLotteryEntries) setLotteryEntries(Number.parseInt(savedLotteryEntries))
    if (savedLastWinner) setLastWinner(savedLastWinner)
    if (savedLotteryHistory) setLotteryHistory(JSON.parse(savedLotteryHistory))
    if (savedWallet) setConnectedWallet(savedWallet)
    if (savedWalletAddress) setWalletAddress(savedWalletAddress)

    // Calculate next draw date (every Sunday at 8 PM UTC)
    const now = new Date()
    const nextSunday = new Date()
    nextSunday.setDate(now.getDate() + (7 - now.getDay()))
    nextSunday.setHours(20, 0, 0, 0)

    if (now.getDay() === 0 && now.getHours() < 20) {
      nextSunday.setDate(now.getDate())
    }

    setNextDrawDate(nextSunday)
  }, [])

  useEffect(() => {
    localStorage.setItem("gymonad_lottery_entries", lotteryEntries.toString())
  }, [lotteryEntries])

  useEffect(() => {
    if (lastWinner) {
      localStorage.setItem("gymonad_last_winner", lastWinner)
    }
  }, [lastWinner])

  useEffect(() => {
    localStorage.setItem("gymonad_lottery_history", JSON.stringify(lotteryHistory))
  }, [lotteryHistory])

  const playSwordClash = () => {
    const audio = new Audio("/gymonad-assetshttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/swordsclashing1sec-Gu3scJA0wJCm9za9kdnHLXcJdMvdkp.mp3")
    audio.volume = 0.5
    audio.play().catch(() => {})
  }

  const playGuitarMilestone = () => {
    const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/guitarmp3-5NQgvR22O7TRWetiCDZvCln2LFfg6h.mp3")
    audio.volume = 0.6
    audio.play().catch(() => {})
  }

  const getTimeUntilLotteryDraw = () => {
    if (!nextDrawDate) return "Calculating..."

    const now = new Date()
    const diff = nextDrawDate.getTime() - now.getTime()

    if (diff <= 0) return "Draw in progress!"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const drawLotteryWinner = () => {
    if (lotteryEntries === 0 || !connectedWallet) return

    playSwordClash()

    // Simulate lottery draw
    const winner = walletAddress || connectedWallet
    const drawDate = new Date().toLocaleDateString()

    setLastWinner(winner)
    setLotteryHistory((prev) => [
      { winner, date: drawDate, tickets: lotteryEntries },
      ...prev.slice(0, 9), // Keep last 10 entries
    ])

    // Reset entries for next week
    setLotteryEntries(0)

    playGuitarMilestone()

    // Update next draw date
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(20, 0, 0, 0)
    setNextDrawDate(nextWeek)
  }

  const enterLottery = () => {
    if (tickets > 0) {
      setLotteryEntries((prev) => prev + 1)
      setTickets((prev) => prev - 1)
      playSwordClash()
    }
  }

  const getTotalPot = () => {
    // Calculate total entries from all participants (simulated)
    const baseEntries = Math.floor(Math.random() * 50) + 20
    return baseEntries + lotteryEntries
  }

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 font-serif text-yellow-500">MONAD Lottery</h1>
          <p className="text-purple-300">Weekly draws • 5 MONAD testnet tokens</p>
        </div>

        <div className="grid gap-6 max-w-md mx-auto px-4 w-full">
          {/* Next Draw Countdown */}
          <Card className="bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-400 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-amber-900">
                <Clock className="h-6 w-6 text-amber-600" />
                Next Draw
              </CardTitle>
              <CardDescription className="text-amber-700">Every Sunday at 8 PM UTC</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-900 mb-2">{getTimeUntilLotteryDraw()}</div>
                <div className="text-amber-700">Until next draw</div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-amber-900">{getTotalPot()}</div>
                    <div className="text-sm text-amber-700">Total Entries</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-amber-900">5 MONAD</div>
                    <div className="text-sm text-amber-700">Prize Pool</div>
                  </div>
                </div>
              </div>

              {nextDrawDate && (
                <div className="text-center text-sm text-amber-700">
                  <p>Draw Date: {nextDrawDate.toLocaleDateString()}</p>
                  <p>Time: {nextDrawDate.toLocaleTimeString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Your Entries */}
          <Card className="bg-purple-100 border-purple-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
                <Trophy className="h-6 w-6 text-purple-600" />
                Your Lottery Status
              </CardTitle>
              <CardDescription className="text-purple-700">Current entries and tickets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-900">{lotteryEntries}</div>
                  <div className="text-sm text-purple-700">Lottery Entries</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-900">{tickets}</div>
                  <div className="text-sm text-purple-700">Available Tickets</div>
                </div>
              </div>

              {tickets > 0 ? (
                <Button onClick={enterLottery} className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                  <Gift className="h-4 w-4 mr-2" />
                  Enter Lottery (Use 1 Ticket)
                </Button>
              ) : (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-purple-700">
                    No tickets available. Earn tickets by:
                    <br />• Taking 2,000 steps (1 ticket)
                    <br />• Daily workout check-ins (1 ticket)
                  </p>
                </div>
              )}

              {lotteryEntries > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-green-700 font-medium">✓ You're entered in this week's draw!</p>
                  <p className="text-xs text-green-600 mt-1">
                    Win probability: ~{((lotteryEntries / getTotalPot()) * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Last Winner */}
          {lastWinner && (
            <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-green-400 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-green-900">
                  <Trophy className="h-6 w-6 text-green-600" />
                  Latest Winner
                </CardTitle>
                <CardDescription className="text-green-700">Most recent lottery result</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-green-300 to-emerald-300 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-sm text-green-800 font-semibold mb-1">Winner</div>
                  <div className="font-mono text-green-900 text-sm break-all">
                    {lastWinner.slice(0, 8)}...{lastWinner.slice(-6)}
                  </div>
                  <div className="text-xs text-green-700 mt-2">Won 5 MONAD tokens</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lottery History */}
          {lotteryHistory.length > 0 && (
            <Card className="bg-gray-100 border-gray-300 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-gray-900">
                  <Users className="h-6 w-6 text-gray-600" />
                  Recent Winners
                </CardTitle>
                <CardDescription className="text-gray-700">Lottery history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lotteryHistory.slice(0, 5).map((entry, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <div className="font-mono text-sm text-gray-900">
                          {entry.winner.slice(0, 6)}...{entry.winner.slice(-4)}
                        </div>
                        <div className="text-xs text-gray-600">{entry.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">5 MONAD</div>
                        <div className="text-xs text-gray-600">{entry.tickets} entries</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* How It Works */}
          <Card className="bg-blue-100 border-blue-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-blue-900">How It Works</CardTitle>
              <CardDescription className="text-blue-700">Lottery rules and rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="space-y-2 text-sm text-blue-800">
                  <p className="font-medium">🎫 Earning Tickets:</p>
                  <p>• 1 ticket per 2,000 steps taken</p>
                  <p>• 1 ticket per daily workout check-in</p>

                  <p className="font-medium mt-3">🎰 Lottery Draw:</p>
                  <p>• Every Sunday at 8 PM UTC</p>
                  <p>• Winner selected randomly from all entries</p>
                  <p>• Prize: 5 MONAD testnet tokens</p>

                  <p className="font-medium mt-3">💰 Prize Distribution:</p>
                  <p>• Tokens sent manually by admin</p>
                  <p>• Winner announced in app</p>
                  <p>• Must have connected wallet to win</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Connection Status */}
          <Card className="bg-purple-100 border-purple-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-900">Wallet Status</CardTitle>
              <CardDescription className="text-purple-700">Required to participate in lottery</CardDescription>
            </CardHeader>
            <CardContent>
              {connectedWallet ? (
                <div className="text-center space-y-2">
                  <Badge variant="default" className="bg-green-500 text-white">
                    ✓ {connectedWallet} Connected
                  </Badge>
                  <p className="text-sm text-purple-700 font-mono break-all bg-purple-50 p-2 rounded">
                    {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                  </p>
                  <p className="text-xs text-green-700">Ready to participate in lottery</p>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-purple-700">Connect your wallet to participate in the lottery</p>
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">Go to Wallet Page</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Draw Button - Development Only */}
          {process.env.NODE_ENV === "development" && (
            <Card className="bg-red-100 border-red-300 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-red-900">Admin Controls</CardTitle>
                <CardDescription className="text-red-700">Development only</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={drawLotteryWinner}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                  disabled={lotteryEntries === 0 || !connectedWallet}
                >
                  <Dice1 className="h-4 w-4 mr-2" />🎲 Draw Lottery Winner (Admin)
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
