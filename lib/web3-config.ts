import { createConfig, http } from "wagmi"
import { injected } from "wagmi/connectors"

// Monad Testnet configuration
export const monadTestnet = {
  id: 41454,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet1.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet1.monad.xyz",
    },
  },
  testnet: true,
} as const

export const config = createConfig({
  chains: [monadTestnet],
  connectors: [injected()],
  transports: {
    [monadTestnet.id]: http(),
  },
  ssr: false, // Disable SSR to prevent server-side issues
})
