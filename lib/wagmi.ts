"use client"

import { createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector"

// Detect if we're running in a Farcaster Mini App environment
const isFarcaster =
  typeof window !== "undefined" &&
  (window.FarcasterMiniApp !== undefined || 
   window.location.search.includes("farcaster_miniapp") ||
   window.location.hostname.includes("farcaster"))

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    // 🟪 Use Farcaster connector only if inside miniapp context
    ...(isFarcaster ? [
      farcasterMiniApp({
        // Enhanced configuration for better UX
        shimDisconnect: true,
      })
    ] : []),

    // 🟦 External wallet fallbacks (MetaMask, WalletConnect)
    injected({ 
      shimDisconnect: true,
      // Better handling for external wallets
    }),
    walletConnect({
      projectId: "745c12e62a088505e04c407b5be32044", // Get from https://cloud.walletconnect.com
      showQrModal: true,
      // Enhanced WalletConnect options
      metadata: {
        name: 'GM on Base',
        description: 'Daily GM signing on Base',
        url: 'https://gmbase-beta.vercel.app/',
        icons: ['https://gmbase-beta.vercel.app/icon.png']
      }
    }),
  ],
  transports: {
    [base.id]: http(),
  },
})
