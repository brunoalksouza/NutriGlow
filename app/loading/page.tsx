"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Heart } from "lucide-react"

export default function LoadingPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState(0)
  const [dietPlan, setDietPlan] = useState(null)
  const [error, setError] = useState(null)

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
          // Add a small delay before navigation for better UX
          setTimeout(() => router.push("/quick-start"), 500)
          return 100
        }
        return prev + 1.5 // Slower, more realistic progress
      })
    }, 150) // Slightly slower interval

    const messageTimer = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length)
    }, 3000) // Longer message display time

    const generateDiet = async () => {
      try {
        // Get form data from localStorage
        const savedFormData = localStorage.getItem("dietFormData")
        if (!savedFormData) {
          setError("Dados do formulário não encontrados. Refaça o questionário.")
          return
        }

        const formData = JSON.parse(savedFormData)
        console.log("Form data for diet generation:", formData)

        // Validate required fields
        if (!formData.age || !formData.weight || !formData.height) {
          setError("Dados obrigatórios faltando. Refaça o questionário.")
          return
        }

        // Simulate diet generation (replace with actual API call)
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Dummy diet plan
        const dummyDietPlan = {
          breakfast: "Oatmeal with fruit",
          lunch: "Salad with grilled chicken",
          dinner: "Salmon with vegetables",
        }

        setDietPlan(dummyDietPlan)
      } catch (e) {
        setError("Erro ao gerar o plano alimentar.")
        console.error("Error generating diet:", e)
      }
    }

    generateDiet()

    return () => {
      clearInterval(timer)
      clearInterval(messageTimer)
    }
  }, [router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Refazer Questionário
        </button>
      </div>
    )
  }

  if (dietPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Seu Plano Alimentar</h1>
        <p>Café da Manhã: {dietPlan.breakfast}</p>
        <p>Almoço: {dietPlan.lunch}</p>
        <p>Jantar: {dietPlan.dinner}</p>
      </div>
    )
  }

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
