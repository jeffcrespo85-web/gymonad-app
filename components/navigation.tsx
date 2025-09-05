"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Activity, MapPin, Trophy, Wallet, Gamepad2 } from "lucide-react"

const navigationItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/steps", label: "Steps", icon: Activity },
  { href: "/workout", label: "Workout", icon: MapPin },
  { href: "/lottery", label: "Lottery", icon: Trophy },
  { href: "/nft", label: "NFT", icon: Gamepad2 },
  { href: "/wallet", label: "Wallet", icon: Wallet },
]

export function Navigation() {
  const pathname = usePathname()

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
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive
                  ? "text-yellow-400 bg-purple-600/20"
                  : "text-purple-300 hover:text-yellow-300 hover:bg-purple-600/10"
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
