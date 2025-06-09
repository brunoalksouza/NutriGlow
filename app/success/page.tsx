"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Crown, Sparkles } from "lucide-react"

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      router.push("/diet")
    }, 10000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="border-green-200 bg-white/80 backdrop-blur-sm text-center">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-800">Bem-vinda ao Premium!</h1>
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>

            <p className="text-gray-600 mb-6">
              Parabéns! Sua assinatura foi ativada com sucesso. Agora você tem acesso completo ao seu plano de 7 dias e
              todos os recursos premium.
            </p>

            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Plano alimentar completo de 7 dias desbloqueado
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Lista de compras semanal disponível
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Receitas detalhadas liberadas
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Suporte prioritário ativado
              </div>
            </div>

            <Button
              onClick={() => router.push("/diet")}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg mb-4"
            >
              Ver Minha Dieta Completa
            </Button>

            <p className="text-xs text-gray-500">Redirecionando automaticamente em 10 segundos...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
