"use client"

import { createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector"

const isFarcaster =
  typeof window !== "undefined" &&
  (window.FarcasterMiniApp !== undefined || window.location.search.includes("farcaster_miniapp"))

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    // 🟪 Use Farcaster connector only if inside miniapp context
    ...(isFarcaster ? [farcasterMiniApp()] : []),

    // 🟦 External wallet fallbacks (MetaMask, WalletConnect)
    injected({ shimDisconnect: true }),
    walletConnect({
      projectId: "745c12e62a088505e04c407b5be32044", // Get from https://cloud.walletconnect.com
      showQrModal: true,
    }),
  ],
  transports: {
    [base.id]: http(),
  },
})
