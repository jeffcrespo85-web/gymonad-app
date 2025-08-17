"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SoundEffects } from "@/lib/sound-effects"

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const handleDisconnect = () => {
    SoundEffects.playWalletConnect()
    disconnect()
  }

  const handleConnect = (connector: any) => {
    SoundEffects.playWalletConnect()
    connect({ connector })
  }

  if (isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Wallet Connected
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {chain?.name}
            </Badge>
          </CardTitle>
          <CardDescription>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDisconnect} variant="outline" className="w-full bg-transparent">
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Connect Wallet</CardTitle>
        <CardDescription>Connect your wallet to start earning $GYM tokens for workouts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => handleConnect(connector)}
            disabled={isPending}
            variant="outline"
            className="w-full"
          >
            {isPending ? "Connecting..." : `Connect ${connector.name}`}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
