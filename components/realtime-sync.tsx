"use client"

import { useEffect } from "react"
import { useSupa } from "@/contexts/supa-provider"
import { useToast } from "@/components/toast"

export function RealtimeSync() {
  const { user, supabase } = useSupa()
  const { showToast } = useToast()

  useEffect(() => {
    if (!user) return

    // Subscribe to diet changes
    const dietChannel = supabase
      .channel("diets")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "diets",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          showToast("Nova dieta criada!", "success")
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "diets",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          showToast("Dieta removida", "info")
        },
      )
      .subscribe()

    // Subscribe to profile changes
    const profileChannel = supabase
      .channel("profiles")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          showToast("Perfil atualizado!", "success")
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(dietChannel)
      supabase.removeChannel(profileChannel)
    }
  }, [user, supabase, showToast])

  return null
}
