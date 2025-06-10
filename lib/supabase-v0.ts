import { createClient } from "@supabase/supabase-js"

// Configurações do Supabase
const supabaseUrl = "https://ibrigockwxacbpoiocpf.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlicmlnb2Nrd3hhY2Jwb2lvY3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTcwOTgsImV4cCI6MjA2NTA3MzA5OH0.DeoWU6Wy89X72mYrAaPdxDtPSH4g6wVssTlY2wp11CU"

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found, running in demo mode")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          age: number | null
          height_cm: number | null
          weight_kg: number | null
          goal: string | null
          activity: string | null
          restrictions: string | null
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          age?: number | null
          height_cm?: number | null
          weight_kg?: number | null
          goal?: string | null
          activity?: string | null
          restrictions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          age?: number | null
          height_cm?: number | null
          weight_kg?: number | null
          goal?: string | null
          activity?: string | null
          restrictions?: string | null
          created_at?: string
        }
      }
      diets: {
        Row: {
          id: string
          user_id: string
          plan: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: any
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string | null
          current_period_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string | null
          current_period_end?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string | null
          current_period_end?: string | null
          created_at?: string
        }
      }
    }
  }
}
