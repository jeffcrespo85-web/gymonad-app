"use client"

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

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        <div
          className="text-center mb-6 sm:mb-8 relative rounded-xl overflow-hidden"
          style={{
            backgroundImage: "url(/gymonad-warriors-loading.png)",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>

          <div className="relative z-10 py-8 sm:py-12">
            <div className="absolute -left-8 sm:-left-12 lg:-left-16 top-2 sm:top-4">
              <img
                src="/gymonad-skull-logo.png"
                alt="Gymonad Skull Logo"
                className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 opacity-60 sm:opacity-80 animate-bounce hover:opacity-100 transition-all duration-300"
              />
            </div>
            <div className="absolute -right-8 sm:-right-12 lg:-right-16 top-2 sm:top-4">
              <img
                src="/gymonad-skull-logo.png"
                alt="Gymonad Skull Logo"
                className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 opacity-60 sm:opacity-80 animate-bounce hover:opacity-100 transition-all duration-300"
              />
            </div>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 uppercase tracking-wider drop-shadow-2xl px-4"
              style={{
                fontFamily: "var(--font-cinzel)",
                textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(139, 92, 246, 0.5)",
              }}
            >
              Gymonad
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-white/90 max-w-2xl mx-auto drop-shadow-lg px-4">
              Earn $GYM tokens for every workout. Connect your wallet and start your fitness journey on Monad Testnet.
            </p>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <WalletConnect />
        </div>

        <div className="mb-4 sm:mb-6">
          <StreakCounter />
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <GymTokenBalance />
          <RewardsClaimer />
          <NFTMinter />
        </div>

        <div className="mt-4 sm:mt-6">
          <WorkoutRecorder />
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <div className="bg-card rounded-lg p-4 sm:p-6 max-w-2xl mx-auto shadow-lg border border-primary relative">
            <div className="absolute -top-2 sm:-top-3 -left-2 sm:-left-3">
              <img src="/gymonad-skull-logo.png" alt="Gymonad Skull" className="h-8 w-8 sm:h-10 sm:w-10 opacity-60" />
            </div>
            <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3">
              <img src="/gymonad-skull-logo.png" alt="Gymonad Skull" className="h-8 w-8 sm:h-10 sm:w-10 opacity-60" />
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-primary">How Gymonad Works</h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-3 sm:mb-4">
              Transform your fitness routine into a rewarding Web3 experience:
            </p>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 text-left">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    1
                  </div>
                  <span className="text-xs sm:text-sm">Connect your wallet to Monad Testnet</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    2
                  </div>
                  <span className="text-xs sm:text-sm">Record your workouts to earn $GYM tokens</span>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-sm">
                    3
                  </div>
                  <span className="text-xs sm:text-sm">Build streaks for bonus rewards</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-sm">
                    4
                  </div>
                  <span className="text-xs sm:text-sm">Claim your $GYM tokens anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg p-3 sm:p-4 border border-primary">
            <p className="text-primary font-semibold text-sm sm:text-base">
              "Every workout is an investment in your health and your wallet"
            </p>
            <p className="text-xs sm:text-sm text-accent mt-1">Start earning $GYM tokens today!</p>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <div className="bg-gradient-to-br from-purple-900/30 to-gold/20 rounded-xl p-6 sm:p-8 border border-purple-600/30 shadow-2xl">
            <div className="flex justify-center mb-4">
              <img
                src="/gymonad-skull-logo.png"
                alt="Download Gymonad"
                className="h-16 w-16 sm:h-20 sm:w-20 animate-pulse"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-cinzel)" }}>
              DOWNLOAD GYMONAD
            </h2>

            <p className="text-white/90 mb-6 text-sm sm:text-base max-w-2xl mx-auto">
              Install Gymonad as a native app on your mobile device for the best fitness tracking experience
            </p>

            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "https://gymonad-app.vercel.app")}`}
                  alt="QR Code to download Gymonad"
                  className="w-32 h-32 sm:w-36 sm:h-36"
                />
                <p className="text-black text-xs mt-2 font-medium">Scan to open app</p>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto mb-6">
              <div className="bg-black/40 rounded-lg p-4 sm:p-6 border border-purple-600/20">
                <h3 className="text-lg sm:text-xl font-semibold text-purple-400 mb-3">📱 Mobile Installation</h3>
                <div className="text-left space-y-2 text-sm sm:text-base text-white/80">
                  <p>
                    <strong>iOS Safari:</strong> Tap Share → Add to Home Screen
                  </p>
                  <p>
                    <strong>Android Chrome:</strong> Tap Menu → Install App
                  </p>
                  <p>
                    <strong>Or:</strong> Look for the install prompt when you visit the app
                  </p>
                </div>
              </div>

              <div className="bg-black/40 rounded-lg p-4 sm:p-6 border border-gold/20">
                <h3 className="text-lg sm:text-xl font-semibold text-gold mb-3">🌐 Web Access</h3>
                <div className="text-left space-y-2 text-sm sm:text-base text-white/80">
                  <p>
                    <strong>QR Code:</strong> Scan with your phone camera
                  </p>
                  <p>
                    <strong>Direct Link:</strong> Visit the app URL
                  </p>
                  <p>
                    <strong>Works on:</strong> All modern browsers
                  </p>
                  <p>
                    <strong>Features:</strong> Full Web3 functionality
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href={typeof window !== "undefined" ? window.location.origin : "https://gymonad-app.vercel.app"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 sm:px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base min-h-[44px] flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                </svg>
                Open Gymonad App
              </a>

              <button
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: "Gymonad - Earn Crypto for Working Out",
                        text: "Join me on Gymonad and earn $GYM tokens for every workout!",
                        url: window.location.origin,
                      })
                    } catch (error) {
                      console.log("[v0] Share failed, falling back to clipboard:", error)
                      try {
                        await navigator.clipboard.writeText(window.location.origin)
                        alert("App link copied to clipboard!")
                      } catch (clipboardError) {
                        console.log("[v0] Clipboard also failed:", clipboardError)
                        alert(`Share this link: ${window.location.origin}`)
                      }
                    }
                  } else {
                    try {
                      await navigator.clipboard.writeText(window.location.origin)
                      alert("App link copied to clipboard!")
                    } catch (clipboardError) {
                      alert(`Share this link: ${window.location.origin}`)
                    }
                  }
                }}
                className="bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-black font-bold py-3 px-6 sm:px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base min-h-[44px] flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7l8.05-4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                </svg>
                Share App
              </button>
            </div>

            <p className="text-xs sm:text-sm text-white/60 mt-4">
              Progressive Web App • Works Offline • Native App Experience
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 border-t border-purple-600/20 pt-6 sm:pt-8">
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 opacity-60">
            <img
              src="/gymonad-skull-logo.png"
              alt="Gymonad Brand"
              className="h-8 sm:h-10 hover:opacity-100 transition-opacity"
            />
            <img
              src="/gymonad-skull-logo.png"
              alt="Gymonad Brand"
              className="h-8 sm:h-10 hover:opacity-100 transition-opacity"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mt-4 sm:mt-6">
            <a
              href="https://x.com/Gymonad"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium text-sm sm:text-base min-h-[44px] px-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X.com/Gymonad
            </a>
            <div className="w-6 h-px sm:w-px sm:h-6 bg-purple-600/30"></div>
            <a
              href="https://Gymonad-app.nad"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors font-medium text-sm sm:text-base min-h-[44px] px-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Gymonad-app.nad
            </a>
          </div>

          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 px-4">
            Powered by our amazing partners and the Monad ecosystem
          </p>
        </div>
      </div>
    </div>
  )
}
