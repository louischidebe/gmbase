"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { sdk } from "@farcaster/miniapp-sdk"
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWriteContract,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useSendCalls,
} from "wagmi"
import { parseEther } from "viem"
import GMButton from "@/components/gm-button"
import PointsDisplay from "@/components/points-display"
import UserStats from "@/components/user-stats"
import ConfettiExplosion from "@/components/confetti-explosion"
import BatchTransaction from "@/components/batch-transaction"
import { BaseGM_ABI } from "@/lib/abi"
import { toast } from "sonner"

const CONTRACT_ADDRESS = "0x2eb1b50eEBe4bBC1aF30b128944E8EE90117f4ee"

export default function Home() {
  const { isConnected, address } = useAccount()
  // Utility to scope localStorage keys by wallet
  const storageKey = (base: string) => (address ? `${base}-${address}` : base)

  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { writeContract, data: txHash } = useWriteContract()
  const { sendCalls } = useSendCalls()

  const [isReady, setIsReady] = useState(false)
  const [points, setPoints] = useState<number | null>(null)
  const [lastGMTime, setLastGMTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // ✅ Wagmi transaction confirmation
  const {
    isSuccess: txConfirmed,
    isError: txFailed,
    isLoading: txPending,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // 🔹 Read user points onchain
  const { data: onchainPoints, refetch: refetchPoints } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: BaseGM_ABI,
    functionName: "getPoints",
    args: address ? [address] : undefined,
  })

  // 🔹 Initialize Farcaster SDK + trigger Wagmi refresh
  useEffect(() => {
    const init = async () => {
      try {
        // Ensure the app is fully loaded before hiding splash screen
        await sdk.actions.ready()
        
        // Get Ethereum provider for wallet interactions
        await sdk.wallet.getEthereumProvider()

        setIsReady(true)
        
        // Small delay to ensure UI is ready
        await new Promise((r) => setTimeout(r, 300))
        
        // Force Wagmi to recheck connection status
        window.dispatchEvent(new Event("focus"))
      } catch (err) {
        console.error("Farcaster SDK init error:", err)
        toast.error("Failed to initialize Farcaster SDK")
      }
    }
    
    // Only initialize if we're in a Farcaster Mini App context
    if (typeof window !== "undefined" && window.FarcasterMiniApp) {
      init()
    } else {
      // For non-Farcaster environments, set ready immediately
      setIsReady(true)
    }
  }, [])

  // 🔹 Update points and possibly last GM when fetched
  useEffect(() => {
    if (onchainPoints !== undefined && address) {
      const prev = Number(localStorage.getItem(storageKey("gm-points")) || 0)
      const newPoints = Number(onchainPoints)

      setPoints(newPoints)
      localStorage.setItem(storageKey("gm-points"), String(newPoints))

      if (newPoints > prev) {
        const now = new Date().toISOString()
        setLastGMTime(now)
        localStorage.setItem(storageKey("gm-last-time"), now)
      }
    }
  }, [onchainPoints, address])


  // 🔹 Handle confirmed transaction
  useEffect(() => {
    if (txConfirmed) {
      toast.dismiss()
      toast.success("GM transaction confirmed 🎉", {
        description: (
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-400 hover:text-blue-500"
          >
            View on BaseScan
          </a>
        ),
      })

      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 2000)
      refetchPoints()

      const now = new Date().toISOString()
      setLastGMTime(now)
      if (address) localStorage.setItem(storageKey("gm-last-time"), now)
      setLoading(false)
    }
  }, [txConfirmed, txHash, refetchPoints])

  // 🔹 Handle failed transaction
  useEffect(() => {
    if (txFailed) {
      toast.dismiss()
      toast.error("Transaction failed ❌")
      setLoading(false)
    }
  }, [txFailed])

  // 🔹 Clear GM record each new UTC day
  useEffect(() => {
    if (!address) return

    const stored = localStorage.getItem(storageKey("gm-last-time"))
    if (stored) {
      const last = new Date(stored)
      const now = new Date()
      const lastDayUTC = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate())
      const nowDayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

      if (nowDayUTC > lastDayUTC) {
        localStorage.removeItem(storageKey("gm-last-time"))
        setLastGMTime(null)
      } else {
        setLastGMTime(stored)
      }
    } else {
      setLastGMTime(null)
    }
  }, [address])


  // 🔹 Handle wallet connection
  const handleConnect = async () => {
    try {
      await connect({ connector: connectors[0] })
    } catch (err) {
      console.error("Wallet connect error:", err)
    }
  }

  // 🔹 Allow one GM per UTC day
  const canSignGM = () => {
    if (!lastGMTime) return true
    const last = new Date(lastGMTime)
    const now = new Date()
    const lastDayUTC = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate())
    const nowDayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    return nowDayUTC > lastDayUTC
  }

  // 🔹 Handle GM action
  const handleGM = async () => {
    if (!address) return
    setLoading(true)
    try {
      await switchChain({ chainId: 8453 })
      
      // Use batch transactions if available (EIP-5792)
      if (sendCalls) {
        await sendCalls({
          calls: [
            {
              to: CONTRACT_ADDRESS,
              data: "0x18160ddd", // keccak256("gm()") function selector
              value: parseEther("0.00003"),
            }
          ]
        })
        toast.loading("Waiting for transaction confirmation...")
      } else {
        // Fallback to regular transaction
        await writeContract({
          address: CONTRACT_ADDRESS,
          abi: BaseGM_ABI,
          functionName: "gm",
          value: parseEther("0.00003"),
          chainId: 8453,
        })
        toast.loading("Waiting for transaction confirmation...")
      }
    } catch (err: any) {
      console.error("GM transaction failed:", err)
      toast.error("Transaction failed ❌", {
        description: err?.message || "Something went wrong. Try again.",
      })
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-[#F8FAFF] flex items-center justify-center p-4">
      <AnimatePresence>{showCelebration && <ConfettiExplosion />}</AnimatePresence>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <motion.h1
            className="text-6xl font-black text-primary mb-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            GM 🟦
          </motion.h1>
          <p className="text-foreground/60 text-sm">Daily sign on Base</p>
        </div>

        {!isReady ? (
          <div className="text-center text-sm text-foreground/50">Connecting...</div>
        ) : isConnected ? (
          <div className="space-y-6">
            <PointsDisplay points={points ?? 0} />

            <GMButton
              onClick={handleGM}
              loading={loading || txPending}
              disabled={!canSignGM() || txPending}
            />

            <UserStats wallet={address!} lastGMTime={lastGMTime} />

            {/* Batch transaction demo - only show if wallet supports it */}
            <BatchTransaction contractAddress={CONTRACT_ADDRESS} />

            <motion.button
              onClick={() => disconnect()}
              className="w-full px-4 py-2 text-foreground/60 hover:text-foreground transition-colors border border-border rounded-full text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Disconnect
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={() => connect({ connector: connectors[0] })}
            className="w-full bg-[#0052FF] text-white font-bold py-3 rounded-full text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Connect Wallet
          </motion.button>
        )}
      </motion.div>
    </main>
  )
}
