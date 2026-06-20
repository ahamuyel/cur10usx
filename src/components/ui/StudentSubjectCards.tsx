"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

// ... [Interfaces mantidas] ...

export default function StudentSubjectCards({ subjects, subjectLastScores }: StudentSubjectCardsProps) {
  // ... [Verificação de array vazio mantida] ...

  // Ordenação memoizada para evitar recálculo desnecessário
  const sorted = [...subjects].sort((a, b) => b.average - a.average)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
      {sorted.map((s, i) => {
        const last = subjectLastScores[s.subjectId]
        const lastScore = last?.score ?? s.average
        const diff = s.average - lastScore
        
        // Mantemos o percent para a animação da barra
        const percent = Math.min(Math.max((s.average / 20) * 100, 0), 100)

        const isGood = s.average >= 14
        const isWarning = s.average >= 10 && s.average < 14
        const TrendIcon = diff > 0.5 ? TrendingUp : diff < -0.5 ? TrendingDown : Minus

        return (
          <motion.div
            key={s.subjectId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.03 }}
            className="group bg-card backdrop-blur-md rounded-card border border-border p-4 flex flex-col gap-3 transition-all hover:bg-accent hover:shadow-card"
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  isGood ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-rose-500"
                )} />
                <span className="text-xs font-bold text-foreground truncate">
                  {s.subjectName}
                </span>
              </div>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider tabular-nums">
                {s.count} aval.
              </span>
            </div>

            {/* Nota Principal */}
            <div className="flex items-baseline gap-0.5">
              <span className={cn(
                "text-3xl font-black tabular-nums tracking-tighter",
                isGood ? "text-emerald-600 dark:text-emerald-400" 
                  : isWarning ? "text-amber-600 dark:text-amber-400" 
                  : "text-rose-600 dark:text-rose-400"
              )}>
                {s.average.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-muted-foreground">/20</span>
            </div>

            {/* Barra de Progresso */}
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1, ease: "circOut" }}
                className={cn(
                  "h-full rounded-full",
                  isGood ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-rose-500"
                )}
              />
            </div>

            {/* Footer de Tendência */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-[10px] text-muted-foreground font-medium">
                Última: {lastScore.toFixed(0)}
              </span>
              <div className={cn("flex items-center gap-1 text-[10px] font-bold",
                diff > 0.5 ? "text-emerald-600" : diff < -0.5 ? "text-rose-600" : "text-muted-foreground"
              )}>
                <TrendIcon size={10} />
                {diff > 0.5 ? "Subiu" : diff < -0.5 ? "Desceu" : "Estável"}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}