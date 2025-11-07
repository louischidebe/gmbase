"use client"

import { motion } from "framer-motion"

interface UserStatsProps {
  wallet: string
  lastGMTime: string | null
}

export default function UserStats({ wallet, lastGMTime }: UserStatsProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatLastGM = (time: string | null) => {
    if (!time) return "Never"
    const date = new Date(time)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <motion.div
      className="grid grid-cols-2 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      <motion.div className="bg-card rounded-[1.25rem] p-4 border border-border shadow-md" whileHover={{ y: -2 }}>
        <p className="text-foreground/60 text-xs mb-2 font-medium">Wallet</p>
        <p className="text-foreground text-sm font-mono">{formatAddress(wallet)}</p>
      </motion.div>
      <motion.div className="bg-card rounded-[1.25rem] p-4 border border-border shadow-md" whileHover={{ y: -2 }}>
        <p className="text-foreground/60 text-xs mb-2 font-medium">Last GM</p>
        <p className="text-foreground text-sm">{formatLastGM(lastGMTime)}</p>
      </motion.div>
    </motion.div>
  )
}
