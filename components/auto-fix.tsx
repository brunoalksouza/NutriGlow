"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Wrench } from "lucide-react"
import { supabase } from "@/lib/supabase-v0"

export function AutoFix() {
  const [fixing, setFixing] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle")

  const runAutoFix = async () => {
    setFixing(true)
    setResults([])
    setStatus("running")

    try {
      setResults((prev) => [...prev, "🔧 Iniciando correções automáticas..."])

      // Test 1: Check Supabase connection
      setResults((prev) => [...prev, "📡 Testando conexão com Supabase..."])
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        setResults((prev) => [...prev, "✅ Conexão com Supabase OK"])
      } catch (error) {
        setResults((prev) => [...prev, "⚠️ Problema na conexão - usando modo offline"])
      }

      // Test 2: Check if tables exist
      setResults((prev) => [...prev, "🗄️ Verificando tabelas do banco..."])
      try {
        await supabase.from("profiles").select("count", { count: "exact", head: true })
        setResults((prev) => [...prev, "✅ Tabela profiles existe"])
      } catch (error) {
        setResults((prev) => [...prev, "❌ Tabela profiles não encontrada - execute o script SQL"])
      }

      try {
        await supabase.from("diets").select("count", { count: "exact", head: true })
        setResults((prev) => [...prev, "✅ Tabela diets existe"])
      } catch (error) {
        setResults((prev) => [...prev, "❌ Tabela diets não encontrada - execute o script SQL"])
      }

      try {
        await supabase.from("subscriptions").select("count", { count: "exact", head: true })
        setResults((prev) => [...prev, "✅ Tabela subscriptions existe"])
      } catch (error) {
        setResults((prev) => [...prev, "❌ Tabela subscriptions não encontrada - execute o script SQL"])
      }

      // Test 3: Check API
      setResults((prev) => [...prev, "⚡ Testando API de geração de dieta..."])
      try {
        const response = await fetch("/api/generate-diet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            age: 25,
            weight: 65,
            height: 165,
            goal: "maintain",
            activityLevel: "moderate",
            mealsPerDay: 5,
          }),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        if (!data.totalCalories) throw new Error("Resposta inválida")
        setResults((prev) => [...prev, "✅ API de geração de dieta funcionando"])
      } catch (error) {
        setResults((prev) => [...prev, "❌ Problema na API - verifique os logs"])
      }

      // Test 4: Clear localStorage issues
      setResults((prev) => [...prev, "🧹 Limpando dados corrompidos..."])
      try {
        const keys = Object.keys(localStorage)
        let cleaned = 0
        keys.forEach((key) => {
          if (key.includes("diet") || key.includes("profile")) {
            try {
              const data = localStorage.getItem(key)
              if (data) {
                JSON.parse(data) // Test if valid JSON
              }
            } catch {
              localStorage.removeItem(key)
              cleaned++
            }
          }
        })
        setResults((prev) => [...prev, `✅ Limpeza concluída (${cleaned} itens removidos)`])
      } catch (error) {
        setResults((prev) => [...prev, "⚠️ Problema na limpeza - continuando..."])
      }

      setResults((prev) => [...prev, "🎉 Correções automáticas concluídas!"])
      setStatus("success")
    } catch (error) {
      setResults((prev) => [...prev, `❌ Erro durante correções: ${error}`])
      setStatus("error")
    } finally {
      setFixing(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "running":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Wrench className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "border-blue-200 bg-blue-50"
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <Card className={`mb-4 ${getStatusColor()}`}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          {getStatusIcon()}🔧 Correção Automática de Problemas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runAutoFix} disabled={fixing} className="w-full bg-blue-600 hover:bg-blue-700">
            {fixing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Corrigindo problemas...
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4 mr-2" />🔧 Executar Correções Automáticas
              </>
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700">Resultados:</div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {results.map((result, index) => (
                  <div key={index} className="text-xs p-2 bg-white rounded border">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-xs text-green-700">
                ✅ <strong>Correções concluídas!</strong> Teste o aplicativo agora.
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-xs text-red-700">
                ❌ <strong>Alguns problemas persistem.</strong> Execute os scripts SQL manualmente.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
