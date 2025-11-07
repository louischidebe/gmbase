"use client"

import { motion } from "framer-motion"

interface GMButtonProps {
  onClick: () => void
  loading: boolean
  disabled: boolean
}

export default function GMButton({ onClick, loading, disabled }: GMButtonProps) {
  let buttonText = "GM"
  if (loading) buttonText = "Waiting..."
  else if (disabled) buttonText = "Come back tomorrow"

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full px-6 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-primary to-[#3388FF] text-white shadow-md hover:shadow-lg active:scale-95 disabled:from-border disabled:to-border disabled:text-foreground/40 transition-all duration-200"
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {buttonText}
    </motion.button>
  )
}
