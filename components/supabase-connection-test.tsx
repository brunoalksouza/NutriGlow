"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Database } from "lucide-react"
import { supabase } from "@/lib/supabase-v0"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
  duration?: number
}

export function SupabaseConnectionTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const tests = [
    {
      name: "Conexão Básica",
      test: async () => {
        const start = Date.now()
        const { data, error } = await supabase.auth.getSession()
        const duration = Date.now() - start

        if (error) throw error
        return { message: `Conectado com sucesso (${duration}ms)`, duration }
      },
    },
    {
      name: "Verificar Tabelas",
      test: async () => {
        const start = Date.now()
        const { data, error } = await supabase.from("profiles").select("count", { count: "exact", head: true })
        const duration = Date.now() - start

        if (error) throw error
        return { message: `Tabela profiles encontrada (${duration}ms)`, duration }
      },
    },
    {
      name: "Teste de Autenticação",
      test: async () => {
        const start = Date.now()
        // Tentar fazer signup com email temporário para testar
        const testEmail = `test-${Date.now()}@exemplo.com`
        const { data, error } = await supabase.auth.signUp({
          email: testEmail,
          password: "123456789",
        })
        const duration = Date.now() - start

        if (error && !error.message.includes("already registered")) {
          throw error
        }

        return { message: `Sistema de auth funcionando (${duration}ms)`, duration }
      },
    },
  ]

  const runTests = async () => {
    setTesting(true)
    setResults([])

    for (const test of tests) {
      setResults((prev) => [...prev, { name: test.name, status: "pending", message: "Testando..." }])

      try {
        const result = await test.test()
        setResults((prev) =>
          prev.map((r) =>
            r.name === test.name
              ? { ...r, status: "success" as const, message: result.message, duration: result.duration }
              : r,
          ),
        )
      } catch (error: any) {
        setResults((prev) =>
          prev.map((r) =>
            r.name === test.name
              ? { ...r, status: "error" as const, message: error.message || "Erro desconhecido" }
              : r,
          ),
        )
      }

      // Pequeno delay entre testes
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setTesting(false)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return "border-blue-200 bg-blue-50"
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
    }
  }

  const successCount = results.filter((r) => r.status === "success").length
  const errorCount = results.filter((r) => r.status === "error").length
  const totalTests = tests.length

  return (
    <Card className="border-purple-200 bg-purple-50 mb-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="w-4 h-4" />
          Teste de Conexão Supabase
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button onClick={runTests} disabled={testing} className="w-full bg-purple-600 hover:bg-purple-700">
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />🧪 Executar Testes
              </>
            )}
          </Button>

          {results.length > 0 && (
            <>
              <div className="text-xs text-purple-700">
                Progresso: {successCount + errorCount}/{totalTests} testes
                {successCount > 0 && <span className="text-green-600"> • {successCount} ✅</span>}
                {errorCount > 0 && <span className="text-red-600"> • {errorCount} ❌</span>}
              </div>

              <div className="space-y-2">
                {results.map((result, index) => (
                  <Alert key={index} className={getStatusColor(result.status)}>
                    <div className="flex items-start gap-2">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="font-medium text-xs">{result.name}</div>
                        <AlertDescription className="text-xs mt-1">
                          {result.message}
                          {result.duration && <span className="text-gray-500 ml-2">({result.duration}ms)</span>}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>

              {!testing && (
                <Alert
                  className={
                    successCount === totalTests ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"
                  }
                >
                  <AlertDescription className="text-xs">
                    {successCount === totalTests ? (
                      <span className="text-green-700">
                        🎉 <strong>Todos os testes passaram!</strong> Supabase está funcionando perfeitamente.
                      </span>
                    ) : (
                      <span className="text-yellow-700">
                        ⚠️ <strong>{errorCount} teste(s) falharam.</strong> Verifique as configurações.
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
