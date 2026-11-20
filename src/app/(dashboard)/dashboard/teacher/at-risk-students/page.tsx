"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { 
  ChevronLeft, Loader2, AlertTriangle, UserCheck, 
  MessageSquare, FileEdit, User, ArrowRight, Clock,
  CalendarCheck, AlertCircle, Sparkles
} from "lucide-react"
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function TeacherAtRiskStudentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [teacherId, setTeacherId] = useState<string | null>(null)
  
  // Custom hook for getting teacher dashboard data
  const { data, loading, error } = useTeacherDashboard(teacherId)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin")
      return
    }

    async function loadTeacher() {
      try {
        const res = await fetch("/api/profile")
        const json = await res.json()
        if (json.teacher?.id) {
          setTeacherId(json.teacher.id)
        }
      } catch (err) {
        console.error("Erro ao carregar dados do professor:", err)
      }
    }

    if (status === "authenticated") {
      loadTeacher()
    }
  }, [status, router])

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          A carregar alunos em risco...
        </p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <div className="flex items-center gap-3 text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-6 py-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
          <AlertCircle size={18} />
          <span className="text-xs font-semibold">
            {error || "Não foi possível carregar a lista de alunos em risco."}
          </span>
        </div>
      </div>
    )
  }

  // Filter students based on priority levels: crítica and moderada are higher risk.
  // We'll show all students in the attention list on this page as they need tracking.
  const students = data.attentionStudents || []
  
  // Calculate specific risk counts
  const criticalCount = students.filter(s => s.priority === "crítica").length
  const moderateCount = students.filter(s => s.priority === "moderada").length
  const infoCount = students.filter(s => s.priority === "informativa").length

  return (
    <div className="w-full space-y-6 pb-16 px-4 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Header com botão de voltar */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => router.push(`/dashboard/${session?.user?.id}`)}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors uppercase tracking-wider w-fit cursor-pointer animate-in slide-in-from-left-4 duration-300"
        >
          <ChevronLeft size={14} />
          Voltar ao Painel
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Acompanhamento de Alunos em Risco
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Lista consolidada de estudantes que necessitam de intervenção ou monitorização preventiva.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de KPIs do Centro de Atenção */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-3xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-250">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Sinalizados</span>
            <AlertTriangle className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-3xl font-black mt-2 text-zinc-900 dark:text-white tabular-nums leading-none">
            {String(students.length).padStart(2, '0')}
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5">Alunos a requerer atenção</p>
        </div>

        <div className="bg-rose-50/40 dark:bg-rose-950/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 shadow-3xs hover:border-rose-250 dark:hover:border-rose-800 transition-colors duration-250">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Risco Crítico</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-black mt-2 text-rose-600 dark:text-rose-400 tabular-nums leading-none">
            {String(criticalCount).padStart(2, '0')}
          </p>
          <p className="text-[10px] text-rose-500/80 dark:text-rose-400/80 mt-1.5">Média &lt; 10 ou faltas graves</p>
        </div>

        <div className="bg-amber-50/40 dark:bg-amber-950/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-3xs hover:border-amber-250 dark:hover:border-amber-800 transition-colors duration-250">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Risco Moderado</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black mt-2 text-amber-600 dark:text-amber-400 tabular-nums leading-none">
            {String(moderateCount).padStart(2, '0')}
          </p>
          <p className="text-[10px] text-amber-500/80 dark:text-amber-400/80 mt-1.5">Média entre 10 e 12</p>
        </div>

        <div className="bg-blue-50/40 dark:bg-blue-950/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-3xs hover:border-blue-250 dark:hover:border-blue-800 transition-colors duration-250">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Monitorização</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black mt-2 text-blue-600 dark:text-blue-400 tabular-nums leading-none">
            {String(infoCount).padStart(2, '0')}
          </p>
          <p className="text-[10px] text-blue-500/80 dark:text-blue-400/80 mt-1.5">Absentismo em observação</p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
              <UserCheck size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Nenhum aluno em risco</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
              Excelente! Todos os seus educandos e turmas estão dentro dos parâmetros de desempenho e assiduidade esperados.
            </p>
            <button 
              onClick={() => router.push(`/dashboard/${session?.user?.id}`)}
              className="mt-6 flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:opacity-80 transition-opacity uppercase tracking-wider cursor-pointer"
            >
              Ir para o painel principal <ArrowRight size={12} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Alunos Identificados ({students.length})
              </h3>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles size={10} className="text-amber-500" /> Atualização em Tempo Real
              </span>
            </div>

            {/* Tabela de Alunos em Risco */}
            <div className="w-full overflow-x-auto rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/10 dark:bg-zinc-950/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-900/30">
                    <th className="py-3.5 px-4 font-bold">Aluno(a)</th>
                    <th className="py-3.5 px-4 font-bold">Turma / Disciplina</th>
                    <th className="py-3.5 px-4 font-bold text-center">Nível de Risco</th>
                    <th className="py-3.5 px-4 font-bold">Indicador / Motivo</th>
                    <th className="py-3.5 px-4 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/40 text-sm">
                  {students.map((student) => {
                    const isCritical = student.priority === "crítica"
                    const isModerate = student.priority === "moderada"

                    return (
                      <tr 
                        key={student.id} 
                        className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-colors group"
                      >
                        {/* Nome do aluno */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/40 dark:border-zinc-700/40 flex items-center justify-center text-[11px] font-black text-zinc-600 dark:text-zinc-400 shrink-0">
                              {student.name[0]}
                            </div>
                            <div>
                              <Link 
                                href={`/list/students/${student.id}`}
                                className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-violet-600 dark:hover:text-violet-400 transition-colors hover:underline"
                              >
                                {student.name}
                              </Link>
                            </div>
                          </div>
                        </td>

                        {/* Turma e Disciplina */}
                        <td className="py-3.5 px-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          <div>{student.className}</div>
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{student.subject}</div>
                        </td>

                        {/* Nível de Risco */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                            isCritical 
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              : isModerate 
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              isCritical ? "bg-rose-500" : isModerate ? "bg-amber-500" : "bg-blue-500"
                            )} />
                            {student.priority}
                          </span>
                        </td>

                        {/* Motivo */}
                        <td className="py-3.5 px-4">
                          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            {student.reason}
                          </p>
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                            <Link 
                              href={`/list/students/${student.id}`}
                              className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                              title="Ver Perfil"
                            >
                              <User size={13} />
                            </Link>
                            <Link 
                              href={`/list/messages?new=true&to=${student.id}`}
                              className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                              title="Enviar Mensagem"
                            >
                              <MessageSquare size={13} />
                            </Link>
                            <Link 
                              href={`/list/results?studentId=${student.id}`}
                              className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                              title="Registar Observação / Ver Resultados"
                            >
                              <FileEdit size={13} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
