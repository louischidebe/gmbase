"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface PointsDisplayProps {
  points: number
}

export default function PointsDisplay({ points }: PointsDisplayProps) {
  const [prevPoints, setPrevPoints] = useState(points)
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    if (points > prevPoints) {
      setIsNew(true)
      setTimeout(() => setIsNew(false), 1000)
      setPrevPoints(points)
    }
  }, [points, prevPoints])

  return (
    <motion.div
      className="bg-card rounded-[1.25rem] p-8 text-center border border-border shadow-md hover:shadow-lg transition-shadow"
      animate={isNew ? { scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <p className="text-foreground/60 text-sm mb-3 font-semibold">Your Points</p>
      <div className="relative">
        <motion.p
          className="text-6xl font-black text-primary"
          key={points}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {points}
        </motion.p>
        {isNew && (
          <motion.span
            className="absolute -top-8 -right-8 text-3xl"
            initial={{ scale: 1, y: 0 }}
            animate={{ scale: 0, y: -30 }}
            transition={{ duration: 1 }}
          >
            ✨
          </motion.span>
        )}
      </div>
    </motion.div>
  )
}
