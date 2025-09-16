export interface WalletAdapter {
  name: string
  icon: string
  connect: () => Promise<string>
  disconnect: () => Promise<void>
  isInstalled: () => boolean
}

const MONAD_TESTNET_RPC_URLS = [
  "https://testnet-rpc.monad.xyz", // Primary official RPC
  "https://rpc.ankr.com/monad_testnet", // Ankr fallback
  "https://monad-testnet.drpc.org", // dRPC fallback
  "https://monad-testnet.blockdaemon.com", // Blockdaemon fallback
]

const MONAD_TESTNET_CONFIG = {
  chainId: "0x279F", // 10143 in hex (correct chain ID)
  chainName: "Monad Testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: MONAD_TESTNET_RPC_URLS,
  blockExplorerUrls: ["https://testnet.monadexplorer.com"],
}

async function switchToMonadTestnet(ethereum: any): Promise<void> {
  try {
    if (!ethereum || !ethereum.request) {
      throw new Error("Invalid Ethereum provider - cannot switch networks")
    }

    // First, try to switch to the network (in case it already exists)
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
      })
      console.log(`[v0] Successfully switched to existing Monad testnet`)
      return
    } catch (switchError: any) {
      // Handle various error cases that indicate the chain needs to be added
      const needsToAddChain =
        switchError.code === 4902 || // Standard "chain not added" error
        switchError.message?.includes("not connected to the requested chain") || // Provider connection error
        switchError.message?.includes("Unrecognized chain ID") || // Chain not recognized
        switchError.message?.includes("does not exist") // Chain doesn't exist

      if (!needsToAddChain) {
        // For user rejection or other non-chain-related errors, throw them
        if (switchError.code === 4001) {
          throw new Error("User rejected the network switch request")
        }
        throw switchError
      }
      // Continue to add the network for all chain-related errors
    }

    // Try each RPC URL until one works for adding the network
    let lastError: any = null
    for (let i = 0; i < MONAD_TESTNET_RPC_URLS.length; i++) {
      const rpcUrl = MONAD_TESTNET_RPC_URLS[i]
      const configWithSingleRpc = {
        ...MONAD_TESTNET_CONFIG,
        rpcUrls: [rpcUrl], // Try one RPC at a time
      }

      try {
        // Add the network (this automatically switches to it)
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [configWithSingleRpc],
        })

        console.log(`[v0] Successfully added and switched to Monad testnet using RPC: ${rpcUrl}`)
        return
      } catch (error: any) {
        lastError = error
        console.log(`[v0] RPC ${rpcUrl} failed, trying next fallback:`, error.message)

        // If user rejected, don't try other RPCs
        if (error.code === 4001) {
          throw new Error("User rejected the network addition request")
        }

        // Continue to next RPC if this one failed
        continue
      }
    }

    // If all RPCs failed, throw a meaningful error
    if (lastError) {
      const errorMessage = lastError.message || lastError.toString() || "Network connection error"
      throw new Error(
        `Failed to add Monad testnet: ${errorMessage}. Please check your internet connection and try again.`,
      )
    }

    throw new Error("Unable to add Monad testnet. Please check your internet connection.")
  } catch (error: any) {
    // Re-throw the error with context
    throw error
  }
}

export class MetaMaskWallet implements WalletAdapter {
  name = "MetaMask"
  icon = "🦊"

  isInstalled(): boolean {
    return typeof window !== "undefined" && "ethereum" in window && window.ethereum?.isMetaMask
  }

  async connect(): Promise<string> {
    try {
      if (!this.isInstalled()) {
        throw new Error("MetaMask not installed")
      }

      if (!window.ethereum) {
        throw new Error("Ethereum provider not found")
      }

      if (!window.ethereum.request) {
        throw new Error("Invalid MetaMask provider - missing request method")
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found in MetaMask")
      }

      // Now switch to Monad testnet after we have account access
      await switchToMonadTestnet(window.ethereum)
      return accounts[0]
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("User rejected the connection request")
      }
      if (error.code === -32002) {
        throw new Error("MetaMask is already processing a request. Please check your wallet.")
      }
      if (error.message) {
        throw new Error(error.message)
      }
      throw new Error(`MetaMask connection failed: ${error.toString() || "Unknown error"}`)
    }
  }

  async disconnect(): Promise<void> {
    console.log("MetaMask disconnect requested")
  }
}

