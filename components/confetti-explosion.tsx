"use client"

import { motion } from "framer-motion"

const CONFETTI_PIECES = 30
const emojis = ["🎉", "⭐", "🌟", "✨", "🎊"]

export default function ConfettiExplosion() {
  const pieces = Array.from({ length: CONFETTI_PIECES }, (_, i) => ({
    id: i,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    delay: Math.random() * 0.1,
    duration: 2 + Math.random() * 0.5,
    x: (Math.random() - 0.5) * 300,
    rotate: Math.random() * 720,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute text-2xl font-bold"
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          animate={{
            x: piece.x,
            y: 300,
            opacity: 0,
            scale: 0,
            rotate: piece.rotate,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeOut",
          }}
          style={{
            left: "50%",
            top: "50%",
            marginLeft: "-12px",
            marginTop: "-12px",
          }}
        >
          {piece.emoji}
        </motion.div>
      ))}
    </div>
  )
}
