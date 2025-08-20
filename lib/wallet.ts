export interface WalletAdapter {
  name: string
  icon: string
  connect: () => Promise<string>
  disconnect: () => Promise<void>
  isInstalled: () => boolean
}

export class PhantomWallet implements WalletAdapter {
  name = "Phantom"
  icon = "👻"

  isInstalled(): boolean {
    return typeof window !== "undefined" && "solana" in window && window.solana?.isPhantom
  }

  async connect(): Promise<string> {
    if (!this.isInstalled()) {
      window.open("https://phantom.app/", "_blank")
      throw new Error("Phantom wallet not installed")
    }

    const response = await window.solana.connect()
    return response.publicKey.toString()
  }

  async disconnect(): Promise<void> {
    if (this.isInstalled()) {
      await window.solana.disconnect()
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
    return typeof window !== "undefined" && ("ethereum" in window || "solana" in window || "keplr" in window)
  }

  async connect(): Promise<string> {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      return accounts[0]
    } else if (window.solana) {
      const response = await window.solana.connect()
      return response.publicKey.toString()
    } else if (window.keplr) {
      await window.keplr.enable("cosmoshub-4")
      const offlineSigner = window.keplr.getOfflineSigner("cosmoshub-4")
      const accounts = await offlineSigner.getAccounts()
      return accounts[0].address
    }
    throw new Error("No compatible wallet found")
  }

  async disconnect(): Promise<void> {
    console.log("Injected wallet disconnect requested")
  }
}

export const walletAdapters = [
  new PhantomWallet(),
  new MetaMaskWallet(),
  new KeplrWallet(),
  new HaHaWallet(),
  new InjectedWallet(),
]

declare global {
  interface Window {
    solana?: any
    ethereum?: any
    keplr?: any
    haha?: any
  }
}
