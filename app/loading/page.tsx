"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Loading() {
  const [dietPlan, setDietPlan] = useState(null)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    generateDiet()
  }, [])

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
    <div className="flex flex-col items-center justify-center h-screen">
      <p>Gerando seu plano alimentar...</p>
    </div>
  )
}
