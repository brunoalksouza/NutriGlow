"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Heart } from "lucide-react"

export default function LoadingPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState(0)

  const messages = [
    "Analisando suas informações...",
    "Calculando suas necessidades nutricionais...",
    "Criando seu plano personalizado...",
    "Finalizando sua dieta...",
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          router.push("/quick-start")
          return 100
        }
        return prev + 2
      })
    }, 100)

    const messageTimer = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length)
    }, 2000)

    return () => {
      clearInterval(timer)
      clearInterval(messageTimer)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md text-center">
        {/* Logo Animation */}
        <div className="mb-8">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse">
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Aguarde enquanto a Grok cria sua dieta personalizada...
        </h1>

        {/* Current Message */}
        <p className="text-gray-600 mb-8 h-6 transition-all duration-500">{messages[currentMessage]}</p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}%</p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Fun Fact */}
        <div className="mt-8 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-pink-200">
          <p className="text-sm text-gray-600">
            💡 <strong>Dica:</strong> Uma dieta personalizada pode ser até 3x mais eficaz que dietas genéricas!
          </p>
        </div>
      </div>
    </div>
  )
}
