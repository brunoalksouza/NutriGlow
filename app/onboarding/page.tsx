"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react"
import GrokStatus from "@/components/grok-status"

const OnboardingPage = () => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    weight: "",
    height: "",
    activityLevel: "",
    dietaryRestrictions: "",
    goal: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const user = useUser()
  const supabase = useSupabaseClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Generate diet plan
      const response = await fetch("/api/generate-diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Falha ao gerar dieta")
      }

      const dietPlan = await response.json()

      // Save to database if user is authenticated
      if (user) {
        const { error } = await supabase.from("diets").insert({
          user_id: user.id,
          plan: dietPlan,
          created_at: new Date().toISOString(),
        })

        if (error) {
          console.error("Error saving diet:", error)
          // Continue anyway - we have the diet plan
        }
      }

      // Store in localStorage as backup
      // Salvar dados do formulário para geração da dieta
      const dietFormData = {
        goal: formData.goal,
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        activityLevel: formData.activityLevel,
        restrictions: formData.dietaryRestrictions,
        mealsPerDay: 3, // Assuming a default value of 3 meals per day
      }

      console.log("Saving diet form data:", dietFormData)
      localStorage.setItem("dietFormData", JSON.stringify(dietFormData))

      // Navegar para a tela de loading
      router.push("/loading")
    } catch (error) {
      console.error("Error:", error)
      setError("Erro ao gerar sua dieta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Crie seu plano alimentar personalizado</h1>
      <GrokStatus />
      {error && <div className="text-red-500 mb-5">{error}</div>}
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="age" className="block text-gray-700 text-sm font-bold mb-2">
            Idade:
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mb-2">
            Gênero:
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Selecione</option>
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="weight" className="block text-gray-700 text-sm font-bold mb-2">
            Peso (kg):
          </label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="height" className="block text-gray-700 text-sm font-bold mb-2">
            Altura (cm):
          </label>
          <input
            type="number"
            id="height"
            name="height"
            value={formData.height}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="activityLevel" className="block text-gray-700 text-sm font-bold mb-2">
            Nível de atividade:
          </label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Selecione</option>
            <option value="sedentary">Sedentário</option>
            <option value="lightlyActive">Levemente ativo</option>
            <option value="moderatelyActive">Moderadamente ativo</option>
            <option value="veryActive">Muito ativo</option>
            <option value="extraActive">Extremamente ativo</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="dietaryRestrictions" className="block text-gray-700 text-sm font-bold mb-2">
            Restrições alimentares:
          </label>
          <input
            type="text"
            id="dietaryRestrictions"
            name="dietaryRestrictions"
            value={formData.dietaryRestrictions}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="goal" className="block text-gray-700 text-sm font-bold mb-2">
            Objetivo:
          </label>
          <select
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Selecione</option>
            <option value="weightLoss">Perda de peso</option>
            <option value="muscleGain">Ganho de massa muscular</option>
            <option value="maintainWeight">Manter o peso</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={isLoading}
        >
          {isLoading ? "Gerando..." : "Gerar Plano Alimentar"}
        </button>
      </form>
    </div>
  )
}

export default OnboardingPage
