import { GymTokenSystem } from "./gym-token-system"

export interface PaymentTransaction {
  id: string
  fromAddress: string
  toAddress: string
  amount: number
  type: "tip" | "session_payment" | "subscription"
  status: "pending" | "completed" | "failed"
  timestamp: Date
  txHash?: string
  metadata?: {
    trainerId?: string
    streamId?: string
    sessionId?: string
    message?: string
  }
}

export interface WalletBalance {
  gymTokens: number
  monadBalance: number
  usdValue: number
}

export class PaymentSystem {
  private static readonly TRANSACTIONS_KEY = "gymonad_transactions"
  private static readonly PENDING_TIPS_KEY = "gymonad_pending_tips"

  static async sendTip(
    fromAddress: string,
    toTrainerAddress: string,
    amount: number,
    streamId: string,
    trainerId: string,
    message?: string,
  ): Promise<PaymentTransaction> {
    // Check if user has sufficient balance
    const userBalance = GymTokenSystem.getTokenBalance(fromAddress)
    if (userBalance < amount) {
      throw new Error("Insufficient $GYM token balance")
    }

    // Create transaction record
    const transaction: PaymentTransaction = {
      id: `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromAddress,
      toAddress: toTrainerAddress,
      amount,
      type: "tip",
      status: "pending",
      timestamp: new Date(),
      metadata: {
        trainerId,
        streamId,
        message,
      },
    }

    // Simulate blockchain transaction delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    try {
      // Deduct tokens from sender
      const senderNewBalance = GymTokenSystem.getTokenBalance(fromAddress) - amount
      localStorage.setItem(`gymonad_gym_tokens_${fromAddress}`, senderNewBalance.toString())

      // Add tokens to trainer
      GymTokenSystem.addTokens(toTrainerAddress, amount)

      // Mark transaction as completed
      transaction.status = "completed"
      transaction.txHash = `0x${Math.random().toString(16).substr(2, 64)}`

      // Store transaction
      this.storeTransaction(transaction)

      return transaction
    } catch (error) {
      transaction.status = "failed"
      this.storeTransaction(transaction)
      throw error
    }
  }

  static async payForSession(
    fromAddress: string,
    toTrainerAddress: string,
    amount: number,
    sessionId: string,
    trainerId: string,
  ): Promise<PaymentTransaction> {
    const userBalance = GymTokenSystem.getTokenBalance(fromAddress)
    if (userBalance < amount) {
      throw new Error("Insufficient $GYM token balance")
    }

    const transaction: PaymentTransaction = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromAddress,
      toAddress: toTrainerAddress,
      amount,
      type: "session_payment",
      status: "pending",
      timestamp: new Date(),
      metadata: {
        trainerId,
        sessionId,
      },
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      // Process payment
      const senderNewBalance = GymTokenSystem.getTokenBalance(fromAddress) - amount
      localStorage.setItem(`gymonad_gym_tokens_${fromAddress}`, senderNewBalance.toString())
      GymTokenSystem.addTokens(toTrainerAddress, amount)

      transaction.status = "completed"
      transaction.txHash = `0x${Math.random().toString(16).substr(2, 64)}`
      this.storeTransaction(transaction)

      return transaction
    } catch (error) {
      transaction.status = "failed"
      this.storeTransaction(transaction)
      throw error
    }
  }

  static getWalletBalance(address: string): WalletBalance {
    const gymTokens = GymTokenSystem.getTokenBalance(address)
    // Mock Monad balance and USD conversion
    const monadBalance = Math.random() * 100
    const usdValue = gymTokens * 0.1 + monadBalance * 2.5

    return {
      gymTokens,
      monadBalance: Number.parseFloat(monadBalance.toFixed(4)),
      usdValue: Number.parseFloat(usdValue.toFixed(2)),
    }
  }

  static getTransactionHistory(address: string): PaymentTransaction[] {
    const transactions = this.getAllTransactions()
    return transactions
      .filter((tx) => tx.fromAddress === address || tx.toAddress === address)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  static getTrainerEarnings(trainerAddress: string): {
    totalEarnings: number
    tipsReceived: number
    sessionsCompleted: number
    recentTransactions: PaymentTransaction[]
  } {
    const transactions = this.getAllTransactions().filter(
      (tx) => tx.toAddress === trainerAddress && tx.status === "completed",
    )

    const totalEarnings = transactions.reduce((sum, tx) => sum + tx.amount, 0)
    const tipsReceived = transactions.filter((tx) => tx.type === "tip").length
    const sessionsCompleted = transactions.filter((tx) => tx.type === "session_payment").length

    return {
      totalEarnings,
      tipsReceived,
      sessionsCompleted,
      recentTransactions: transactions.slice(0, 10),
    }
  }

  private static storeTransaction(transaction: PaymentTransaction) {
    const transactions = this.getAllTransactions()
    transactions.push(transaction)
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions))
  }

  private static getAllTransactions(): PaymentTransaction[] {
    const stored = localStorage.getItem(this.TRANSACTIONS_KEY)
    if (!stored) return []

    return JSON.parse(stored).map((tx: any) => ({
      ...tx,
      timestamp: new Date(tx.timestamp),
    }))
  }

  static getQuickTipAmounts(): number[] {
    return [5, 10, 25, 50, 100]
  }

  static formatTokenAmount(amount: number): string {
    return `${amount.toLocaleString()} $GYM`
  }

  static formatUSDAmount(amount: number): string {
    return `$${amount.toFixed(2)}`
  }
}
