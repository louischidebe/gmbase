"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { sdk } from "@farcaster/miniapp-sdk"

interface WalletConnectProps {
  onConnect: (address: string) => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    try {
      const provider = await sdk.wallet.getEthereumProvider()
      if (!provider) {
        console.error("Ethereum provider not available in this context")
        alert("Farcaster wallet not detected. Please open this MiniApp in Warpcast.")
        return
      }

      // 🧠 Check if already connected
      const accounts = await provider.request({ method: "eth_accounts" })
      if (accounts?.[0]) {
        onConnect(accounts[0])
        setLoading(false)
        return
      }

      const newAccounts = (await provider.request({ method: "eth_requestAccounts" })) as string[]
      const address = newAccounts?.[0]
      if (address) onConnect(address)
    } catch (err) {
      console.error("Wallet connection failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-foreground/60 text-sm">
          Connect your Farcaster wallet to start signing GM daily
        </p>
      </div>

      <motion.button
        onClick={handleConnect}
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary to-[#3388FF] hover:shadow-xl text-white h-12 text-base font-semibold transition-all rounded-full shadow-md disabled:from-border disabled:to-border disabled:text-foreground/40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {loading ? "Connecting..." : "Connect Farcaster Wallet"}
      </motion.button>
    </div>
  )
}
