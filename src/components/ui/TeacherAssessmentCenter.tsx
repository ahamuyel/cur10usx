"use client"

import { motion } from "framer-motion"
import { FileCheck, Plus, Eye, ClipboardCheck, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"
import Link from "next/link"

// 1. Definição do tipo para garantir que daysPending exista e seja opcional
type ExamItem = TeacherDashboardData["assessments"]["recentExams"][number] & {
  daysPending?: number 
}

type Props = {
  data: NonNullable<TeacherDashboardData>
}

const VISIBLE_LIMIT = 4

const statusOrder: Record<string, number> = {
  pendente: 0,
  agendado: 1,
  publicado: 2,
}

export default function TeacherAssessmentCenter({ data }: Props) {
  const { assessments } = data

  const metrics = [
    {
      label: "Por corrigir",
      value: assessments.toGrade,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      icon: ClipboardCheck,
      href: assessments.toGrade > 0 ? "/list/exams?status=pendente" : undefined,
    },
    { label: "Publicadas", value: assessments.published, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", icon: Eye },
    { label: "Agendadas", value: assessments.scheduled, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10", icon: FileCheck },
  ]

  // 2. Casting seguro dos dados para respeitar a interface com daysPending
  const recentExams = assessments.recentExams as ExamItem[]

  const visible = [...recentExams]
    .sort((a, b) => {
      const orderDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
      if (orderDiff !== 0) return orderDiff
      return (b.daysPending ?? 0) - (a.daysPending ?? 0)
    })
    .slice(0, VISIBLE_LIMIT)

  const remaining = recentExams.length - visible.length

  return (
    <div className="bg-white/60 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileCheck size={14} className="text-primary" />
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Centro de Avaliações
          </h3>
        </div>
        <Link
          href="/list/exams/new"
          className="text-[9px] font-bold bg-primary/10 text-primary dark:text-primary-400 px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1 uppercase tracking-wider"
        >
          <Plus size={10} /> Criar
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {metrics.map((m) => {
          const Icon = m.icon
          const content = (
            <div className={cn("rounded-2xl p-3 border text-center", m.bg, "border-transparent", m.href && "cursor-pointer hover:opacity-80 transition-opacity")}>
              <Icon size={14} className={cn("mx-auto mb-1", m.color)} />
              <span className={cn("text-lg font-black tabular-nums block", m.color)}>
                {m.value}
              </span>
              <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mt-0.5">
                {m.label}
              </span>
            </div>
          )
          return m.href ? (
            <Link key={m.label} href={m.href}>{content}</Link>
          ) : (
            <div key={m.label}>{content}</div>
          )
        })}
      </div>

      {visible.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {visible.map((exam, idx) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                  {exam.title}
                </p>
                <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 truncate">
                  {exam.className}
                  {exam.status === "pendente" && typeof exam.daysPending === "number" && exam.daysPending > 0 && (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      {" "}· há {exam.daysPending} {exam.daysPending === 1 ? "dia" : "dias"}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                  exam.status === "publicado" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  exam.status === "pendente" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  exam.status === "agendado" && "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                )}>
                  {exam.status}
                </span>
                {exam.status === "pendente" && (
                  <Link
                    href={`/list/exams/${exam.id}/grade`}
                    className="text-[9px] font-bold bg-primary/10 text-primary dark:text-primary-400 px-2 py-0.5 rounded-lg hover:bg-primary/20 transition-all"
                  >
                    Corrigir
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nenhuma avaliação encontrada</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Cria a primeira avaliação para começar.</p>
        </div>
      )}

      {remaining > 0 && (
        <Link
          href="/list/exams"
          className="flex items-center justify-center gap-1 text-[9px] font-bold py-2.5 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/40 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors uppercase tracking-wider"
        >
          Ver todas (+{remaining}) <ChevronRight size={10} />
        </Link>
      )}
    </div>
  )
}