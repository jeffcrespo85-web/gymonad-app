import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Cinzel } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/components/web3-provider"

const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
})

export const metadata: Metadata = {
  title: "Gymonad - Web3 Fitness App",
  description: "Earn $GYM tokens for working out on Monad Testnet",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-cinzel: ${cinzel.variable};
}
        `}</style>
      </head>
      <body className={`${cinzel.variable}`}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  )
}
