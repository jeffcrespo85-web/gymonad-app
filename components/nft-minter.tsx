"use client"

import { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { parseEther } from "viem"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Zap, Trophy } from "lucide-react"
import { playSound } from "@/lib/sound-effects"
import { toast } from "sonner"
import Image from "next/image"

// NFT Contract ABI (simplified)
const NFT_ABI = [
  {
    inputs: [{ name: "to", type: "address" }],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

const NFT_CONTRACT_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4" // Placeholder address

export function NFTMinter() {
  const { address, isConnected } = useAccount()
  const [isMinting, setIsMinting] = useState(false)

  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Read user's NFT balance
  const { data: nftBalance } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Read total supply
  const { data: totalSupply } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: "totalSupply",
  })

  const handleMint = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first")
      return
    }

    try {
      setIsMinting(true)
      playSound("sword2") // Play sword sound effect

      await writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: "mint",
        args: [address],
        value: parseEther("5"), // 5 MON tokens
      })
    } catch (err) {
      console.error("Minting failed:", err)
      toast.error("Minting failed. Please try again.")
    } finally {
      setIsMinting(false)
    }
  }

  // Handle successful transaction
  if (isConfirmed && !isMinting) {
    toast.success("NFT minted successfully! 🎉")
    playSound("sword3") // Victory sound
  }

  if (error) {
    toast.error("Transaction failed: " + error.message)
  }

  const mintCost = "5 MON"
  const isLoading = isPending || isConfirming || isMinting

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-gold/10 border-purple-600/30 shadow-lg">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="h-6 w-6 text-gold" />
          <CardTitle className="text-xl font-bold text-purple-400">Mint Membership Pass</CardTitle>
          <Trophy className="h-6 w-6 text-gold" />
        </div>
        <CardDescription className="text-purple-300">
          Mint your membership. The only membership that pays for your gym membership!
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-center mb-4">
          <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-purple-600/30 shadow-lg">
            <Image
              src="/heraklion-gym-membership-pass.png"
              alt="Heraklion Gym Membership Pass NFT"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-purple-300">Your Passes:</span>
          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
            {nftBalance ? nftBalance.toString() : "0"}
          </Badge>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-purple-300">Total Minted:</span>
          <Badge variant="secondary" className="bg-gold/20 text-gold">
            {totalSupply ? totalSupply.toString() : "0"}
          </Badge>
        </div>

        <div className="bg-black/30 rounded-lg p-4 border border-purple-600/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-300 font-medium">Mint Cost:</span>
            <span className="text-gold font-bold">{mintCost}</span>
          </div>
          <p className="text-xs text-purple-400">
            The revolutionary membership that rewards you with $GYM tokens for working out - essentially paying for
            itself!
          </p>
        </div>

        <Button
          onClick={handleMint}
          disabled={!isConnected || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-gold hover:from-purple-700 hover:to-gold/90 text-white font-bold py-3 transition-all duration-200 transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isPending ? "Confirming..." : isConfirming ? "Minting..." : "Processing..."}
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Mint Membership Pass for {mintCost}
            </>
          )}
        </Button>

        {!isConnected && (
          <p className="text-center text-sm text-purple-400">
            Connect your wallet to mint your exclusive Heraklion Gym Membership Pass
          </p>
        )}

        {hash && (
          <div className="text-center">
            <p className="text-xs text-purple-400">
              Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
