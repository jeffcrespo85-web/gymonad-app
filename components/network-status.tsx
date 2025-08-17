"use client"

import { useAccount, useBalance } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function NetworkStatus() {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Network Status</CardTitle>
          <CardDescription>Connect wallet to view network information</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Network Status
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Connected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Network</p>
          <p className="text-sm text-muted-foreground">{chain?.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Chain ID</p>
          <p className="text-sm text-muted-foreground">{chain?.id}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Balance</p>
          <p className="text-sm text-muted-foreground">
            {balance ? `${Number.parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : "Loading..."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
