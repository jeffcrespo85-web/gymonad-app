"use client"

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GYM_TOKEN_ABI, GYM_TOKEN_ADDRESS } from "@/lib/gym-token-abi"
import { formatEther } from "viem"
import { toast } from "sonner"
import { SoundEffects } from "@/lib/sound-effects"

export function RewardsClaimer() {
  const { address, isConnected } = useAccount()

  const {
    data: pendingRewards,
    isLoading: rewardsLoading,
    refetch,
  } = useReadContract({
    address: GYM_TOKEN_ADDRESS,
    abi: GYM_TOKEN_ABI,
    functionName: "getPendingRewards",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 5000,
    },
  })

  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: {
      onSuccess: () => {
        refetch() // Refresh pending rewards after successful claim
      },
    },
  })

  const handleClaim = async () => {
    if (!address) {
      toast.error("Wallet not connected")
      return
    }

    if (!pendingRewards || pendingRewards === 0n) {
      toast.error("No rewards to claim")
      return
    }

    try {
      console.log("[v0] Claiming rewards for address:", address)

      SoundEffects.playRewardsClaim()

      writeContract({
        address: GYM_TOKEN_ADDRESS,
        abi: GYM_TOKEN_ABI,
        functionName: "claimRewards",
      })

      toast.loading("Claiming rewards...", { id: "claim-tx" })
    } catch (err) {
      console.error("[v0] Claim error:", err)
      toast.error("Failed to claim rewards")
    }
  }

  // Handle transaction status changes
  if (isConfirming) {
    toast.loading("Confirming claim on blockchain...", { id: "claim-tx" })
  }

  if (isSuccess) {
    toast.success("Rewards claimed successfully!", { id: "claim-tx" })
  }

  if (error) {
    toast.error(`Claim failed: ${error.message}`, { id: "claim-tx" })
  }

  if (!isConnected) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Connect wallet to claim rewards</p>
        </CardContent>
      </Card>
    )
  }

  const rewardAmount = pendingRewards ? Number.parseFloat(formatEther(pendingRewards)) : 0
  const hasRewards = rewardAmount > 0

  return (
    <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
      <CardHeader>
        <CardTitle className="text-accent">Claim Rewards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-accent mb-2">
            {rewardsLoading ? (
              <div className="animate-pulse bg-muted h-8 w-24 mx-auto rounded"></div>
            ) : (
              `${rewardAmount.toFixed(2)} $GYM`
            )}
          </div>
          <p className="text-sm text-muted-foreground">Available to Claim</p>
        </div>

        <Button
          onClick={handleClaim}
          className="w-full bg-accent hover:bg-accent/90"
          disabled={!hasRewards || isPending || isConfirming || rewardsLoading}
        >
          {isPending || isConfirming ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {isPending ? "Claiming..." : "Confirming..."}
            </div>
          ) : !hasRewards ? (
            "No Rewards Available"
          ) : (
            `Claim ${rewardAmount.toFixed(2)} $GYM`
          )}
        </Button>

        {!hasRewards && !rewardsLoading && (
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Complete workouts to earn $GYM tokens!</p>
          </div>
        )}

        {hasRewards && (
          <div className="text-center p-3 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm text-accent font-medium">🎉 Great job! You've earned rewards from your workouts.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
