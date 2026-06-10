"use client"

import { useTranslation } from "@/lib/i18n"
import { FileSpreadsheet, MessageSquare, FileText, SearchX } from "lucide-react"

type Props = { locale?: string }

const problems = [
  {
    icon: FileSpreadsheet,
    title: "Dados espalhados por todo o lado",
    description:
      "Informações sobre alunos, turmas e calendários em sistemas diferentes. A sua equipa gasta horas a consolidar dados que deveriam estar disponíveis instantaneamente.",
    stat: "74%",
    statLabel: "dos directores gastam +10h/semana com planilhas",
  },
  {
    icon: MessageSquare,
    title: "Comunicação perdida no WhatsApp",
    description:
      "Recados perdidos em grupos intermináveis. Pais que não recebem informações. Professores que não conseguem comunicar eficientemente com a direcção.",
    stat: "3x",
    statLabel: "mais propensos a perder comunicados importantes",
  },
  {
    icon: FileText,
    title: "Relatórios que consomem semanas",
    description:
      "No final de cada período, a equipa passa dias a compilar notas, presenças e estatísticas. Processo manual, sujeito a erros, que devia levar minutos.",
    stat: "2+",
    statLabel: "semanas para consolidar relatórios de período",
  },
  {
    icon: SearchX,
    title: "Visibilidade zero sobre o que acontece",
    description:
      "Directores não conseguem identificar problemas a tempo. Alunos com dificuldades passam despercebidos até ser tarde para intervir. Decisões baseadas em suposições.",
    stat: "60%",
    statLabel: "dos problemas académicos são detectados tarde demais",
  },
]

export default function ProblemSection({ locale = "pt" }: Props) {
  const { t } = useTranslation(locale)

  return (
    <section
      id="problems"
      className="py-20 md:py-32 bg-[var(--landing-bg)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[var(--landing-bg-secondary)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            O Desafio que as Escolas Enfrentam
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--landing-text-primary)] tracking-tight leading-none mb-6">
            Cada informação deveria estar num só lugar. Mas para a maioria das escolas, está dispersa.
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            No dia-a-dia de uma escola, notas estão numa planilha, presenças num caderno, comunicados no WhatsApp e relatórios em arquivos perdidos. A equipa administrativa sobrecarregada. Professores a perder tempo com burocracia. Directores sem visibilidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="group relative border border-[var(--landing-border)] bg-[var(--landing-bg)] p-8 rounded-xl transition-all duration-300 hover:border-[var(--landing-border-strong)] hover:shadow-sm"
              >
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={18} className="text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[var(--landing-text-primary)] tracking-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                      {item.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-lg font-black text-red-400">{item.stat}</span>
                      <span className="text-xs text-[var(--landing-text-dim)]">{item.statLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
