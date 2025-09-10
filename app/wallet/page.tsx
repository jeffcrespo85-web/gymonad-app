"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Loader2, ExternalLink, Copy, CheckCircle } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { walletAdapters, type WalletAdapter } from "@/lib/wallet"
import { audioController } from "@/lib/audio-controller"

export default function WalletPage() {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [walletConnecting, setWalletConnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    const savedWallet = localStorage.getItem("gymonad_connected_wallet")
    const savedWalletAddress = localStorage.getItem("gymonad_wallet_address")
    const savedActivities = localStorage.getItem("gymonad_blockchain_activities")

    if (savedWallet) setConnectedWallet(savedWallet)
    if (savedWalletAddress) setWalletAddress(savedWalletAddress)
    if (savedActivities) setActivities(JSON.parse(savedActivities))
  }, [])

  const connectWallet = async (adapter: WalletAdapter) => {
    setWalletConnecting(true)
    audioController.playSwordClash()

    try {
      if (!adapter.isInstalled()) {
        window.open(adapter.downloadUrl, "_blank")
        setWalletConnecting(false)
        return
      }

      const address = await adapter.connect()
      setConnectedWallet(adapter.name)
      setWalletAddress(address)
      setShowWalletOptions(false)

      localStorage.setItem("gymonad_connected_wallet", adapter.name)
      localStorage.setItem("gymonad_wallet_address", address)

      audioController.playAchievementSound()
    } catch (error: any) {
      console.error("Wallet connection error details:", {
        name: adapter.name,
        error: error,
        message: error?.message,
        code: error?.code,
        toString: error?.toString?.(),
      })

      let errorMessage = "Unknown connection error"

      if (error?.message) {
        errorMessage = error.message
      } else if (error?.toString && typeof error.toString === "function") {
        errorMessage = error.toString()
      } else if (typeof error === "string") {
        errorMessage = error
      }

      alert(`Failed to connect wallet: ${errorMessage}`)
    } finally {
      setWalletConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setConnectedWallet(null)
    setWalletAddress(null)
    setShowWalletOptions(false)

    localStorage.removeItem("gymonad_connected_wallet")
    localStorage.removeItem("gymonad_wallet_address")

    audioController.playSwordClash()
  }

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getNetworkInfo = () => {
    return {
      name: "Monad Testnet",
      chainId: "10143",
      rpcUrl: "https://testnet-rpc.monad.xyz",
      explorer: "https://testnet-explorer.monad.xyz",
    }
  }

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 font-serif text-yellow-500">Web3 Wallet</h1>
          <p className="text-purple-300">Connect to the Monad ecosystem</p>
        </div>

        <div className="grid gap-6 max-w-md mx-auto px-4 w-full">
          {/* Wallet Connection Status */}
          <Card className="bg-purple-100 border-purple-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-purple-900">
                <Wallet className="h-6 w-6 text-purple-600" />
                Connection Status
              </CardTitle>
              <CardDescription className="text-purple-700">Your Web3 wallet connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectedWallet ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge variant="default" className="bg-green-500 text-white mb-3 text-lg px-4 py-2">
                      ✓ {connectedWallet} Connected
                    </Badge>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-700 mb-2">Wallet Address:</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono break-all bg-white p-2 rounded flex-1">{walletAddress}</p>
                        <Button
                          onClick={copyAddress}
                          size="sm"
                          variant="outline"
                          className="border-purple-400 text-purple-700 bg-transparent"
                        >
                          {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={disconnectWallet}
                      variant="outline"
                      className="w-full border-red-400 text-red-700 hover:bg-red-50 bg-transparent"
                    >
                      Disconnect Wallet
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-purple-700 mb-4">Connect your wallet to access Web3 features</p>
                  </div>

                  {!showWalletOptions ? (
                    <Button
                      onClick={() => {
                        audioController.playSwordClash()
                        setShowWalletOptions(true)
                      }}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-purple-700 text-center mb-3">Choose your wallet:</p>
                      {walletAdapters.map((adapter) => (
                        <Button
                          key={adapter.name}
                          onClick={() => connectWallet(adapter)}
                          disabled={walletConnecting}
                          variant="outline"
                          className={`w-full justify-start border-purple-400 text-purple-700 hover:bg-purple-100 ${
                            !adapter.isInstalled() ? "opacity-50" : ""
                          }`}
                        >
                          {walletConnecting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <span className="mr-2">{adapter.icon}</span>
                          )}
                          {adapter.name}
                          {!adapter.isInstalled() && <span className="ml-auto text-xs">(Install)</span>}
                        </Button>
                      ))}
                      <Button
                        onClick={() => setShowWalletOptions(false)}
                        variant="ghost"
                        size="sm"
                        className="w-full text-purple-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Network Information */}
          <Card className="bg-blue-100 border-blue-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-blue-900">Network Information</CardTitle>
              <CardDescription className="text-blue-700">Monad testnet configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Network:</span>
                    <span className="text-blue-900 font-medium">{getNetworkInfo().name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Chain ID:</span>
                    <span className="text-blue-900 font-mono">{getNetworkInfo().chainId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Explorer:</span>
                    <a
                      href={getNetworkInfo().explorer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">🔗 EVM Compatible:</span>
                  <br />
                  Monad supports all Ethereum tools and dApps with faster transactions and lower fees.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Activities */}
          {connectedWallet && activities.length > 0 && (
            <Card className="bg-green-100 border-green-300 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-green-900">Blockchain Activities</CardTitle>
                <CardDescription className="text-green-700">Your recorded fitness data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.slice(-5).map((activity, index) => (
                    <div key={index} className="bg-green-50 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-green-900 capitalize">{activity.type}</div>
                        <div className="text-xs text-green-600">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-900">{activity.value.toLocaleString()}</div>
                        <div className="text-xs text-green-600">Recorded</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wallet Features */}
          <Card className="bg-yellow-100 border-yellow-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-yellow-900">Wallet Features</CardTitle>
              <CardDescription className="text-yellow-700">What you can do with your connected wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-2">🎯 Fitness Tracking:</p>
                    <p>• Record steps and workouts on-chain</p>
                    <p>• Earn verifiable fitness achievements</p>
                    <p>• Participate in community challenges</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-2">🎰 Lottery & Rewards:</p>
                    <p>• Enter weekly MONAD token lottery</p>
                    <p>• Receive automatic reward distributions</p>
                    <p>• Track your winning history</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-2">🖼️ NFT Integration:</p>
                    <p>• Mint exclusive fitness NFTs</p>
                    <p>• Access holder-only benefits</p>
                    <p>• Trade on Magic Eden marketplace</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-red-100 border-red-300 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-red-900">Security Notice</CardTitle>
              <CardDescription className="text-red-700">Keep your wallet safe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-2">🔒 Security Tips:</p>
                  <p>• Never share your private keys or seed phrase</p>
                  <p>• Always verify transaction details before signing</p>
                  <p>• Use hardware wallets for large amounts</p>
                  <p>• Keep your wallet software updated</p>
                  <p>• Only connect to trusted dApps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
