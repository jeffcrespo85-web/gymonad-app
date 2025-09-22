"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Zap, Users, BarChart3 } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { GymTokenSystem, type GymTokenUser } from "@/lib/gym-token-system"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"

// Mock price data for $GYM token chart
const priceData = [
  { time: "00:00", price: 0.0012, volume: 1250 },
  { time: "04:00", price: 0.0015, volume: 2100 },
  { time: "08:00", price: 0.0018, volume: 3200 },
  { time: "12:00", price: 0.0022, volume: 4500 },
  { time: "16:00", price: 0.0019, volume: 3800 },
  { time: "20:00", price: 0.0025, volume: 5200 },
  { time: "24:00", price: 0.0028, volume: 6100 },
]

export default function TokenPage() {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [gymTokens, setGymTokens] = useState(0)
  const [leaderboard, setLeaderboard] = useState<GymTokenUser[]>([])
  const [userRank, setUserRank] = useState(0)
  const [selectedTimeframe, setSelectedTimeframe] = useState("24H")

  useEffect(() => {
    const savedWallet = localStorage.getItem("gymonad_wallet_address")
    if (savedWallet) {
      setConnectedWallet(savedWallet)
      setGymTokens(GymTokenSystem.getTokenBalance(savedWallet))
      setUserRank(GymTokenSystem.getUserRank(savedWallet))
    }
    setLeaderboard(GymTokenSystem.getLeaderboard())
  }, [])

  const currentPrice = priceData[priceData.length - 1].price
  const priceChange = ((currentPrice - priceData[0].price) / priceData[0].price) * 100
  const totalVolume = priceData.reduce((sum, data) => sum + data.volume, 0)

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 font-serif text-yellow-500">$GYM Token</h1>
          <p className="text-purple-300">Fitness rewards & community leaderboard</p>
        </div>

        <div className="grid gap-6 max-w-md mx-auto px-4 w-full">
          {/* Token Price Chart */}
          <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-green-400 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-green-900">
                <BarChart3 className="h-6 w-6 text-green-600" />
                $GYM Price Chart
              </CardTitle>
              <CardDescription className="text-green-700">Live token price and trading volume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-900">${currentPrice.toFixed(4)}</div>
                  <div className="text-sm text-green-700">Current Price</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className={`text-2xl font-bold ${priceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {priceChange >= 0 ? "+" : ""}
                    {priceChange.toFixed(2)}%
                  </div>
                  <div className="text-sm text-green-700">24H Change</div>
                </div>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                    <XAxis dataKey="time" stroke="#065f46" fontSize={12} />
                    <YAxis stroke="#065f46" fontSize={12} />
                    <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} fill="url(#priceGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-700">24H Volume:</span>
                  <span className="text-green-900 font-bold">{totalVolume.toLocaleString()} $GYM</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-green-700">Market Cap:</span>
                  <span className="text-green-900 font-bold">$2.8M</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Token Balance */}
          {connectedWallet && (
            <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-400 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    $
                  </div>
                  Your $GYM Balance
                </CardTitle>
                <CardDescription className="text-purple-700">Earned through fitness achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-purple-600 mb-2">{gymTokens}</div>
                  <div className="text-lg text-purple-700">$GYM Tokens</div>
                  <div className="text-sm text-purple-600 mt-1">≈ ${(gymTokens * currentPrice).toFixed(4)} USD</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-purple-900">#{userRank || "Unranked"}</div>
                    <div className="text-sm text-purple-700">Global Rank</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-purple-900">{Math.floor(gymTokens / 10)}</div>
                    <div className="text-sm text-purple-700">Milestones</div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-800 text-center">
                    <strong>How to Earn:</strong>
                    <br />• 10 $GYM per step milestone (1K, 2.5K, 5K, etc.)
                    <br />• 10 $GYM per daily goal completion
                    <br />• 10 $GYM per ticket earned (every 2K steps)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Community Leaderboard */}
          <Card className="bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-400 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-amber-900">
                <Trophy className="h-6 w-6 text-yellow-600" />
                Community Leaderboard
              </CardTitle>
              <CardDescription className="text-amber-700">Top $GYM token holders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.length > 0 ? (
                leaderboard.slice(0, 10).map((user, index) => (
                  <div key={user.address} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? "bg-yellow-500 text-white"
                            : index === 1
                              ? "bg-gray-400 text-white"
                              : index === 2
                                ? "bg-amber-600 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-mono text-sm text-amber-900">
                          {user.address === connectedWallet
                            ? "You"
                            : `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
                        </div>
                        <div className="text-xs text-amber-700">{user.milestonesAchieved} milestones</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-900">{user.tokens}</div>
                      <div className="text-xs text-amber-700">$GYM</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-amber-700">No users on leaderboard yet</p>
                  <p className="text-sm text-amber-600 mt-1">Start earning $GYM tokens to appear here!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Token Stats */}
          <Card className="bg-blue-100 border-blue-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-blue-900">Token Statistics</CardTitle>
              <CardDescription className="text-blue-700">$GYM ecosystem metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-900">1,000,000</div>
                  <div className="text-sm text-blue-700">Total Supply</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-900">
                    {leaderboard.reduce((sum, user) => sum + user.tokens, 0)}
                  </div>
                  <div className="text-sm text-blue-700">Circulating</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-900">{leaderboard.length}</div>
                  <div className="text-sm text-blue-700">Holders</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-900">24/7</div>
                  <div className="text-sm text-blue-700">Earning</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Utility */}
          <Card className="bg-indigo-100 border-indigo-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-indigo-900">
                <Zap className="h-6 w-6 text-indigo-600" />
                Token Utility
              </CardTitle>
              <CardDescription className="text-indigo-700">What you can do with $GYM tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <div className="text-sm text-indigo-800">
                    <p className="font-medium mb-2">🏆 Fitness Rewards:</p>
                    <p>• Earn tokens for step milestones</p>
                    <p>• Daily and weekly goal completions</p>
                    <p>• Streak bonuses and achievements</p>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <div className="text-sm text-indigo-800">
                    <p className="font-medium mb-2">💰 Tipping System:</p>
                    <p>• Tip live streamers during workouts</p>
                    <p>• Support community trainers</p>
                    <p>• Reward helpful content creators</p>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <div className="text-sm text-indigo-800">
                    <p className="font-medium mb-2">🎯 Future Features:</p>
                    <p>• Stake tokens for premium features</p>
                    <p>• Governance voting rights</p>
                    <p>• Exclusive NFT minting access</p>
                    <p>• Marketplace transactions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connect Wallet CTA */}
          {!connectedWallet && (
            <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-400 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-purple-900">Start Earning $GYM</CardTitle>
                <CardDescription className="text-purple-700">Connect your wallet to track tokens</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-4xl mb-3">💪</div>
                <p className="text-purple-800 mb-4">
                  Connect your wallet to start earning $GYM tokens through fitness activities!
                </p>
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                  <a href="/wallet" className="flex items-center justify-center gap-2">
                    Connect Wallet
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
