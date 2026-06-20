"use client"

import { useTranslation } from "@/lib/i18n"

const statusColors: Record<string, string> = {
  pendente: "bg-amber text-amber-700 dark:bg-amber dark:text-amber-400",
  em_analise: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  aprovada: "bg-emerald text-emerald-700 dark:bg-emerald dark:text-emerald-400",
  ativa: "bg-emerald text-emerald-700 dark:bg-emerald dark:text-emerald-400",
  matriculada: "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground",
  rejeitada: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  suspensa: "bg-muted text-foreground",
  // Ticket statuses
  aberto: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  em_andamento: "bg-amber text-amber-700 dark:bg-amber dark:text-amber-400",
  resolvido: "bg-emerald text-emerald-700 dark:bg-emerald dark:text-emerald-400",
  arquivado: "bg-muted text-foreground",
  // Import statuses
  processando: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  concluida: "bg-emerald text-emerald-700 dark:bg-emerald dark:text-emerald-400",
  parcial: "bg-amber text-amber-700 dark:bg-amber dark:text-amber-400",
  falhada: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
}

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  ativa: "Ativa",
  matriculada: "Matriculada",
  rejeitada: "Rejeitada",
  suspensa: "Suspensa",
  // Ticket statuses
  aberto: "Aberto",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
  arquivado: "Arquivado",
  // Import statuses
  processando: "Processando",
  concluida: "Concluída",
  parcial: "Parcial",
  falhada: "Falhada",
}

export default function StatusBadge({ status }: { status: string }) {
  const { tUI } = useTranslation()
  const label = statusLabels[status] || status
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || "bg-muted text-muted-foreground"}`}
    >
      {tUI(label)}
    </span>
  )
}
