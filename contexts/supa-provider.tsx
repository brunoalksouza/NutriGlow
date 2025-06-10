"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"

// Importar o cliente Supabase de forma mais segura
let supabase: any = null

// Função para inicializar o Supabase de forma segura
const initSupabase = async () => {
  try {
    const { supabase: supabaseClient } = await import("@/lib/supabase-v0")
    return supabaseClient
  } catch (error) {
    console.error("Failed to initialize Supabase:", error)
    return null
  }
}

interface SupaContextType {
  supabase: any
  user: User | null
  loading: boolean
  isConnected: boolean
}

const SupaContext = createContext<SupaContextType | null>(null)

export const useSupa = () => {
  const context = useContext(SupaContext)
  if (!context) {
    throw new Error("useSupa must be used within a SupaProvider")
  }
  return context
}

interface SupaProviderProps {
  children: ReactNode
}

export function SupaProvider({ children }: SupaProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Inicializar Supabase de forma assíncrona
    const initialize = async () => {
      try {
        supabase = await initSupabase()

        if (!supabase) {
          console.log("Supabase not available, running in demo mode")
          setIsConnected(false)
          setLoading(false)
          return
        }

        // Test connection
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Supabase connection error:", error)
          setIsConnected(false)
        } else {
          console.log("Supabase connected successfully")
          setIsConnected(true)
          setUser(data.session?.user ?? null)

          // Set up auth listener
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user ?? null)
            setLoading(false)
          })

          return () => subscription.unsubscribe()
        }
      } catch (err) {
        console.error("Failed to connect to Supabase:", err)
        setIsConnected(false)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  return <SupaContext.Provider value={{ supabase, user, loading, isConnected }}>{children}</SupaContext.Provider>
}
