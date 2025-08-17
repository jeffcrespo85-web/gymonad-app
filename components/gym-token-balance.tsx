"use client"

import { useAccount, useReadContract } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GYM_TOKEN_ABI, GYM_TOKEN_ADDRESS } from "@/lib/gym-token-abi"
import { formatEther } from "viem"

export function GymTokenBalance() {
  const { address, isConnected } = useAccount()

  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
  } = useReadContract({
    address: GYM_TOKEN_ADDRESS,
    abi: GYM_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  const { data: pendingRewards, isLoading: rewardsLoading } = useReadContract({
    address: GYM_TOKEN_ADDRESS,
    abi: GYM_TOKEN_ABI,
    functionName: "getPendingRewards",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 5000,
    },
  })

  const { data: streak } = useReadContract({
    address: GYM_TOKEN_ADDRESS,
    abi: GYM_TOKEN_ABI,
    functionName: "getWorkoutStreak",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 30000,
    },
  })

  if (!isConnected) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Connect wallet to view balance</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-primary">$GYM Balance</span>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {streak ? `${streak.toString()} day streak` : "No streak"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-3xl font-bold text-primary">
            {balanceLoading ? (
              <div className="animate-pulse bg-muted h-8 w-24 rounded"></div>
            ) : balanceError ? (
              <span className="text-destructive text-sm">Error loading balance</span>
            ) : balance ? (
              `${Number.parseFloat(formatEther(balance)).toFixed(2)} $GYM`
            ) : (
              "0.00 $GYM"
            )}
          </div>
          <p className="text-sm text-muted-foreground">Current Balance</p>
        </div>

        <div className="pt-2 border-t border-primary/10">
          <div className="text-lg font-semibold text-accent">
            {rewardsLoading ? (
              <div className="animate-pulse bg-muted h-6 w-20 rounded"></div>
            ) : pendingRewards ? (
              `+${Number.parseFloat(formatEther(pendingRewards)).toFixed(2)} $GYM`
            ) : (
              "+0.00 $GYM"
            )}
          </div>
          <p className="text-sm text-muted-foreground">Pending Rewards</p>
        </div>
      </CardContent>
    </Card>
  )
}
