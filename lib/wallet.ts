export interface WalletAdapter {
  name: string
  icon: string
  connect: () => Promise<string>
  disconnect: () => Promise<void>
  isInstalled: () => boolean
}

const MONAD_TESTNET_CONFIG = {
  chainId: "0x279F", // 10143 in hex (correct chain ID)
  chainName: "Monad Testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: ["https://testnet-rpc.monad.xyz", "https://rpc.ankr.com/monad_testnet"],
  blockExplorerUrls: ["https://testnet.monadexplorer.com"],
}

async function switchToMonadTestnet(ethereum: any): Promise<void> {
  try {
    if (!ethereum || !ethereum.request) {
      throw new Error("Invalid Ethereum provider - cannot switch networks")
    }

    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
    })
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [MONAD_TESTNET_CONFIG],
        })
      } catch (addError: any) {
        throw new Error(
          `Failed to add Monad testnet: ${addError.message || addError.toString() || "Network configuration error"}`,
        )
      }
    } else if (switchError.code === 4001) {
      throw new Error("User rejected the network switch request")
    } else {
      throw new Error(
        `Failed to switch to Monad testnet: ${switchError.message || switchError.toString() || "Network switch error"}`,
      )
    }
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

export class KeplrWallet implements WalletAdapter {
  name = "Keplr"
  icon = "🌌"

  isInstalled(): boolean {
    return typeof window !== "undefined" && "keplr" in window
  }

  async connect(): Promise<string> {
    if (!this.isInstalled()) {
      window.open("https://www.keplr.app/", "_blank")
      throw new Error("Keplr wallet not installed")
    }

    await window.keplr.enable("cosmoshub-4")
    const offlineSigner = window.keplr.getOfflineSigner("cosmoshub-4")
    const accounts = await offlineSigner.getAccounts()
    return accounts[0].address
  }

  async disconnect(): Promise<void> {
    console.log("Keplr disconnect requested")
  }
}

export class HaHaWallet implements WalletAdapter {
  name = "HaHa"
  icon = "😂"

  isInstalled(): boolean {
    return typeof window !== "undefined" && "haha" in window
  }

  async connect(): Promise<string> {
    if (!this.isInstalled()) {
      window.open("https://haha.me/", "_blank")
      throw new Error("HaHa wallet not installed")
    }

    const response = await window.haha.connect()
    return response.address
  }

  async disconnect(): Promise<void> {
    if (this.isInstalled()) {
      await window.haha.disconnect()
    }
  }
}

export class InjectedWallet implements WalletAdapter {
  name = "Browser Wallet"
  icon = "🌐"

  isInstalled(): boolean {
    return typeof window !== "undefined" && ("ethereum" in window || "keplr" in window)
  }

  async connect(): Promise<string> {
    if (window.ethereum) {
      try {
        if (!window.ethereum.request) {
          throw new Error("Invalid Ethereum provider - missing request method")
        }

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found")
        }

        // Now switch to Monad testnet after we have account access
        await switchToMonadTestnet(window.ethereum)
        return accounts[0]
      } catch (error: any) {
        if (error.code === 4001) {
          throw new Error("User rejected the connection request")
        }
        if (error.code === -32002) {
          throw new Error("Wallet is already processing a request. Please check your wallet.")
        }
        if (error.message) {
          throw new Error(error.message)
        }
        throw new Error(`Browser wallet connection failed: ${error.toString() || "Unknown error"}`)
      }
    } else if (window.keplr) {
      try {
        await window.keplr.enable("cosmoshub-4")
        const offlineSigner = window.keplr.getOfflineSigner("cosmoshub-4")
        const accounts = await offlineSigner.getAccounts()
        return accounts[0].address
      } catch (error: any) {
        throw new Error(`Keplr connection failed: ${error.message || error.toString() || "Unknown error"}`)
      }
    }
    throw new Error("No compatible wallet found")
  }

  async disconnect(): Promise<void> {
    console.log("Injected wallet disconnect requested")
  }
}

export class PhantomEVMWallet implements WalletAdapter {
  name = "Phantom"
  icon = "👻"

  isInstalled(): boolean {
    return typeof window !== "undefined" && "phantom" in window && window.phantom?.ethereum
  }

  async connect(): Promise<string> {
    try {
      if (!this.isInstalled()) {
        throw new Error("Phantom wallet not installed or EVM not supported")
      }

      if (!window.phantom?.ethereum?.request) {
        throw new Error("Phantom EVM provider not available - missing request method")
      }

      const accounts = await window.phantom.ethereum.request({
        method: "eth_requestAccounts",
      })
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found in Phantom")
      }

      // Now switch to Monad testnet after we have account access
      await switchToMonadTestnet(window.phantom.ethereum)
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
      throw new Error(`Phantom EVM connection failed: ${error.toString() || "Unknown error"}`)
    }
  }

  async disconnect(): Promise<void> {
    console.log("Phantom EVM disconnect requested")
  }
}

export const walletAdapters = [
  new MetaMaskWallet(),
  new PhantomEVMWallet(),
  new KeplrWallet(),
  new HaHaWallet(),
  new InjectedWallet(),
]

declare global {
  interface Window {
    ethereum?: any
    keplr?: any
    haha?: any
    phantom?: {
      ethereum?: any
    }
  }
}
