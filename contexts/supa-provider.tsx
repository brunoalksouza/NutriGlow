"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase-v0"

interface SupaContextType {
  supabase: typeof supabase | null
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
    const initialize = async () => {
      try {
        console.log("🔄 Initializing Supabase...")

        // Verificar se o cliente foi criado corretamente
        if (!supabase) {
          console.error("❌ Supabase client is null")
          setIsConnected(false)
          setLoading(false)
          return
        }

        // Verificar se tem os métodos necessários
        if (!supabase.auth) {
          console.error("❌ Supabase auth is not available")
          setIsConnected(false)
          setLoading(false)
          return
        }

        console.log("✅ Supabase client initialized")

        // Test connection
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("❌ Supabase connection error:", error)
          setIsConnected(false)
        } else {
          console.log("✅ Supabase connected successfully")
          setIsConnected(true)
          setUser(data.session?.user ?? null)

          // Set up auth listener
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            console.log("🔄 Auth state changed:", _event)
            setUser(session?.user ?? null)
          })

          return () => {
            console.log("🧹 Cleaning up auth listener")
            subscription.unsubscribe()
          }
        }
      } catch (err) {
        console.error("❌ Failed to initialize Supabase:", err)
        setIsConnected(false)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  return (
    <SupaContext.Provider value={{ supabase: isConnected ? supabase : null, user, loading, isConnected }}>
      {children}
    </SupaContext.Provider>
  )
}
