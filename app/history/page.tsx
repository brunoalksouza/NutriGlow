"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, Target, Eye, Trash2 } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AuthGuard } from "@/components/auth-guard"
import { useSupa } from "@/contexts/supa-provider"

interface DietHistory {
  id: string
  created_at: string
  plan: {
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
}

export default function HistoryPage() {
  const router = useRouter()
  const { user, supabase } = useSupa()
  const [dietHistory, setDietHistory] = useState<DietHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [totalDays, setTotalDays] = useState(0)
  const [totalCalories, setTotalCalories] = useState(0)

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("diets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          setError("Erro ao carregar histórico: " + error.message)
          return
        }

        if (data) {
          setDietHistory(data)

          // Calculate stats
          const firstDiet = data[data.length - 1]
          if (firstDiet) {
            const firstDate = new Date(firstDiet.created_at)
            const now = new Date()
            const diffTime = Math.abs(now.getTime() - firstDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            setTotalDays(diffDays)
          }

          // Calculate average calories
          const avgCalories = data.reduce((sum, diet) => sum + (diet.plan?.totalCalories || 0), 0) / data.length
          setTotalCalories(Math.round(avgCalories))
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("Erro inesperado")
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user, supabase])

  const handleViewDiet = (diet: DietHistory) => {
    // Store the selected diet in localStorage and navigate to diet page
    localStorage.setItem("selectedDiet", JSON.stringify(diet.plan))
    router.push("/diet")
  }

  const handleDeleteDiet = async (dietId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta dieta?")) return

    try {
      const { error } = await supabase.from("diets").delete().eq("id", dietId)

      if (error) {
        setError("Erro ao excluir dieta: " + error.message)
        return
      }

      // Remove from local state
      setDietHistory((prev) => prev.filter((diet) => diet.id !== dietId))
    } catch (err) {
      setError("Erro inesperado ao excluir")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Hoje"
    if (diffDays === 1) return "Ontem"
    return `${diffDays} dias atrás`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando histórico...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Histórico de Dietas</h1>
            <p className="text-gray-600 text-sm">Acompanhe sua jornada nutricional</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50 mb-6">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Overview */}
          {dietHistory.length > 0 && (
            <Card className="border-pink-200 bg-white/80 backdrop-blur-sm mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-pink-600">{dietHistory.length}</div>
                    <div className="text-sm text-gray-600">Dietas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{totalDays}</div>
                    <div className="text-sm text-gray-600">Dias</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-rose-600">{totalCalories}</div>
                    <div className="text-sm text-gray-600">Cal/dia</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Diet History List */}
          <div className="space-y-4">
            {dietHistory.map((diet) => (
              <Card key={diet.id} className="border-pink-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <Target className="w-5 h-5 mr-2 text-pink-600" />
                        Dieta Personalizada
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(diet.created_at)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {getDaysAgo(diet.created_at)}
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Completa
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-600">{diet.plan?.meals?.length || 0} refeições</div>
                    <div className="text-sm font-medium text-pink-600">{diet.plan?.totalCalories || 0} cal/dia</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-pink-200 text-pink-600 hover:bg-pink-50"
                      onClick={() => handleViewDiet(diet)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteDiet(diet.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {dietHistory.length === 0 && !loading && (
            <Card className="border-pink-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma dieta ainda</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Crie sua primeira dieta personalizada para começar sua jornada!
                </p>
                <Button
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  onClick={() => router.push("/onboarding")}
                >
                  Criar Dieta
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <BottomNavigation currentPage="history" />
      </div>
    </AuthGuard>
  )
}
