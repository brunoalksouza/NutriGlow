"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { XCircle, ArrowLeft, Crown } from "lucide-react"

export default function BillingCancelledPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="border-orange-200 bg-white/80 backdrop-blur-sm text-center">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-4">Pagamento Cancelado</h1>

            <p className="text-gray-600 mb-6">
              Não se preocupe! Você ainda pode acessar o primeiro dia da sua dieta gratuitamente. Quando estiver pronta,
              você pode assinar o Premium a qualquer momento.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center text-yellow-800 mb-2">
                <Crown className="w-5 h-5 mr-2" />
                <span className="font-semibold">Oferta Especial</span>
              </div>
              <p className="text-sm text-yellow-700">
                Desbloqueie todos os 7 dias da sua dieta personalizada por apenas R$ 9,99/mês. Cancele a qualquer
                momento!
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/diet")}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Minha Dieta
              </Button>

              <Button
                onClick={() => router.push("/profile")}
                variant="outline"
                className="w-full border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                Tentar Novamente Mais Tarde
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Você pode assinar o Premium a qualquer momento através do seu perfil
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
