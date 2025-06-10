"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Clock, Utensils, Target, Zap, Lock } from "lucide-react"
import tips from "../data/tips.json"
import { PaywallModal } from "@/components/paywall-modal"
import { AuthGuard } from "@/components/auth-guard"
import { useSupa } from "@/contexts/supa-provider"

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
    prepSteps?: string[]
  }>
}

export default function QuickStartPage() {
  const router = useRouter()
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dailyTip, setDailyTip] = useState<(typeof tips)[0] | null>(null)
  const [tipCompleted, setTipCompleted] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const { user, supabase } = useSupa()

  useEffect(() => {
    // Get a random tip
    const randomTip = tips[Math.floor(Math.random() * tips.length)]
    setDailyTip(randomTip)

    // Generate diet and save to Supabase
    const generateDiet = async () => {
      try {
        // Get form data
        const formData = localStorage.getItem("dietFormData")
        if (!formData) {
          router.push("/onboarding")
          return
        }

        // Mock diet plan
        const mockDiet: DietPlan = {
          totalCalories: 1800,
          protein: 120,
          carbs: 180,
          fat: 60,
          meals: [
            {
              name: "Café da Manhã",
              time: "07:00",
              calories: 350,
              foods: ["1 fatia de pão integral", "1 ovo mexido", "1/2 abacate", "1 xícara de chá verde"],
              prepSteps: [
                "Toste o pão integral",
                "Mexa o ovo em uma frigideira antiaderente",
                "Amasse o abacate e espalhe sobre o pão",
                "Coloque o ovo por cima",
              ],
            },
            {
              name: "Almoço",
              time: "12:30",
              calories: 500,
              foods: [
                "150g peito de frango grelhado",
                "1 xícara de arroz integral",
                "Salada verde",
                "1 colher de azeite",
              ],
              prepSteps: [
                "Tempere o frango com ervas e grelhe",
                "Cozinhe o arroz integral conforme instruções",
                "Prepare uma salada com folhas verdes, tomate e pepino",
                "Regue com azeite e limão",
              ],
            },
            {
              name: "Jantar",
              time: "19:00",
              calories: 450,
              foods: ["150g salmão grelhado", "Batata doce assada", "Brócolis refogado", "Salada de rúcula"],
              prepSteps: [
                "Tempere o salmão com limão e ervas",
                "Asse a batata doce em cubos por 25 min a 200°C",
                "Refogue o brócolis com alho e azeite",
                "Monte o prato com a salada de rúcula",
              ],
            },
          ],
        }

        // Always save to localStorage as fallback
        localStorage.setItem("currentDiet", JSON.stringify(mockDiet))

        // Try to save to Supabase if user is logged in
        if (user && supabase) {
          try {
            console.log("Saving diet to Supabase for user:", user.id)

            // Check if table exists first
            const { data: tableExists, error: tableCheckError } = await supabase
              .from("diets")
              .select("count")
              .limit(1)
              .maybeSingle()

            if (tableCheckError) {
              console.warn("Table check error:", tableCheckError)
              // Table might not exist, but we continue anyway
            }

            // Insert the diet
            const { error } = await supabase.from("diets").insert({
              user_id: user.id,
              plan: mockDiet,
              created_at: new Date().toISOString(),
            })

            if (error) {
              console.error("Error saving diet:", error)
              setSaveError(`Erro ao salvar dieta: ${error.message || JSON.stringify(error)}`)

              // Try with a simpler structure if the first attempt failed
              if (error.message?.includes("column") || error.message?.includes("not found")) {
                const { error: error2 } = await supabase.from("diets").insert({
                  user_id: user.id,
                  plan_json: JSON.stringify(mockDiet),
                  created_at: new Date().toISOString(),
                })

                if (error2) {
                  console.error("Second attempt failed:", error2)
                } else {
                  console.log("Second attempt succeeded")
                  setSaveError(null)
                }
              }
            } else {
              console.log("Diet saved successfully to Supabase")
            }
          } catch (err) {
            console.error("Unexpected error saving to Supabase:", err)
            setSaveError(`Erro inesperado: ${err instanceof Error ? err.message : String(err)}`)
          }
        } else {
          console.log("User not logged in or Supabase not available, using localStorage only")
        }

        setDietPlan(mockDiet)
      } catch (err) {
        console.error("Error in generateDiet:", err)
        setSaveError(`Erro ao gerar dieta: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setIsLoading(false)
      }
    }

    generateDiet()
  }, [router, user, supabase])

  const handleContinue = () => {
    router.push("/diet")
  }

  const handleLockedContent = () => {
    setShowPaywall(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Preparando seu plano...</p>
        </div>
      </div>
    )
  }

  if (!dietPlan) return null

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 pb-10">
        <div className="bg-gradient-to-r from-[#FAD0C4] to-[#F6BDC0] pt-8 pb-6 px-4 mb-6">
          <div className="container mx-auto max-w-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Seu Plano de Ação de 24 Horas</h1>
            <p className="text-gray-700">Comece hoje com estas dicas gratuitas respaldadas por especialistas.</p>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-md">
          {/* Error message if any */}
          {saveError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              Nota: Seus dados estão salvos localmente. {saveError}
            </div>
          )}

          {/* Summary Card */}
          <Card className="border-pink-200 bg-white/80 backdrop-blur-sm mb-6 rounded-xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Target className="w-5 h-5 mr-2 text-pink-600" />
                Resumo do Dia 1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">{dietPlan.totalCalories}</div>
                  <div className="text-sm text-gray-600">Calorias</div>
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

          {/* Daily Tip Card */}
          {dailyTip && (
            <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 mb-6 rounded-xl shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Dica do Dia</h3>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    {dailyTip.category}
                  </Badge>
                </div>
                <p className="text-gray-700 mb-4">{dailyTip.tip}</p>
                <div className="flex items-center">
                  <Checkbox
                    id="tip-completed"
                    checked={tipCompleted}
                    onCheckedChange={(checked) => setTipCompleted(checked as boolean)}
                    className="border-yellow-400 text-yellow-600"
                  />
                  <label htmlFor="tip-completed" className="ml-2 text-sm text-gray-700 cursor-pointer">
                    Marcar como concluído
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meals List */}
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Utensils className="w-5 h-5 mr-2 text-pink-600" />
              Suas Próximas 3 Refeições
            </h2>

            {dietPlan.meals.slice(0, 3).map((meal, index) => (
              <Card key={index} className="border-pink-200 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
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

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ingredientes:</h4>
                    <ul className="space-y-1">
                      {meal.foods.map((food, foodIndex) => (
                        <li key={foodIndex} className="text-sm text-gray-600 flex items-start">
                          <span className="w-2 h-2 bg-pink-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                          {food}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {meal.prepSteps && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Modo de Preparo:</h4>
                      <ol className="space-y-1 list-decimal list-inside">
                        {meal.prepSteps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-sm text-gray-600">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600">Veja seu programa completo de 7 dias</p>
              <p className="text-sm font-medium text-pink-600">1 de 7 dias desbloqueados</p>
            </div>
            <div className="relative">
              <Progress value={14.3} className="h-3" />
              <div className="flex justify-between mt-2">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div
                    key={day}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      day === 1 ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-400 cursor-pointer relative"
                    }`}
                    onClick={day !== 1 ? handleLockedContent : undefined}
                  >
                    {day}
                    {day !== 1 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-gray-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            className="w-full bg-[#E75480] hover:bg-pink-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"
          >
            Continuar
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Locked Content Preview */}
          <div className="mt-6 relative">
            <Card className="border-gray-200 bg-white/60 backdrop-blur-sm rounded-xl shadow-md overflow-hidden">
              <div
                className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 cursor-pointer"
                onClick={handleLockedContent}
              >
                <div className="text-center">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Desbloqueie o plano completo</p>
                </div>
              </div>
              <CardContent className="p-4 filter blur-sm">
                <h3 className="font-semibold text-gray-800 mb-2">Lista de Compras - Semana 1</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox id="item-1" className="mr-2" />
                    <label htmlFor="item-1" className="text-sm text-gray-600">
                      Peito de frango (500g)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="item-2" className="mr-2" />
                    <label htmlFor="item-2" className="text-sm text-gray-600">
                      Salmão (300g)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="item-3" className="mr-2" />
                    <label htmlFor="item-3" className="text-sm text-gray-600">
                      Arroz integral (1 pacote)
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Paywall Modal */}
        <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
      </div>
    </AuthGuard>
  )
}
