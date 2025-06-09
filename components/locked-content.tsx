"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Star, CheckCircle } from "lucide-react"
import { useSubscription } from "@/hooks/use-subscription"
import { useToast } from "@/components/toast"

interface LockedContentProps {
  dayNumber: number
  children: React.ReactNode
}

export function LockedContent({ dayNumber, children }: LockedContentProps) {
  const { status, isActive, createCheckoutSession } = useSubscription()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const dayIsLocked = !isActive && dayNumber >= 2

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const url = await createCheckoutSession()
      window.location.href = url
    } catch (error) {
      console.error("Error creating checkout session:", error)
      showToast("Erro ao processar pagamento. Tente novamente.", "error")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!dayIsLocked) {
    return <>{children}</>
  }

  return (
    <Card className="border-gray-200 bg-white/60 backdrop-blur-sm rounded-xl shadow-md overflow-hidden relative">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="text-center p-6 max-w-sm">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>

          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-4">
            <Star className="w-3 h-3 mr-1" />
            PREMIUM
          </Badge>

          <h3 className="text-xl font-bold text-gray-800 mb-2">Desbloqueie o Plano Completo</h3>
          <p className="text-gray-600 text-sm mb-6">
            Acesse todos os 7 dias da sua dieta personalizada e recursos exclusivos
          </p>

          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-center text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Plano alimentar completo de 7 dias
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Lista de compras semanal
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Receitas detalhadas
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Suporte prioritário
            </div>
          </div>

          <div className="mb-4">
            <div className="text-2xl font-bold text-gray-800">R$ 9,99</div>
            <div className="text-sm text-gray-600">por mês</div>
          </div>

          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processando...</span>
              </div>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Assinar Premium
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 mt-3">Cancele a qualquer momento</p>
        </div>
      </div>

      <CardContent className="p-4 filter blur-sm">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
      </CardContent>
    </Card>
  )
}
