"use client"

import { useEffect, useState } from "react"
import { useSupa } from "@/contexts/supa-provider"

export function useSupabaseTest() {
  const { supabase, isConnected } = useSupa()
  const [connectionStatus, setConnectionStatus] = useState<"testing" | "connected" | "error">("testing")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Verificar se o supabase existe antes de usar
        if (!supabase) {
          console.error("Supabase client is null")
          setError("Supabase client not initialized")
          setConnectionStatus("error")
          return
        }

        // Verificar se tem o método auth
        if (!supabase.auth) {
          console.error("Supabase auth is not available")
          setError("Supabase auth not available")
          setConnectionStatus("error")
          return
        }

        // Test the connection by trying to get the current session
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Supabase connection error:", error)
          setError(error.message)
          setConnectionStatus("error")
        } else {
          console.log("Supabase connection successful")
          setConnectionStatus("connected")
        }
      } catch (err) {
        console.error("Unexpected Supabase error:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        setConnectionStatus("error")
      }
    }

    // Só testar se o provider indicar que está conectado
    if (isConnected && supabase) {
      testConnection()
    } else if (!isConnected) {
      setConnectionStatus("error")
      setError("Supabase not connected")
    }
  }, [supabase, isConnected])

  return { connectionStatus, error }
}
