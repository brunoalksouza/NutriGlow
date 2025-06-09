"use client"

import { Badge } from "@/components/ui/badge"
import { Crown } from "lucide-react"
import { useSubscription } from "@/hooks/use-subscription"

export function ProBadge() {
  const { isActive } = useSubscription()

  if (!isActive) return null

  return (
    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
      <Crown className="w-3 h-3 mr-1" />
      PRO
    </Badge>
  )
}
