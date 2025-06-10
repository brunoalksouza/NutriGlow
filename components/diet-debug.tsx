"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupa } from "@/contexts/supa-provider"

export function DietDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const { user, supabase } = useSupa()

  const runDebug = async () => {
    const info: any = {
      timestamp: new Date().toISOString(),
      user: user ? { id: user.id, email: user.email } : null,
      localStorage: {},
      database: null,
      errors: [],
    }

    // Check localStorage
    try {
      const storedDiet = localStorage.getItem("currentDiet")
      const storedFormData = localStorage.getItem("dietFormData")

      info.localStorage = {
        currentDiet: storedDiet ? "✅ Found" : "❌ Not found",
        dietFormData: storedFormData ? "✅ Found" : "❌ Not found",
        currentDietSize: storedDiet ? `${storedDiet.length} chars` : "0",
        formDataSize: storedFormData ? `${storedFormData.length} chars` : "0",
      }

      if (storedDiet) {
        try {
          const parsed = JSON.parse(storedDiet)
          info.localStorage.dietStructure = {
            totalCalories: parsed.totalCalories || "Missing",
            mealsCount: parsed.meals?.length || 0,
            hasProtein: parsed.protein ? "✅" : "❌",
            hasCarbs: parsed.carbs ? "✅" : "❌",
            hasFat: parsed.fat ? "✅" : "❌",
          }
        } catch (e) {
          info.errors.push("Failed to parse stored diet")
        }
      }
    } catch (e) {
      info.errors.push("localStorage access failed")
    }

    // Check database
    if (user) {
      try {
        const { data, error, count } = await supabase
          .from("diets")
          .select("*", { count: "exact" })
          .eq("user_id", user.id)

        if (error) {
          info.errors.push(`Database error: ${error.message}`)
        } else {
          info.database = {
            totalDiets: count || 0,
            latestDiet: data && data.length > 0 ? "✅ Found" : "❌ Not found",
            diets:
              data?.map((d) => ({
                id: d.id,
                created_at: d.created_at,
                hasPlan: d.plan ? "✅" : "❌",
              })) || [],
          }
        }
      } catch (e) {
        info.errors.push("Database query failed")
      }
    }

    setDebugInfo(info)
  }

  const clearData = () => {
    localStorage.removeItem("currentDiet")
    localStorage.removeItem("dietFormData")
    setDebugInfo(null)
    alert("Dados limpos! Refaça o onboarding.")
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800">🐛 Debug da Dieta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDebug} variant="outline" size="sm">
            🔍 Verificar Estado
          </Button>
          <Button onClick={clearData} variant="outline" size="sm" className="text-red-600">
            🗑️ Limpar Dados
          </Button>
        </div>

        {debugInfo && (
          <div className="space-y-3 text-sm">
            <div>
              <strong>Usuário:</strong> {debugInfo.user ? `✅ ${debugInfo.user.email}` : "❌ Não logado"}
            </div>

            <div>
              <strong>localStorage:</strong>
              <ul className="ml-4 mt-1">
                <li>Dieta: {debugInfo.localStorage.currentDiet}</li>
                <li>Form Data: {debugInfo.localStorage.dietFormData}</li>
                {debugInfo.localStorage.dietStructure && (
                  <li>
                    Estrutura: {debugInfo.localStorage.dietStructure.mealsCount} refeições,{" "}
                    {debugInfo.localStorage.dietStructure.totalCalories} cal
                  </li>
                )}
              </ul>
            </div>

            {debugInfo.database && (
              <div>
                <strong>Banco de Dados:</strong>
                <ul className="ml-4 mt-1">
                  <li>Total de dietas: {debugInfo.database.totalDiets}</li>
                  <li>Última dieta: {debugInfo.database.latestDiet}</li>
                </ul>
              </div>
            )}

            {debugInfo.errors.length > 0 && (
              <div>
                <strong className="text-red-600">Erros:</strong>
                <ul className="ml-4 mt-1 text-red-600">
                  {debugInfo.errors.map((error: string, i: number) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
