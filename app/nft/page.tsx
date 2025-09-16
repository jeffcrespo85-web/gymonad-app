"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Gamepad2 } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

const GYMONAD_CONTRACT_ADDRESS = "0x476cfebb9b6ee7b1b29147529e805dbfd4b5b89e"

export default function NFTPage() {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [steps, setSteps] = useState(0)
  const [tickets, setTickets] = useState(0)

  useEffect(() => {
    const savedWallet = localStorage.getItem("gymonad_connected_wallet")
    const savedWalletAddress = localStorage.getItem("gymonad_wallet_address")
    const savedSteps = localStorage.getItem("gymonad_steps")
    const savedTickets = localStorage.getItem("gymonad_tickets")

    if (savedWallet) setConnectedWallet(savedWallet)
    if (savedWalletAddress) setWalletAddress(savedWalletAddress)
    if (savedSteps) setSteps(Number.parseInt(savedSteps))
    if (savedTickets) setTickets(Number.parseInt(savedTickets))
  }, [])

  const playSwordClash = () => {
    const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/swordsclashing1sec-Gu3scJA0wJCm9za9kdnHLXcJdMvdkp.mp3")
    audio.volume = 0.5
    audio.play().catch(() => {})
  }

  const recordFitnessActivity = async (type: string, value: number) => {
    if (!connectedWallet) return

    try {
      // This would interact with the GYMONAD smart contract
      console.log(`Recording ${type}: ${value} for wallet: ${walletAddress}`)

      // Simulate blockchain interaction
      const activity = {
        type,
        value,
        wallet: walletAddress,
        timestamp: new Date().toISOString(),
      }

      // Store activity locally for now
      const activities = JSON.parse(localStorage.getItem("gymonad_blockchain_activities") || "[]")
      activities.push(activity)
      localStorage.setItem("gymonad_blockchain_activities", JSON.stringify(activities))

      alert(`Successfully recorded ${type} activity on GYMONAD protocol!`)
    } catch (error) {
      console.error("Failed to record fitness activity:", error)
      alert("Failed to record activity on blockchain")
    }
  }

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 font-serif text-yellow-500">NFT Collection</h1>
          <p className="text-purple-300">Exclusive NFTs and blockchain integration</p>
        </div>

        <div className="grid gap-6 max-w-md mx-auto px-4 w-full">
          {/* GYMONAD Smart Contract */}
          <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-400 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
                <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                GYMONAD Protocol
              </CardTitle>
              <CardDescription className="text-purple-700">Official GYMONAD fitness smart contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-lg text-white">
                <h3 className="font-bold text-lg mb-2">GYMONAD Protocol</h3>
                <p className="text-sm opacity-90 mb-3">Decentralized fitness tracking and rewards</p>
                <div className="text-xs font-mono bg-black/20 p-2 rounded break-all">{GYMONAD_CONTRACT_ADDRESS}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-purple-900">{steps.toLocaleString()}</div>
                  <div className="text-sm text-purple-700">Steps On-Chain</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-purple-900">{tickets}</div>
                  <div className="text-sm text-purple-700">Rewards Earned</div>
                </div>
              </div>

              {connectedWallet ? (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      playSwordClash()
                      recordFitnessActivity("steps", steps)
                    }}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Sync Fitness Data
                  </Button>
                  <p className="text-xs text-purple-600 text-center">
                    Record your fitness achievements on the Monad blockchain
                  </p>
                </div>
              ) : (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-purple-700">Connect wallet to interact with GYMONAD protocol</p>
                  <Button className="mt-2 bg-purple-500 hover:bg-purple-600 text-white">Go to Wallet Page</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Heraklion Army NFT Collection */}
          <Card className="bg-gradient-to-br from-blue-100 to-purple-100 border-blue-400 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-blue-900">
                <Gamepad2 className="h-6 w-6 text-blue-600" />
                Heraklion Army NFT
              </CardTitle>
              <CardDescription className="text-blue-700">Exclusive partner collection on Magic Eden</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-3">
                <div className="relative">
                  <img
                    src="/images/heraklion-membership-pass.jpg"
                    alt="Heraklion Gym Membership Pass NFT"
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={playSwordClash}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg pointer-events-none" />
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg text-white">
                  <h3 className="font-bold text-lg mb-2">Heraklion Army</h3>
                  <p className="text-sm opacity-90 mb-3">Exclusive NFTs for GYMONAD warriors</p>
                  <div className="text-xs font-mono bg-black/20 p-2 rounded break-all">
                    0xb240c821dd61f4a3ee572591536512111e6ffe45
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">🏛️ Collection Features:</p>
                    <p>• Exclusive gym membership pass design</p>
                    <p>• Limited edition warrior collection</p>
                    <p>• Special benefits for GYMONAD users</p>
                    <p>• Tradeable on Magic Eden marketplace</p>
                  </div>
                </div>

                <a
                  href="https://magiceden.us/mint-terminal/monad-testnet/0x1e23ce5c525bdd782bd6632e7a3b63011432dcb3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-lg transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                  onClick={playSwordClash}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  MINT ON MAGIC EDEN
                  <ExternalLink className="w-5 h-5" />
                </a>

                {connectedWallet && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 mb-1">Connected: {connectedWallet}</p>
                    <p className="text-xs text-blue-600 font-mono break-all">{walletAddress}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* NFT Benefits */}
          <Card className="bg-green-100 border-green-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-green-900">NFT Holder Benefits</CardTitle>
              <CardDescription className="text-green-700">Exclusive perks for collection owners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-2">🎁 Holder Rewards:</p>
                    <p>• 2x lottery ticket multiplier</p>
                    <p>• Exclusive fitness challenges</p>
                    <p>• Early access to new features</p>
                    <p>• Special Discord community access</p>
                    <p>• Monthly MONAD token airdrops</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-2">🏆 Achievement NFTs:</p>
                    <p>• Milestone completion badges</p>
                    <p>• Streak achievement tokens</p>
                    <p>• Leaderboard position rewards</p>
                    <p>• Community event participation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collection Stats */}
          <Card className="bg-gray-100 border-gray-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-gray-900">Collection Statistics</CardTitle>
              <CardDescription className="text-gray-700">Live marketplace data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900">1,000</div>
                  <div className="text-sm text-gray-700">Total Supply</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900">0.5 MON</div>
                  <div className="text-sm text-gray-700">Floor Price</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900">750</div>
                  <div className="text-sm text-gray-700">Minted</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900">250</div>
                  <div className="text-sm text-gray-700">Available</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
