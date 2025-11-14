"use client"

import { useState } from "react"
import { useSendCalls } from "wagmi"
import { parseEther } from "viem"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface BatchTransactionProps {
  contractAddress: string
}

export default function BatchTransaction({ contractAddress }: BatchTransactionProps) {
  const [loading, setLoading] = useState(false)
  const { sendCalls } = useSendCalls()

  const handleBatchTransaction = async () => {
    if (!sendCalls) {
      toast.error("Batch transactions not supported by your wallet")
      return
    }

    setLoading(true)
    try {
      // Example: Batch transaction with multiple calls
      // In a real app, these would be meaningful contract interactions
      const result = await sendCalls({
        calls: [
          {
            to: contractAddress,
            value: parseEther("0.00001"),
            // Example data for a function call (would need actual ABI encoding)
            // data: encodeFunctionData({ ... })
          },
          {
            to: contractAddress,
            value: parseEther("0.00002"),
            // Another function call
            // data: encodeFunctionData({ ... })
          }
        ]
      })

      toast.success("Batch transaction sent!", {
        description: `Transaction hash: ${result}`
      })
    } catch (error: any) {
      console.error("Batch transaction failed:", error)
      toast.error("Batch transaction failed", {
        description: error?.message || "Unknown error occurred"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 p-4 bg-secondary rounded-lg">
      <h3 className="font-semibold mb-2">Advanced: Batch Transaction</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Send multiple transactions in a single confirmation (requires Farcaster Wallet)
      </p>
      <Button 
        onClick={handleBatchTransaction} 
        disabled={loading}
        variant="outline"
        size="sm"
      >
        {loading ? "Processing..." : "Try Batch Transaction"}
      </Button>
    </div>
  )
}