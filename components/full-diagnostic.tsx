"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, AlertTriangle, Database, Key, Zap } from "lucide-react"
import { supabase } from "@/lib/supabase-v0"

interface DiagnosticResult {
  category: string
  name: string
  status: "pending" | "success" | "warning" | "error"
  message: string
  details?: string
}

export function FullDiagnostic() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])

  const runDiagnostic = async () => {
    setTesting(true)
    setResults([])

    const tests = [
      // Environment Variables
      {
        category: "Environment",
        name: "NEXT_PUBLIC_SUPABASE_URL",
        test: () => {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL
          if (!url) return { status: "error", message: "Não encontrada" }
          if (url === "NOT_SET") return { status: "error", message: "Valor NOT_SET" }
          if (!url.includes("supabase.co")) return { status: "warning", message: "Formato suspeito" }
          return { status: "success", message: "✅ Configurada", details: url.substring(0, 30) + "..." }
        },
      },
      {
        category: "Environment",
        name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        test: () => {
          const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          if (!key) return { status: "error", message: "Não encontrada" }
          if (key === "NOT_SET") return { status: "error", message: "Valor NOT_SET" }
          if (!key.startsWith("eyJ")) return { status: "warning", message: "Formato suspeito" }
          return { status: "success", message: "✅ Configurada", details: key.substring(0, 20) + "..." }
        },
      },
      {
        category: "Environment",
        name: "DATABASE_URL",
        test: () => {
          const url = process.env.DATABASE_URL
          if (!url) return { status: "error", message: "Não encontrada" }
          if (url === "NOT_SET") return { status: "error", message: "Valor NOT_SET" }
          if (!url.includes("postgresql://")) return { status: "warning", message: "Formato suspeito" }
          return { status: "success", message: "✅ Configurada", details: "postgresql://..." }
        },
      },
      {
        category: "Environment",
        name: "GROK_API_KEY",
        test: () => {
          const key = process.env.GROK_API_KEY
          if (!key) return { status: "warning", message: "Não encontrada (opcional)" }
          if (key === "NOT_SET") return { status: "warning", message: "Valor NOT_SET (opcional)" }
          if (!key.startsWith("gsk-")) return { status: "warning", message: "Formato suspeito" }
          return { status: "success", message: "✅ Configurada", details: key.substring(0, 10) + "..." }
        },
      },

      // Supabase Connection
      {
        category: "Supabase",
        name: "Conexão Básica",
        test: async () => {
          try {
            const { data, error } = await supabase.auth.getSession()
            if (error) throw error
            return { status: "success", message: "✅ Conectado" }
          } catch (error: any) {
            return { status: "error", message: "❌ Falha na conexão", details: error.message }
          }
        },
      },
      {
        category: "Supabase",
        name: "Tabela Profiles",
        test: async () => {
          try {
            const { data, error } = await supabase.from("profiles").select("count", { count: "exact", head: true })
            if (error) throw error
            return { status: "success", message: "✅ Tabela existe" }
          } catch (error: any) {
            return { status: "error", message: "❌ Tabela não existe", details: error.message }
          }
        },
      },
      {
        category: "Supabase",
        name: "Tabela Diets",
        test: async () => {
          try {
            const { data, error } = await supabase.from("diets").select("count", { count: "exact", head: true })
            if (error) throw error
            return { status: "success", message: "✅ Tabela existe" }
          } catch (error: any) {
            return { status: "error", message: "❌ Tabela não existe", details: error.message }
          }
        },
      },
      {
        category: "Supabase",
        name: "Tabela Subscriptions",
        test: async () => {
          try {
            const { data, error } = await supabase.from("subscriptions").select("count", { count: "exact", head: true })
            if (error) throw error
            return { status: "success", message: "✅ Tabela existe" }
          } catch (error: any) {
            return { status: "error", message: "❌ Tabela não existe", details: error.message }
          }
        },
      },

      // API Tests
      {
        category: "APIs",
        name: "Generate Diet API",
        test: async () => {
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
            return { status: "success", message: "✅ API funcionando" }
          } catch (error: any) {
            return { status: "error", message: "❌ API com problema", details: error.message }
          }
        },
      },

      // Authentication Test
      {
        category: "Auth",
        name: "Teste de Signup",
        test: async () => {
          try {
            const testEmail = `test-${Date.now()}@exemplo.com`
            const { data, error } = await supabase.auth.signUp({
              email: testEmail,
              password: "123456789",
            })
            if (error && !error.message.includes("already registered") && !error.message.includes("rate limit")) {
              throw error
            }
            return { status: "success", message: "✅ Auth funcionando" }
          } catch (error: any) {
            return { status: "error", message: "❌ Auth com problema", details: error.message }
          }
        },
      },
    ]

    for (const test of tests) {
      setResults((prev) => [
        ...prev,
        { category: test.category, name: test.name, status: "pending", message: "Testando..." },
      ])

      try {
        const result = await test.test()
        setResults((prev) =>
          prev.map((r) =>
            r.name === test.name
              ? {
                  ...r,
                  status: result.status as any,
                  message: result.message,
                  details: result.details,
                }
              : r,
          ),
        )
      } catch (error: any) {
        setResults((prev) =>
          prev.map((r) =>
            r.name === test.name
              ? {
                  ...r,
                  status: "error" as const,
                  message: "❌ Erro inesperado",
                  details: error.message,
                }
              : r,
          ),
        )
      }

      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    setTesting(false)
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "pending":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "pending":
        return "border-blue-200 bg-blue-50"
      case "success":
        return "border-green-200 bg-green-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "error":
        return "border-red-200 bg-red-50"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Environment":
        return <Key className="w-4 h-4" />
      case "Supabase":
        return <Database className="w-4 h-4" />
      case "APIs":
        return <Zap className="w-4 h-4" />
      case "Auth":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.category]) acc[result.category] = []
      acc[result.category].push(result)
      return acc
    },
    {} as Record<string, DiagnosticResult[]>,
  )

  const successCount = results.filter((r) => r.status === "success").length
  const errorCount = results.filter((r) => r.status === "error").length
  const warningCount = results.filter((r) => r.status === "warning").length

  return (
    <Card className="border-purple-200 bg-purple-50 mb-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="w-4 h-4" />🔍 Diagnóstico Completo do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runDiagnostic} disabled={testing} className="w-full bg-purple-600 hover:bg-purple-700">
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Diagnosticando...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />🔄 Executar Diagnóstico
              </>
            )}
          </Button>

          {results.length > 0 && (
            <>
              <div className="text-xs text-purple-700 flex gap-4">
                <span>✅ {successCount} OK</span>
                <span>⚠️ {warningCount} Avisos</span>
                <span>❌ {errorCount} Erros</span>
              </div>

              {Object.entries(groupedResults).map(([category, categoryResults]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-purple-800">
                    {getCategoryIcon(category)}
                    {category}
                  </h4>
                  {categoryResults.map((result, index) => (
                    <Alert key={index} className={getStatusColor(result.status)}>
                      <div className="flex items-start gap-2">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="font-medium text-xs">{result.name}</div>
                          <AlertDescription className="text-xs mt-1">
                            {result.message}
                            {result.details && <div className="text-gray-500 mt-1">{result.details}</div>}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              ))}

              {!testing && (
                <Alert
                  className={
                    errorCount === 0
                      ? "border-green-200 bg-green-50"
                      : errorCount > 3
                        ? "border-red-200 bg-red-50"
                        : "border-yellow-200 bg-yellow-50"
                  }
                >
                  <div className="flex items-center gap-2">
                    {errorCount === 0 ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : errorCount > 3 ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                    <AlertDescription className="text-xs">
                      {errorCount === 0 ? (
                        <span className="text-green-700">
                          🎉 <strong>Sistema 100% Funcional!</strong> Tudo configurado corretamente.
                        </span>
                      ) : errorCount > 3 ? (
                        <span className="text-red-700">
                          ❌ <strong>Problemas críticos encontrados.</strong> Execute os scripts SQL e verifique as
                          configurações.
                        </span>
                      ) : (
                        <span className="text-yellow-700">
                          ⚠️ <strong>Alguns problemas menores.</strong> Sistema funcional com limitações.
                        </span>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
