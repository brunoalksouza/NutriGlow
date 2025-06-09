"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

interface SupaContextType {
  supabase: typeof supabase
  user: User | null
  loading: boolean
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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <SupaContext.Provider value={{ supabase, user, loading }}>{children}</SupaContext.Provider>
}
