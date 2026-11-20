"use client"

import { TrendingUp, TrendingDown, AlertTriangle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentAcademicForecastProps {
  average: number
  previousAverage: number
  attendanceWarning: boolean
  attendancePercent: number
  subjectsNeedingAttention: string[]
}

export default function StudentAcademicForecast({
  average,
  previousAverage,
  attendanceWarning,
  attendancePercent,
  subjectsNeedingAttention,
}: StudentAcademicForecastProps) {
  const trend = average - previousAverage
  const trendUp = trend > 0
  const predictedFinal = average + trend
  const hasIssues = attendanceWarning || subjectsNeedingAttention.length > 0

  if (hasIssues) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Atenção</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {attendanceWarning && subjectsNeedingAttention.length > 0
                ? `A assiduidade (${attendancePercent}%) está abaixo do recomendado e ${subjectsNeedingAttention.length} disciplina${subjectsNeedingAttention.length > 1 ? "s" : ""} precisa${subjectsNeedingAttention.length > 1 ? "m" : ""} de atenção. Reverte esta situação para garantir bons resultados finais.`
                : attendanceWarning
                ? `A assiduidade (${attendancePercent}%) está abaixo do recomendado (85%). As faltas podem comprometer os resultados finais.`
                : `${subjectsNeedingAttention.join(", ")} precisa${subjectsNeedingAttention.length > 1 ? "m" : ""} de atenção. Foca-te nestas disciplinas para evitar reprovação.`
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (trendUp && average >= 14) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Continua assim! 🚀</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Mantendo este ritmo, a tua média prevista no final do ano será <strong className="text-zinc-900 dark:text-zinc-100">{predictedFinal.toFixed(1)}</strong>.
              Estás no caminho certo para superar as tuas metas!
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!trendUp && average >= 10) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
            <TrendingDown size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Podes melhorar</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              A tua média baixou {Math.abs(trend).toFixed(1)} pontos. Revê o teu método de estudo e dedica mais tempo às disciplinas
              com notas mais baixas. Ainda vais a tempo de recuperar!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
          <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Precisas de agir</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            A tua média está abaixo de 10 valores. Conversa com os teus professores, pede ajuda e organiza um plano de estudo.
            Com dedicação, ainda pós reverter a situação.
          </p>
        </div>
      </div>
    </div>
  )
}
