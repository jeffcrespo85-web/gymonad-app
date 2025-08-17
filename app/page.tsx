import { WalletConnect } from "@/components/wallet-connect"
import { GymTokenBalance } from "@/components/gym-token-balance"
import { WorkoutRecorder } from "@/components/workout-recorder"
import { RewardsClaimer } from "@/components/rewards-claimer"
import { StreakCounter } from "@/components/streak-counter"
import { BackgroundMusic } from "@/components/background-music"
import { NFTMinter } from "@/components/nft-minter"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <BackgroundMusic />

      <div className="w-full bg-gradient-to-r from-purple-900/20 to-gold/20 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <img
            src="/sponsor-logo-left.png"
            alt="Sponsor Logo"
            className="h-10 opacity-80 hover:opacity-100 transition-opacity"
          />
          <img
            src="/partner-logo-center.png"
            alt="Partner Logo"
            className="h-10 opacity-80 hover:opacity-100 transition-opacity"
          />
          <img
            src="/placeholder-fzaj1.png"
            alt="Sponsor Logo"
            className="h-10 opacity-80 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div
          className="text-center mb-8 relative rounded-xl overflow-hidden"
          style={{
            backgroundImage: "url(/gymonad-gym-background.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>

          <div className="relative z-10 py-12">
            <div className="absolute -left-16 top-4 hidden lg:block">
              <img
                src="/gymonad-skull-logo.png"
                alt="Gymonad Skull Logo"
                className="h-16 w-16 opacity-80 animate-bounce hover:opacity-100 transition-all duration-300"
              />
            </div>
            <div className="absolute -right-16 top-4 hidden lg:block">
              <img
                src="/gymonad-skull-logo.png"
                alt="Gymonad Skull Logo"
                className="h-16 w-16 opacity-80 animate-bounce hover:opacity-100 transition-all duration-300"
              />
            </div>

            <h1
              className="text-6xl font-bold text-white mb-4 uppercase tracking-wider drop-shadow-2xl"
              style={{
                fontFamily: "var(--font-cinzel)",
                textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(139, 92, 246, 0.5)",
              }}
            >
              Gymonad
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow-lg">
              Earn $GYM tokens for every workout. Connect your wallet and start your fitness journey on Monad Testnet.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <WalletConnect />
        </div>

        <div className="mb-6">
          <StreakCounter />
        </div>

        <div className="flex justify-center items-center gap-8 mb-6 py-4">
          <img
            src="/monad-blockchain-logo.png"
            alt="Monad Logo"
            className="h-12 opacity-70 hover:opacity-100 transition-opacity"
          />
          <div className="w-px h-8 bg-purple-600/30"></div>
          <img
            src="/web3-fitness-logo.png"
            alt="Web3 Fitness"
            className="h-12 opacity-70 hover:opacity-100 transition-opacity"
          />
          <div className="w-px h-8 bg-purple-600/30"></div>
          <img
            src="/crypto-rewards-logo.png"
            alt="Crypto Rewards"
            className="h-12 opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <GymTokenBalance />
          <RewardsClaimer />
          <NFTMinter />
        </div>

        <div className="mt-6">
          <WorkoutRecorder />
        </div>

        <div className="mt-12 text-center">
          <div className="bg-card rounded-lg p-6 max-w-2xl mx-auto shadow-lg border border-primary relative">
            <div className="absolute -top-3 -left-3">
              <img src="/gymonad-skull-logo.png" alt="Gymonad Skull" className="h-10 w-10 opacity-60" />
            </div>
            <div className="absolute -top-3 -right-3">
              <img src="/gymonad-skull-logo.png" alt="Gymonad Skull" className="h-10 w-10 opacity-60" />
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-primary">How Gymonad Works</h2>
            <p className="text-muted-foreground mb-4">
              Transform your fitness routine into a rewarding Web3 experience:
            </p>
            <div className="grid gap-4 md:grid-cols-2 text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <span className="text-sm">Connect your wallet to Monad Testnet</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <span className="text-sm">Record your workouts to earn $GYM tokens</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold">
                    3
                  </div>
                  <span className="text-sm">Build streaks for bonus rewards</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold">
                    4
                  </div>
                  <span className="text-sm">Claim your $GYM tokens anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg p-4 border border-primary">
            <p className="text-primary font-semibold">
              "Every workout is an investment in your health and your wallet"
            </p>
            <p className="text-sm text-accent mt-1">Start earning $GYM tokens today!</p>
          </div>
        </div>

        <div className="mt-12 border-t border-purple-600/20 pt-8">
          <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
            <img
              src="/gymonad-skull-logo.png"
              alt="Gymonad Brand"
              className="h-10 hover:opacity-100 transition-opacity"
            />
            <img src="/partner-logo-2.png" alt="Partner 2" className="h-8 hover:opacity-100 transition-opacity" />
            <img
              src="/partner-logo-abstract-geometric.png"
              alt="Partner 3"
              className="h-8 hover:opacity-100 transition-opacity"
            />
            <img
              src="/gymonad-skull-logo.png"
              alt="Gymonad Brand"
              className="h-10 hover:opacity-100 transition-opacity"
            />
          </div>

          <div className="flex justify-center items-center gap-8 mt-6">
            <a
              href="https://x.com/Gymonad"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X.com/Gymonad
            </a>
            <div className="w-px h-6 bg-purple-600/30"></div>
            <a
              href="https://Gymonad-app.nad"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Gymonad-app.nad
            </a>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Powered by our amazing partners and the Monad ecosystem
          </p>
        </div>
      </div>
    </div>
  )
}
