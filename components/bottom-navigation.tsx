"use client"

import { useRouter } from "next/navigation"
import { Home, Utensils, History, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavigationProps {
  currentPage: "home" | "diet" | "history" | "profile"
}

export function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const router = useRouter()

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "diet", label: "Dieta", icon: Utensils, path: "/diet" },
    { id: "history", label: "Histórico", icon: History, path: "/history" },
    { id: "profile", label: "Perfil", icon: User, path: "/profile" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-pink-200 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors",
                isActive ? "text-pink-600 bg-pink-50" : "text-gray-500 hover:text-pink-600 hover:bg-pink-50",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
