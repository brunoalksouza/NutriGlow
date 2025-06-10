"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"

export default function GrokStatus() {
  const [status, setStatus] = useState<"checking" | "available" | "unavailable" | "invalid">("checking")

  useEffect(() => {
    checkGrokStatus()
  }, [])

  const checkGrokStatus = async () => {
    try {
      const response = await fetch("/api/check-grok-status")
      const data = await response.json()
      setStatus(data.status)
    } catch (error) {
      setStatus("unavailable")
    }
  }

  if (status === "checking") {
    return (
      <Alert className="border-blue-200 bg-blue-50 mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-blue-700">Verificando status da IA...</AlertDescription>
      </Alert>
    )
  }

  if (status === "available") {
    return (
      <Alert className="border-green-200 bg-green-50 mb-4">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="text-green-700">
          ✅ IA Grok disponível - Dietas personalizadas ativadas
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "invalid") {
    return (
      <Alert className="border-orange-200 bg-orange-50 mb-4">
        <XCircle className="h-4 w-4" />
        <AlertDescription className="text-orange-700">
          ⚠️ Chave da API Grok inválida - Usando dietas padrão otimizadas
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50 mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-yellow-700">
        🤖 IA temporariamente indisponível - Usando dietas padrão otimizadas
      </AlertDescription>
    </Alert>
  )
}
