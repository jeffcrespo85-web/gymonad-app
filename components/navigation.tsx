"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Activity, Wallet, Gamepad2, Video, TrendingUp } from "lucide-react"
import { audioController } from "@/lib/audio-controller"

const navigationItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/workout", label: "Workout", icon: Activity },
  { href: "/live", label: "Live", icon: Video },
  { href: "/token", label: "$GYM", icon: TrendingUp },
  { href: "/nft", label: "NFT", icon: Gamepad2 },
  { href: "/wallet", label: "Wallet", icon: Wallet },
]

export function Navigation() {
  const pathname = usePathname()

  const handleNavClick = () => {
    audioController.playSwordClash()
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-purple-500/30 z-50">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive
                  ? "text-yellow-400 bg-purple-600/20"
                  : "text-purple-200 hover:text-yellow-300 hover:bg-purple-600/10"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
