import { createClient } from "@supabase/supabase-js"

// URLs corretas do Supabase (não confundir com DATABASE_URL)
const SUPABASE_URL = "https://ibrigockwxacbpoiocpf.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlicmlnb2Nrd3hhY2Jwb2lvY3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTcwOTgsImV4cCI6MjA2NTA3MzA5OH0.DeoWU6Wy89X72mYrAaPdxDtPSH4g6wVssTlY2wp11CU"

// Função para obter as variáveis de ambiente de forma segura
const getSupabaseUrl = () => {
  // Tentar variáveis de ambiente primeiro, depois fallback
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

  // Verificar se não é uma URL de banco PostgreSQL
  if (envUrl && !envUrl.includes("postgresql://") && envUrl.includes("supabase.co")) {
    return envUrl
  }

  // Usar URL hardcoded como fallback
  return SUPABASE_URL
}

const getSupabaseKey = () => {
  // Tentar variáveis de ambiente primeiro, depois fallback
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  // Verificar se é uma chave JWT válida
  if (envKey && envKey.startsWith("eyJ")) {
    return envKey
  }

  // Usar chave hardcoded como fallback
  return SUPABASE_ANON_KEY
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseKey()

console.log("🔗 Supabase Configuration:")
console.log("URL:", supabaseUrl)
console.log("Key (first 20 chars):", supabaseAnonKey.substring(0, 20) + "...")
console.log("Is PostgreSQL URL?", supabaseUrl.includes("postgresql://") ? "❌ WRONG!" : "✅ Correct")

// Verificar se as URLs estão corretas
if (supabaseUrl.includes("postgresql://")) {
  console.error("❌ ERROR: Using PostgreSQL URL instead of Supabase URL!")
  console.error("Expected: https://[project].supabase.co")
  console.error("Got:", supabaseUrl)
}

let supabaseClient: any = null

try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
  console.log("✅ Supabase client created successfully")
} catch (error) {
  console.error("❌ Failed to create Supabase client:", error)
}

export const supabase = supabaseClient

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
