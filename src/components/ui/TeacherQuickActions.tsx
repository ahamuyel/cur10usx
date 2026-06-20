"use client"

import { motion } from "framer-motion"
import { PenLine, ClipboardCheck, FilePlus, PlusCircle, Send } from "lucide-react"
import { cn } from "@/lib/utils"

const actions = [
  { label: "Lançar nota", icon: PenLine, color: "text-violet-600 dark:text-violet-400" },
  { label: "Registar presença", icon: ClipboardCheck, color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Criar avaliação", icon: FilePlus, color: "text-amber-600 dark:text-amber-400" },
  { label: "Criar atividade", icon: PlusCircle, color: "text-cyan-600 dark:text-cyan-400" },
  { label: "Enviar comunicado", icon: Send, color: "text-rose-600 dark:text-rose-400" },
]

export default function TeacherQuickActions() {
  return (
    <div className="bg-card border border-border rounded-card p-6 shadow-card h-full">
      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
        Ações Rápidas
      </h3>

      {/* Grid Inteligente:
        - Mobile: 1 coluna (lista vertical) ou 2 colunas
        - Tablet/Desktop: 3 a 5 colunas dependendo do contexto do pai 
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.label}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="group flex items-center gap-3 p-3 rounded-card bg-muted border border-border hover:bg-accent transition-all text-left w-full cursor-pointer"
            >
                <div className={cn("p-2 rounded-xl bg-card border border-border shrink-0", action.color)}>
                <Icon size={16} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wide text-foreground truncate">
                {action.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}