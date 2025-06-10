"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { SupaProvider } from "@/contexts/supa-provider"
import { ToastProvider } from "@/components/toast"
import { RealtimeSync } from "@/components/realtime-sync"
import EnvBanner from "@/components/env-banner"
import { useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration)
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })
    }
  }, [])

  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NutriGlow" />
      </head>
      <body className={inter.className}>
        <SupaProvider>
          <ToastProvider>
            <RealtimeSync />
            {children}
            {process.env.NODE_ENV !== "production" && <EnvBanner />}
          </ToastProvider>
        </SupaProvider>
      </body>
    </html>
  )
}