export class PhantomWallet implements WalletAdapter {
  name = "Phantom"
  icon = "👻"

  isInstalled(): boolean {
    return typeof window !== "undefined" && "phantom" in window && window.phantom?.ethereum
  }

  async connect(): Promise<string> {
    try {
      if (!this.isInstalled()) {
        throw new Error("Phantom wallet not installed")
      }

      const phantom = window.phantom?.ethereum
      if (!phantom) {
        throw new Error("Phantom Ethereum provider not found")
      }

      // Request account access
      const accounts = await phantom.request({ method: "eth_requestAccounts" })
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found in Phantom")
      }

      // Try to switch to Monad testnet, but handle gracefully if unsupported
      try {
        await switchToMonadTestnet(phantom)
        console.log("[v0] Successfully connected to Phantom with Monad testnet")
      } catch (networkError: any) {
        // If network switching fails, provide helpful message but still allow connection
        console.log("[v0] Phantom network switch failed, using default network:", networkError.message)

        // Check if we're on a supported network (Ethereum mainnet/testnets)
        try {
          const chainId = await phantom.request({ method: "eth_chainId" })
          console.log("[v0] Phantom connected on chain:", chainId)

          // Warn user about network compatibility
          if (chainId !== MONAD_TESTNET_CONFIG.chainId) {
            console.warn("[v0] Phantom is not on Monad testnet - some features may not work")
          }
        } catch (chainError) {
          console.log("[v0] Could not detect Phantom network:", chainError)
        }
      }

      return accounts[0]
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("User rejected the connection request")
      }
      if (error.code === -32002) {
        throw new Error("Phantom is already processing a request. Please check your wallet.")
      }
      if (error.message) {
        throw new Error(error.message)
      }
      throw new Error(`Phantom connection failed: ${error.toString() || "Unknown error"}`)
    }
  }

  async disconnect(): Promise<void> {
    console.log("Phantom disconnect requested")
  }
}

export class BrowserWallet implements WalletAdapter {
  name = "Browser Wallet"
  icon = "🌐"

  isInstalled(): boolean {
    return (
      typeof window !== "undefined" && "ethereum" in window && !window.ethereum?.isMetaMask && !window.phantom?.ethereum
    )
  }

  async connect(): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error("No browser wallet detected. Please install MetaMask or another Web3 wallet.")
      }

      if (!window.ethereum.request) {
        throw new Error("Invalid wallet provider - missing request method")
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found in browser wallet")
      }

      // Try to switch to Monad testnet, but handle gracefully if unsupported
      try {
        await switchToMonadTestnet(window.ethereum)
        console.log("[v0] Successfully connected to browser wallet with Monad testnet")
      } catch (networkError: any) {
        // If network switching fails, provide helpful message but still allow connection
        console.log("[v0] Browser wallet network switch failed, using default network:", networkError.message)

        // Check current network
        try {
          const chainId = await window.ethereum.request({ method: "eth_chainId" })
          console.log("[v0] Browser wallet connected on chain:", chainId)

          // Warn user about network compatibility
          if (chainId !== MONAD_TESTNET_CONFIG.chainId) {
            console.warn("[v0] Browser wallet is not on Monad testnet - some features may not work")
          }
        } catch (chainError) {
          console.log("[v0] Could not detect browser wallet network:", chainError)
        }
      }

      return accounts[0]
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("User rejected the connection request")
      }
      if (error.code === -32002) {
        throw new Error("Browser wallet is already processing a request. Please check your wallet.")
      }
      if (error.message) {
        throw new Error(error.message)
      }
      throw new Error(`Browser wallet connection failed: ${error.toString() || "Unknown error"}`)
    }
  }

  async disconnect(): Promise<void> {
    console.log("Browser wallet disconnect requested")
  }
}

export const walletAdapters = [new MetaMaskWallet(), new PhantomWallet(), new BrowserWallet()]

declare global {
  interface Window {
    ethereum?: any
    phantom?: {
      ethereum?: any
    }
  }
}
