"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugEnv() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({})
  const [timestamp, setTimestamp] = useState("")

  useEffect(() => {
    // Verificar todas as variáveis disponíveis
    const vars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "NOT_SET",
      // Verificar se estão disponíveis de outras formas
      NODE_ENV: process.env.NODE_ENV || "NOT_SET",
    }

    setEnvVars(vars)
    setTimestamp(new Date().toLocaleTimeString())

    // Log para debug
    console.log("=== ENVIRONMENT VARIABLES CHECK ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Variables:", vars)
    console.log("All process.env keys:", Object.keys(process.env))
  }, [])

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV === "production") return null

  return (
    <Card className="border-blue-200 bg-blue-50 mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Debug - Environment Variables ({timestamp})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-xs">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-mono">{key}:</span>
              <span className="font-mono text-right">
                {value === "NOT_SET" ? (
                  <span className="text-red-600">NOT_SET</span>
                ) : (
                  <span className="text-green-600">
                    {key.includes("KEY")
                      ? `${value.substring(0, 10)}...${value.substring(value.length - 5)}`
                      : `${value.substring(0, 30)}...`}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="text-xs text-blue-600">
            <div>Total env vars: {Object.keys(process.env).length}</div>
            <div>Supabase vars found: {Object.keys(process.env).filter((key) => key.includes("SUPABASE")).length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
