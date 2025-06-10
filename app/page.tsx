"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Sparkles, Target, Users } from "lucide-react"

export default function WelcomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    router.push("/onboarding")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">NutriGlow</h1>
          <p className="text-gray-600 text-sm">Sua jornada para uma vida mais saudável</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Descubra a dieta perfeita para você</h2>
            <p className="text-gray-600 leading-relaxed">
              Responda algumas perguntas rápidas e receba seu plano alimentar personalizado criado pela nossa IA
              nutricional.
            </p>
          </div>

          {/* Benefits Cards */}
          <div className="space-y-4">
            <Card className="border-pink-200 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Personalizada</h3>
                  <p className="text-sm text-gray-600">Dieta criada especialmente para você</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">IA Avançada</h3>
                  <p className="text-sm text-gray-600">Powered by AI</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-200 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Para Mulheres</h3>
                  <p className="text-sm text-gray-600">Focado nas suas necessidades</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              onClick={handleStart}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Carregando...</span>
                </div>
              ) : (
                "Começar"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
