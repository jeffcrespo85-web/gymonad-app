"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PaymentSystem } from "@/lib/payment-system"
import { GymTokenSystem } from "@/lib/gym-token-system"
import { Gift, DollarSign, Loader2, CheckCircle, XCircle } from "lucide-react"

interface TipModalProps {
  isOpen: boolean
  onClose: () => void
  trainerName: string
  trainerId: string
  trainerAddress: string
  streamId?: string
  userAddress: string
  onTipSent?: (amount: number, message: string) => void
}

export function TipModal({
  isOpen,
  onClose,
  trainerName,
  trainerId,
  trainerAddress,
  streamId,
  userAddress,
  onTipSent,
}: TipModalProps) {
  const [customAmount, setCustomAmount] = useState("")
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const userBalance = GymTokenSystem.getTokenBalance(userAddress)
  const quickAmounts = PaymentSystem.getQuickTipAmounts()

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount(null)
  }

  const getFinalAmount = (): number => {
    if (selectedAmount) return selectedAmount
    return Number.parseInt(customAmount) || 0
  }

  const handleSendTip = async () => {
    const amount = getFinalAmount()
    if (amount <= 0) return

    setIsProcessing(true)
    setTransactionStatus("idle")
    setErrorMessage("")

    try {
      await PaymentSystem.sendTip(userAddress, trainerAddress, amount, streamId || "", trainerId, message)

      setTransactionStatus("success")
      onTipSent?.(amount, message)

      // Reset form after success
      setTimeout(() => {
        setSelectedAmount(null)
        setCustomAmount("")
        setMessage("")
        setTransactionStatus("idle")
        onClose()
      }, 2000)
    } catch (error) {
      setTransactionStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to send tip")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-card border-border w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Gift className="w-5 h-5 text-accent" />
            Send Tip to {trainerName}
          </CardTitle>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Balance:</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <DollarSign className="w-3 h-3 mr-1" />
              {userBalance} $GYM
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {transactionStatus === "success" && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Tip sent successfully!</span>
            </div>
          )}

          {transactionStatus === "error" && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{errorMessage}</span>
            </div>
          )}

          {transactionStatus === "idle" && (
            <>
              {/* Quick Amount Buttons */}
              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">Quick Amounts</label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAmountSelect(amount)}
                      disabled={amount > userBalance}
                      className={
                        selectedAmount === amount ? "bg-accent hover:bg-accent/90" : "bg-transparent hover:bg-accent/10"
                      }
                    >
                      {amount} $GYM
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">Custom Amount</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  min="1"
                  max={userBalance}
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">Message (optional)</label>
                <Input
                  placeholder="Great workout! Keep it up!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={100}
                />
                <div className="text-xs text-muted-foreground mt-1">{message.length}/100 characters</div>
              </div>

              {/* Amount Preview */}
              {getFinalAmount() > 0 && (
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-card-foreground">Tip Amount:</span>
                    <span className="font-bold text-accent">{PaymentSystem.formatTokenAmount(getFinalAmount())}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>USD Value:</span>
                    <span>{PaymentSystem.formatUSDAmount(getFinalAmount() * 0.1)}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isProcessing} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSendTip}
              disabled={
                isProcessing ||
                getFinalAmount() <= 0 ||
                getFinalAmount() > userBalance ||
                transactionStatus === "success"
              }
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Send Tip
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
