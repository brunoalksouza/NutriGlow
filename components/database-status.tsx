"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase-v0"

export default function DatabaseStatus() {
  const [status, setStatus] = useState<{
    connected: boolean
    tablesExist: boolean
    error?: string
    loading: boolean
  }>({
    connected: false,
    tablesExist: false,
    loading: false,
  })

  const checkDatabase = async () => {
    setStatus((prev) => ({ ...prev, loading: true }))

    try {
      // Test connection
      const { data: connectionTest, error: connectionError } = await supabase.from("profiles").select("count").limit(1)

      if (connectionError) {
        setStatus({
          connected: false,
          tablesExist: false,
          error: connectionError.message,
          loading: false,
        })
        return
      }

      // Check if tables exist
      const { data: tablesData, error: tablesError } = await supabase.rpc("check_tables_exist")

      setStatus({
        connected: true,
        tablesExist: !tablesError,
        error: tablesError?.message,
        loading: false,
      })
    } catch (error) {
      setStatus({
        connected: false,
        tablesExist: false,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      })
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">🗄️ Database Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Connection:</span>
            <span className={status.connected ? "text-green-600" : "text-red-600"}>
              {status.connected ? "✅ Connected" : "❌ Disconnected"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Tables:</span>
            <span className={status.tablesExist ? "text-green-600" : "text-yellow-600"}>
              {status.tablesExist ? "✅ Exist" : "⚠️ Missing"}
            </span>
          </div>
        </div>

        {status.error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <strong>Error:</strong> {status.error}
          </div>
        )}

        <Button onClick={checkDatabase} disabled={status.loading} className="w-full">
          {status.loading ? "🔄 Checking..." : "🔍 Check Again"}
        </Button>
      </CardContent>
    </Card>
  )
}
