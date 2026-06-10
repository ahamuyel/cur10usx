"use client"

import { useTranslation } from "@/lib/i18n"
import { Building2, GraduationCap, Users, Heart } from "lucide-react"

type Props = { locale?: string }

const personas = [
  {
    icon: Building2,
    role: "Directores e Administradores",
    outcome: "Visão completa da instituição em tempo real",
    description:
      "Deixe de consolidar relatórios manualmente. Tenha acesso a toda a informação consolidada da sua escola — alunos, professores, presenças e avaliações — num único dashboard actualizado em tempo real.",
    metric: "2 semanas → 1 clique",
    metricLabel: "tempo para gerar relatórios de período",
    accent: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    border: "border-indigo-100 dark:border-indigo-900/30",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: GraduationCap,
    role: "Professores",
    outcome: "Menos burocracia. Mais tempo para ensinar.",
    description:
      "Registe presenças pelo telemóvel, lance notas em segundos e comunique com pais sem sair da sala de aula. O tempo que perdia com papel volta para o que realmente importa: os alunos.",
    metric: "45 min → 15 segundos",
    metricLabel: "tempo para registar presenças de uma turma",
    accent: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-100 dark:border-emerald-900/30",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Users,
    role: "Alunos",
    outcome: "Acompanhamento contínuo e intervenção precoce",
    description:
      "Com informações centralizadas, professores e directores acompanham o progresso de cada aluno e identificam dificuldades antes que se tornem problemas. Um percurso escolar mais apoiado.",
    metric: "60%",
    metricLabel: "dos problemas detectados antes do fim do período",
    accent: "from-amber-500 to-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-100 dark:border-amber-900/30",
    text: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Heart,
    role: "Encarregados de Educação",
    outcome: "Tranquilidade de saber como está o seu educando",
    description:
      "Receba notificações em tempo real sobre presenças, notas e comunicados. Acompanhe a vida escolar sem precisar de ligar para a escola. Uma relação escola-família mais próxima.",
    metric: "100%",
    metricLabel: "das faltas notificadas automaticamente aos pais",
    accent: "from-rose-500 to-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    border: "border-rose-100 dark:border-rose-900/30",
    text: "text-rose-600 dark:text-rose-400",
  },
]

export default function BenefitsSection({ locale = "pt" }: Props) {
  const { t } = useTranslation(locale)

  return (
    <section
      id="benefits"
      className="py-20 md:py-32 bg-[var(--landing-bg)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[var(--landing-bg-secondary)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            Benefícios para Todos
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--landing-text-primary)] tracking-tight leading-none mb-6">
            Cada pessoa na comunidade escolar ganha mais.
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            A Cur10usX foi desenhada para simplificar o dia-a-dia de todos os envolvidos na educação. Cada perfil tem o que precisa para fazer melhor o seu trabalho.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {personas.map((persona, idx) => {
            const Icon = persona.icon
            return (
              <div
                key={idx}
                className="border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] rounded-xl overflow-hidden transition-all duration-300 hover:border-[var(--landing-border-strong)] hover:shadow-sm"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`w-10 h-10 rounded-xl ${persona.bg} border ${persona.border} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={persona.text} />
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--landing-text-dim)] uppercase tracking-widest mb-0.5">
                        {persona.role}
                      </p>
                      <h3 className="text-base font-bold text-[var(--landing-text-primary)]">
                        {persona.outcome}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed mb-6">
                    {persona.description}
                  </p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${persona.bg} border ${persona.border}`}>
                    <span className={`text-base font-black ${persona.text}`}>
                      {persona.metric}
                    </span>
                    <span className={`text-[10px] ${persona.text} opacity-80`}>
                      {persona.metricLabel}
                    </span>
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
