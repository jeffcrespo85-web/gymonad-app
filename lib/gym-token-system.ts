export interface GymTokenUser {
  address: string
  tokens: number
  totalSteps: number
  milestonesAchieved: number
  lastActive: string
  rank: number
}

export class GymTokenSystem {
  private static readonly STORAGE_KEY = "gymonad_gym_tokens"
  private static readonly LEADERBOARD_KEY = "gymonad_leaderboard"

  static getTokenBalance(address: string): number {
    const tokens = localStorage.getItem(`${this.STORAGE_KEY}_${address}`)
    return tokens ? Number.parseInt(tokens) : 0
  }

  static addTokens(address: string, amount: number): number {
    const currentBalance = this.getTokenBalance(address)
    const newBalance = currentBalance + amount
    localStorage.setItem(`${this.STORAGE_KEY}_${address}`, newBalance.toString())

    // Update leaderboard
    this.updateLeaderboard(address, amount)

    return newBalance
  }

  static updateLeaderboard(address: string, tokensEarned: number) {
    const leaderboard = this.getLeaderboard()
    const existingUser = leaderboard.find((user) => user.address === address)

    if (existingUser) {
      existingUser.tokens += tokensEarned
      existingUser.lastActive = new Date().toISOString()
      if (tokensEarned === 10) {
        existingUser.milestonesAchieved += 1
      }
    } else {
      leaderboard.push({
        address,
        tokens: tokensEarned,
        totalSteps: 0,
        milestonesAchieved: tokensEarned === 10 ? 1 : 0,
        lastActive: new Date().toISOString(),
        rank: 0,
      })
    }

    // Sort by tokens and assign ranks
    leaderboard.sort((a, b) => b.tokens - a.tokens)
    leaderboard.forEach((user, index) => {
      user.rank = index + 1
    })

    localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(leaderboard))
  }

  static getLeaderboard(): GymTokenUser[] {
    const leaderboard = localStorage.getItem(this.LEADERBOARD_KEY)
    return leaderboard ? JSON.parse(leaderboard) : []
  }

  static getUserRank(address: string): number {
    const leaderboard = this.getLeaderboard()
    const user = leaderboard.find((user) => user.address === address)
    return user ? user.rank : 0
  }
}
