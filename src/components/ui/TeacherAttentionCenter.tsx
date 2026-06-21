"use client"

import { motion } from "framer-motion"
import { AlertTriangle, ChevronRight, User, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"
import Link from "next/link"

type Props = {
  data: NonNullable<TeacherDashboardData>
}

type AttentionStudent = Props["data"]["attentionStudents"][number]

// "informativa" não é risco — é um aviso neutro. Mantido por compatibilidade
// com o tipo existente, mas o ideal é este nível não chegar a este widget;
// reconsiderar na origem (hook/API) quando houver um caso de uso real para ele.
const priorityConfig: Record<AttentionStudent["priority"], {
  bg: string
  border: string
  badge: string
}> = {
  crítica: {
    bg: "bg-rose-500/5 dark:bg-rose-500/10",
    border: "border-rose-200/60 dark:border-rose-900/30",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  moderada: {
    bg: "bg-amber-500/5 dark:bg-amber-500/10",
    border: "border-amber-200/60 dark:border-amber-900/30",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  informativa: {
    bg: "bg-blue-500/5 dark:bg-blue-500/10",
    border: "border-blue-200/60 dark:border-blue-900/30",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
}

const priorityOrder: Record<AttentionStudent["priority"], number> = {
  crítica: 0,
  moderada: 1,
  informativa: 2,
}

const VISIBLE_LIMIT = 4

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function TeacherAttentionCenter({ data }: Props) {
  const students = data.attentionStudents

  const visible = [...students]
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, VISIBLE_LIMIT)

  const remaining = students.length - visible.length

  return (
    <div className="bg-white/60 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-rose-500" />
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Centro de Atenção
          </h3>
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums",
            students.length > 0
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          )}>
            {students.length}
          </span>
        </div>
        <Link
          href="/dashboard/teacher/at-risk-students"
          className="text-[9px] font-bold text-primary dark:text-primary-400 flex items-center gap-1 hover:opacity-80 transition-opacity uppercase tracking-wider cursor-pointer"
        >
          Ver todos{remaining > 0 ? ` (+${remaining})` : ""} <ChevronRight size={10} />
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
            <AlertTriangle size={18} className="text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nenhum aluno precisa de atenção</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Tudo dentro da normalidade.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((student, idx) => {
            const config = priorityConfig[student.priority]

            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className={cn(
                  "flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all hover:shadow-xs",
                  config.bg, config.border
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/30 dark:border-zinc-700/30 flex items-center justify-center text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase shrink-0">
                    {getInitials(student.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{student.name}</p>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider", config.badge)}>
                        {student.priority}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                      {student.className} · {student.subject}
                    </p>
                    <p className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {student.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/list/students/${student.id}`}
                    className="w-7 h-7 rounded-lg bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800/60 transition-all cursor-pointer"
                    aria-label={`Ver perfil de ${student.name}`}
                    title="Ver perfil"
                  >
                    <User size={12} />
                  </Link>
                  <Link
                    href={`/list/students/${student.id}?tab=contacto`}
                    className="w-7 h-7 rounded-lg bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800/60 transition-all cursor-pointer"
                    aria-label={`Contactar encarregado de ${student.name}`}
                    title="Contactar encarregado"
                  >
                    <Phone size={12} />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}