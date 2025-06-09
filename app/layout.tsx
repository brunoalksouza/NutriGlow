import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SupaProvider } from "@/contexts/supa-provider"
import { ToastProvider } from "@/components/toast"
import { RealtimeSync } from "@/components/realtime-sync"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NutriGlow - Dieta Personalizada",
  description: "Sua dieta personalizada criada por IA. Descubra o plano alimentar perfeito para você.",
  manifest: "/manifest.json",
  themeColor: "#ec4899",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NutriGlow",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
          </ToastProvider>
        </SupaProvider>
      </body>
    </html>
  )
}
