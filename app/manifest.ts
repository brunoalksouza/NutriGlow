import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NutriGlow - Dieta Personalizada",
    short_name: "NutriGlow",
    description:
      "Sua dieta personalizada criada por IA. Descubra o plano alimentar perfeito para você com a ajuda da Grok AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf2f8",
    theme_color: "#ec4899",
    orientation: "portrait",
    categories: ["health", "lifestyle", "food"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  }
}
