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

export class PhantomEVMWallet implements WalletAdapter {
  name = "Phantom"
  icon = "👻"

  isInstalled(): boolean {
    if (typeof window === "undefined") return false

    // Check for Phantom in multiple ways for Brave compatibility
    const hasPhantom =
      "phantom" in window ||
      window.ethereum?.isPhantom ||
      (window.ethereum?.providers && window.ethereum.providers.some((p: any) => p.isPhantom))

    return hasPhantom && (window.phantom?.ethereum || window.ethereum?.isPhantom)
  }

  async connect(): Promise<string> {
    try {
      if (!this.isInstalled()) {
        const isBrave = navigator.userAgent.includes("Brave") || (window as any).navigator?.brave?.isBrave

        if (isBrave) {
          throw new Error(
            "Phantom wallet not detected in Brave. Please ensure Phantom is installed and enabled in Brave's extension settings.",
          )
        }
        throw new Error("Phantom wallet not installed or EVM not supported")
      }

      let phantomProvider = window.phantom?.ethereum

      // Fallback for Brave browser where phantom might be in ethereum providers
      if (!phantomProvider && window.ethereum?.providers) {
        phantomProvider = window.ethereum.providers.find((p: any) => p.isPhantom)
      }

      // Another fallback for direct ethereum access
      if (!phantomProvider && window.ethereum?.isPhantom) {
        phantomProvider = window.ethereum
      }

      if (!phantomProvider?.request) {
        throw new Error("Phantom EVM provider not available - please enable Phantom in your browser")
      }

      const accounts = await phantomProvider.request({
        method: "eth_requestAccounts",
      })

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found in Phantom")
      }

      // Now switch to Monad testnet after we have account access
      await switchToMonadTestnet(phantomProvider)
      return accounts[0]
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("User rejected the connection request")
      }
      if (error.code === -32002) {
        throw new Error("Phantom is already processing a request. Please check your wallet.")
      }
      if (error.code === -32603) {
        throw new Error("Phantom internal error. Please try refreshing the page.")
      }
      if (error.message) {
        throw new Error(error.message)
      }
      throw new Error(`Phantom EVM connection failed: ${error.toString() || "Unknown error"}`)
    }
  }

  async disconnect(): Promise<void> {
    console.log("Phantom EVM disconnect requested")
  }
}

export const walletAdapters = [new PhantomEVMWallet(), new MetaMaskWallet()]

declare global {
  interface Window {
    ethereum?: any
    phantom?: {
      ethereum?: any
    }
  }
}
