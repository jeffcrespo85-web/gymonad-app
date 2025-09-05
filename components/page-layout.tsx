"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "./navigation"

interface PageLayoutProps {
  children: React.ReactNode
  showSkulls?: boolean
}

export function PageLayout({ children, showSkulls = true }: PageLayoutProps) {
  const [isLightning, setIsLightning] = useState(false)

  useEffect(() => {
    const triggerLightning = () => {
      setIsLightning(true)

      // Play thunder sound
      const thunder = new Audio("/gymonad-assets/thunder.mp3")
      thunder.volume = 0.3
      thunder.play().catch(() => {})

      setTimeout(() => setIsLightning(false), 200)
    }

    const lightningInterval = setInterval(
      () => {
        if (Math.random() < 0.3) {
          triggerLightning()
        }
      },
      Math.random() * 10000 + 8000,
    )

    return () => clearInterval(lightningInterval)
  }, [])

  return (
    <div className={`min-h-screen bg-black relative overflow-hidden ${isLightning ? "bg-white" : ""}`}>
      {/* Purple smoke and cloud effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div
            className="absolute top-10 left-10 w-64 h-64 rounded-full opacity-30 animate-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, rgba(147, 51, 234, 0.1) 50%, transparent 100%)",
              animation: "float 8s ease-in-out infinite, fade 6s ease-in-out infinite alternate",
            }}
          />
          <div
            className="absolute top-32 right-16 w-48 h-48 rounded-full opacity-25 animate-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(168, 85, 247, 0.1) 50%, transparent 100%)",
              animation: "float 10s ease-in-out infinite reverse, fade 8s ease-in-out infinite alternate-reverse",
              animationDelay: "2s",
            }}
          />
          <div
            className="absolute bottom-20 left-1/4 w-72 h-72 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, rgba(124, 58, 237, 0.6) 0%, rgba(124, 58, 237, 0.1) 50%, transparent 100%)",
              animation: "float 12s ease-in-out infinite, fade 10s ease-in-out infinite alternate",
              animationDelay: "4s",
            }}
          />
          <div
            className="absolute bottom-32 right-8 w-56 h-56 rounded-full opacity-35"
            style={{
              background:
                "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)",
              animation: "float 9s ease-in-out infinite reverse, fade 7s ease-in-out infinite alternate-reverse",
              animationDelay: "1s",
            }}
          />
        </div>
      </div>

      {/* Lightning effects */}
      {isLightning && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M20,10 L30,40 L25,40 L35,90 L25,50 L30,50 L20,10"
              fill="white"
              className="animate-pulse"
              style={{ filter: "drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #a855f7)" }}
            />
            <path
              d="M70,5 L80,35 L75,35 L85,85 L75,45 L80,45 L70,5"
              fill="white"
              className="animate-pulse"
              style={{ filter: "drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #a855f7)" }}
            />
          </svg>
        </div>
      )}

      {/* Glowing skulls positioned around the layout */}
      {showSkulls && (
        <>
          <div className="absolute left-8 top-32 w-20 h-20 opacity-80">
            <img
              src="/images/purple-skull.png"
              alt="Purple Skull"
              className="w-full h-full"
              style={{
                filter: "brightness(1.3) contrast(1.2) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #7c3aed)",
                animation: "skullGlow 3s ease-in-out infinite alternate",
              }}
            />
          </div>
          <div className="absolute right-8 top-32 w-20 h-20 opacity-80">
            <img
              src="/images/purple-skull.png"
              alt="Purple Skull"
              className="w-full h-full"
              style={{
                filter: "brightness(1.3) contrast(1.2) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #7c3aed)",
                animation: "skullGlow 3s ease-in-out infinite alternate",
                animationDelay: "1s",
              }}
            />
          </div>
          <div className="absolute left-8 bottom-32 w-20 h-20 opacity-80">
            <img
              src="/images/purple-skull.png"
              alt="Purple Skull"
              className="w-full h-full"
              style={{
                filter: "brightness(1.3) contrast(1.2) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #7c3aed)",
                animation: "skullGlow 3s ease-in-out infinite alternate",
                animationDelay: "2s",
              }}
            />
          </div>
          <div className="absolute right-8 bottom-32 w-20 h-20 opacity-80">
            <img
              src="/images/purple-skull.png"
              alt="Purple Skull"
              className="w-full h-full"
              style={{
                filter: "brightness(1.3) contrast(1.2) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #7c3aed)",
                animation: "skullGlow 3s ease-in-out infinite alternate",
                animationDelay: "1.5s",
              }}
            />
          </div>
          <div className="absolute left-16 top-1/2 w-20 h-20 opacity-80">
            <img
              src="/images/purple-skull.png"
              alt="Purple Skull"
              className="w-full h-full"
              style={{
                filter: "brightness(1.3) contrast(1.2) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #7c3aed)",
                animation: "skullGlow 3s ease-in-out infinite alternate",
                animationDelay: "0.5s",
              }}
            />
          </div>
          <div className="absolute right-16 top-1/2 w-20 h-20 opacity-80">
            <img
              src="/images/purple-skull.png"
              alt="Purple Skull"
              className="w-full h-full"
              style={{
                filter: "brightness(1.3) contrast(1.2) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #7c3aed)",
                animation: "skullGlow 3s ease-in-out infinite alternate",
                animationDelay: "2.5s",
              }}
            />
          </div>
        </>
      )}

      {/* Main content with bottom padding for navigation */}
      <div className="relative z-20 pb-20">{children}</div>

      {/* Bottom navigation */}
      <Navigation />

      <style jsx>{`
        @keyframes skullGlow {
          0% { 
            filter: brightness(1.3) contrast(1.2) drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #7c3aed);
          }
          100% { 
            filter: brightness(1.6) contrast(1.4) drop-shadow(0 0 25px #a855f7) drop-shadow(0 0 50px #7c3aed) drop-shadow(0 0 75px #8b5cf6);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-5px); }
          75% { transform: translateY(-30px) translateX(15px); }
        }
        
        @keyframes fade {
          0% { opacity: 0.1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
