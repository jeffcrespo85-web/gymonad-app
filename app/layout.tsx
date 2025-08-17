import type React from "react"
import type { Metadata, Viewport } from "next"
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
  description:
    "Earn $GYM tokens for working out on Monad Testnet. The only membership that pays for your gym membership!",
  generator: "v0.app",
  applicationName: "Gymonad",
  keywords: ["fitness", "web3", "crypto", "gym", "workout", "tokens", "monad", "blockchain"],
  authors: [{ name: "Gymonad Team" }],
  creator: "Gymonad",
  publisher: "Gymonad",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://gymonad-app.nad"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Gymonad - Web3 Fitness App",
    description: "Earn $GYM tokens for working out on Monad Testnet",
    url: "https://gymonad-app.nad",
    siteName: "Gymonad",
    images: [
      {
        url: "/gymonad-warriors-loading.png",
        width: 1200,
        height: 630,
        alt: "Gymonad Warriors",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gymonad - Web3 Fitness App",
    description: "Earn $GYM tokens for working out on Monad Testnet",
    creator: "@Gymonad",
    images: ["/gymonad-warriors-loading.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gymonad",
  },
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8b5cf6" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Gymonad" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#8b5cf6" />

        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-cinzel: ${cinzel.variable};
}
        `}</style>
      </head>
      <body className={`${cinzel.variable} touch-manipulation`} suppressHydrationWarning>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  )
}
