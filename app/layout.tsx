import type React from "react"
import type { Metadata } from "next"
import ClientRootLayout from "./client-layout"

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
  return <ClientRootLayout children={children} />
}


import './globals.css'