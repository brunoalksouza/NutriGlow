"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Star } from "lucide-react"

interface PaywallModalProps {
  open: boolean
  onClose: () => void
}

export function PaywallModal({ open, onClose }: PaywallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-xl text-center">Desbloqueie seu plano completo</DialogTitle>
          <DialogDescription className="text-center">
            Acesse seu programa personalizado de 7 dias e muito mais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-pink-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              Plano alimentar completo de 7 dias personalizado para seus objetivos
            </p>
          </div>
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-pink-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">Lista de compras semanal organizada por categorias</p>
          </div>
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-pink-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">Macronutrientes personalizados e ajustados para seus objetivos</p>
          </div>
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-pink-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">Relatórios semanais de progresso e ajustes automáticos</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button className="w-full bg-[#E75480] hover:bg-pink-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg">
            Assinar Premium - R$19,90/mês
          </Button>
          <p className="text-xs text-center text-gray-500">Cancele a qualquer momento. Sem compromisso.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
