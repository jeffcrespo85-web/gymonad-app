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
    console.log("[v0] Attempting to switch to Monad testnet...")
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
    })
    console.log("[v0] Successfully switched to Monad testnet")
  } catch (switchError: any) {
    console.log("[v0] Switch error:", switchError)
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        console.log("[v0] Adding Monad testnet to wallet...")
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [MONAD_TESTNET_CONFIG],
        })
        console.log("[v0] Successfully added Monad testnet")
      } catch (addError: any) {
        console.log("[v0] Add error:", addError)
        throw new Error(`Failed to add Monad testnet: ${addError.message || "Unknown error"}`)
      }
    } else if (switchError.code === 4001) {
      throw new Error("User rejected the network switch request")
    } else {
      throw new Error(`Failed to switch to Monad testnet: ${switchError.message || "Unknown error"}`)
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
    if (!this.isInstalled()) {
      window.open("https://metamask.io/", "_blank")
      throw new Error("MetaMask not installed")
    }

    await switchToMonadTestnet(window.ethereum)
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    return accounts[0]
  }

  async disconnect(): Promise<void> {
    // MetaMask doesn't have a programmatic disconnect
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
      await switchToMonadTestnet(window.ethereum)
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      return accounts[0]
    } else if (window.keplr) {
      await window.keplr.enable("cosmoshub-4")
      const offlineSigner = window.keplr.getOfflineSigner("cosmoshub-4")
      const accounts = await offlineSigner.getAccounts()
      return accounts[0].address
    }
    throw new Error("No EVM-compatible wallet found")
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
    if (!this.isInstalled()) {
      window.open("https://phantom.app/", "_blank")
      throw new Error("Phantom wallet not installed or EVM not supported")
    }

    await switchToMonadTestnet(window.phantom.ethereum)
    const accounts = await window.phantom.ethereum.request({
      method: "eth_requestAccounts",
    })
    return accounts[0]
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
