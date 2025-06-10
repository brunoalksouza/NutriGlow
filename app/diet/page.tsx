"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Edit, Clock, Utensils, Target, Zap, ChevronLeft, ChevronRight } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import { LockedContent } from "@/components/locked-content"
import { ProBadge } from "@/components/pro-badge"
import { useSupa } from "@/contexts/supa-provider"
import { NotificationService } from "@/lib/notifications"

interface DietPlan {
  totalCalories: number
  protein: number
  carbs: number
  fat: number
  meals: Array<{
    name: string
    time: string
    calories: number
    foods: string[]
  }>
}

export default function DietPage() {
  const router = useRouter()
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentDay, setCurrentDay] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const { user, supabase, isConnected } = useSupa()

  const loadDiet = useCallback(async () => {
    if (isLoading) return // Prevent multiple calls

    setIsLoading(true)
    setError(null)

    try {
      console.log("🔄 Loading diet plan...")

      // First try to load from database if user is authenticated and connected
      if (user && supabase && isConnected) {
        console.log("📊 Trying to load from database...")

        try {
          const { data, error } = await supabase
            .from("diets")
            .select("plan")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          if (data?.plan && !error) {
            console.log("✅ Diet loaded from database")
            setDietPlan(data.plan)
            setIsLoading(false)
            return
          } else if (error && error.code !== "PGRST116") {
            console.warn("⚠️ Database error:", error)
          }
        } catch (dbError) {
          console.warn("⚠️ Database connection error:", dbError)
        }
      }

      // Fallback to localStorage
      console.log("💾 Trying to load from localStorage...")
      const storedDiet = localStorage.getItem("currentDiet")
      if (storedDiet) {
        try {
          const parsedDiet = JSON.parse(storedDiet)
          console.log("✅ Diet loaded from localStorage")
          setDietPlan(parsedDiet)
          setIsLoading(false)
          return
        } catch (parseError) {
          console.error("❌ Error parsing stored diet:", parseError)
        }
      }

      // If no diet found anywhere, redirect to onboarding
      console.log("❌ No diet found, redirecting to onboarding")
      router.push("/onboarding")
    } catch (err) {
      console.error("❌ Unexpected error loading diet:", err)
      setError("Erro ao carregar dieta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }, [supabase, isConnected, router, isLoading]) // Removed user?.id from dependency array

  useEffect(() => {
    loadDiet()
  }, []) // Empty dependency array to run only once

  useEffect(() => {
    if (dietPlan?.meals) {
      // Schedule meal reminders
      try {
        NotificationService.scheduleMealReminders(dietPlan.meals)
      } catch (error) {
        console.warn("Warning scheduling notifications:", error)
      }
    }
  }, [dietPlan])

  const handleEditAnswers = useCallback(() => {
    router.push("/onboarding")
  }, [router])

  const handleDownloadPDF = useCallback(() => {
    // Simulate PDF download
    alert("Funcionalidade de download em desenvolvimento!")
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando sua dieta...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadDiet} className="bg-pink-500 hover:bg-pink-600">
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  if (!dietPlan) return null

  const renderDayContent = (dayNumber: number) => (
    <LockedContent dayNumber={dayNumber}>
      <div className="space-y-4">
        {/* Summary Card */}
        <Card className="border-pink-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Target className="w-5 h-5 mr-2 text-pink-600" />
              Resumo Nutricional - Dia {dayNumber}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{dietPlan.totalCalories}</div>
                <div className="text-sm text-gray-600">Calorias/dia</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{dietPlan.meals.length}</div>
                <div className="text-sm text-gray-600">Refeições</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Proteína</span>
                <Badge variant="secondary">{dietPlan.protein}g</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Carboidratos</span>
                <Badge variant="secondary">{dietPlan.carbs}g</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gorduras</span>
                <Badge variant="secondary">{dietPlan.fat}g</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meals List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-pink-600" />
            Refeições do Dia {dayNumber}
          </h2>

          {dietPlan.meals.map((meal, index) => (
            <Card key={index} className="border-pink-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{meal.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {meal.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-pink-600">
                      <Zap className="w-4 h-4 mr-1" />
                      {meal.calories} cal
                    </div>
                  </div>
                </div>

                <Separator className="mb-3" />

                <ul className="space-y-1">
                  {meal.foods.map((food, foodIndex) => (
                    <li key={foodIndex} className="text-sm text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-pink-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {food}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </LockedContent>
  )

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">Sua Dieta Personalizada</h1>
              <ProBadge />
            </div>
            <p className="text-gray-600 text-sm">Criada especialmente para você pela Grok AI</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
            <Button
              onClick={handleEditAnswers}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Respostas
            </Button>
          </div>

          {/* Day Tabs */}
          <Tabs value={currentDay.toString()} onValueChange={(value) => setCurrentDay(Number.parseInt(value))}>
            <TabsList className="grid w-full grid-cols-7 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <TabsTrigger key={day} value={day.toString()} className="text-xs">
                  Dia {day}
                </TabsTrigger>
              ))}
            </TabsList>

            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <TabsContent key={day} value={day.toString()}>
                {renderDayContent(day)}
              </TabsContent>
            ))}
          </Tabs>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
              disabled={currentDay === 1}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <span className="text-sm text-gray-600">Dia {currentDay} de 7</span>
            <Button
              variant="outline"
              onClick={() => setCurrentDay(Math.min(7, currentDay + 1))}
              disabled={currentDay === 7}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Tips Card */}
          <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 mt-6">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2">💡 Dicas Importantes</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Beba pelo menos 2L de água por dia</li>
                <li>• Respeite os horários das refeições</li>
                <li>• Pratique atividade física regularmente</li>
                <li>• Consulte um nutricionista para acompanhamento</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <BottomNavigation currentPage="diet" />
      </div>
    </AuthGuard>
  )
}
