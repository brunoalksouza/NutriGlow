"use client"

import { useEffect, useRef } from "react"
import { useSupa } from "@/contexts/supa-provider"
import { useToast } from "@/components/toast"

export function RealtimeSync() {
  const { user, supabase } = useSupa()
  const { showToast } = useToast()
  const channelsRef = useRef<any[]>([])
  const isSubscribedRef = useRef(false)

  useEffect(() => {
    if (!user || !supabase || isSubscribedRef.current) return

    const setupChannels = async () => {
      try {
        console.log("🔄 Setting up realtime channels...")

        // Cleanup existing channels first
        channelsRef.current.forEach((channel) => {
          try {
            supabase.removeChannel(channel)
          } catch (error) {
            console.warn("Warning cleaning up channel:", error)
          }
        })
        channelsRef.current = []

        // Create unique channel names
        const dietChannelName = `diets_${user.id}_${Date.now()}`
        const profileChannelName = `profiles_${user.id}_${Date.now()}`

        // Subscribe to diet changes
        const dietChannel = supabase
          .channel(dietChannelName)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "diets",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log("📊 New diet created:", payload)
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
              console.log("🗑️ Diet deleted:", payload)
              showToast("Dieta removida", "info")
            },
          )

        // Subscribe to profile changes
        const profileChannel = supabase.channel(profileChannelName).on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            console.log("👤 Profile updated:", payload)
            showToast("Perfil atualizado!", "success")
          },
        )

        // Subscribe channels
        const dietSubscription = dietChannel.subscribe((status) => {
          console.log("📊 Diet channel status:", status)
        })

        const profileSubscription = profileChannel.subscribe((status) => {
          console.log("👤 Profile channel status:", status)
        })

        // Store channels for cleanup
        channelsRef.current = [dietChannel, profileChannel]
        isSubscribedRef.current = true

        console.log("✅ Realtime channels setup complete")
      } catch (error) {
        console.error("❌ Error setting up realtime channels:", error)
      }
    }

    setupChannels()

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up realtime channels...")
      channelsRef.current.forEach((channel) => {
        try {
          supabase.removeChannel(channel)
        } catch (error) {
          console.warn("Warning during cleanup:", error)
        }
      })
      channelsRef.current = []
      isSubscribedRef.current = false
    }
  }, [user?.id, supabase]) // Only depend on user.id, not the full user object

  return null
}
