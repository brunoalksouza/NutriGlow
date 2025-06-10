"use client"

import { useEffect, useState } from "react"
import { useSupa } from "@/contexts/supa-provider"

export function useSupabaseTest() {
  const { supabase } = useSupa()
  const [connectionStatus, setConnectionStatus] = useState<"testing" | "connected" | "error">("testing")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
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

    testConnection()
  }, [supabase])

  return { connectionStatus, error }
}
