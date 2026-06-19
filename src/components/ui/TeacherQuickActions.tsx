"use client"

import { motion } from "framer-motion"
import { PenLine, ClipboardCheck, FilePlus, PlusCircle, Send } from "lucide-react"
import { cn } from "@/lib/utils"

const actions = [
  { label: "Lançar nota", icon: PenLine, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10 hover:bg-violet-500/20" },
  { label: "Registar presença", icon: ClipboardCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 hover:bg-emerald-500/20" },
  { label: "Criar avaliação", icon: FilePlus, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 hover:bg-amber-500/20" },
  { label: "Criar atividade", icon: PlusCircle, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10 hover:bg-cyan-500/20" },
  { label: "Enviar comunicado", icon: Send, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10 hover:bg-rose-500/20" },
]

export default function TeacherQuickActions() {
  return (
    <div className="bg-white/60 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 p-4 sm:p-5 shadow-2xs">
      <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
        Ações Rápidas
      </h3>

      <div className="grid grid-cols-5 gap-2">
        {actions.map((action, idx) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-transparent transition-all",
                action.bg, action.color,
              )}
            >
              <Icon size={16} />
              <span className="text-[8px] font-bold uppercase tracking-wider text-center leading-tight">
                {action.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
