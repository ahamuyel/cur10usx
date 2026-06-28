"use client"

import Image from "next/image"
import { useTranslation } from "@/lib/i18n"
import { BarChart3, Users, TrendingUp, Clock, ShieldCheck, Zap } from "lucide-react"

const highlights = [
  {
    icon: BarChart3,
    title: "Dashboard em tempo real",
    description: "Métricas claras sobre alunos, professores, turmas e desempenho institucional.",
  },
  {
    icon: Users,
    title: "Gestão de perfis",
    description: "Cada utilizador vê apenas o que é relevante para o seu papel na escola.",
  },
  {
    icon: TrendingUp,
    title: "Indicadores de desempenho",
    description: "Presenças, notas e evolução académica monitorizados continuamente.",
  },
  {
    icon: Clock,
    title: "Histórico completo",
    description: "Todo o percurso do aluno disponível: notas, presenças, documentos e ocorrências.",
  },
]

export default function ProductShowcase() {
  const { t } = useTranslation()

  return (
    <section
      id="produto"
      className="py-20 md:py-32 bg-[var(--landing-bg)] relative overflow-hidden"
    >
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            Produto
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--landing-text-primary)] tracking-tight leading-none mb-6">
            Veja a plataforma em acção.
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            Interfaces pensadas para cada perfil. Dados claros, acções rápidas e uma experiência que qualquer pessoa da escola consegue usar desde o primeiro dia.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16">
          <div>
            <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-900/10 dark:shadow-black/40 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11px] font-mono text-zinc-400 ml-2">cur10usx.app/dashboard</span>
              </div>
              <Image
                src="/screenshots/dashboard-1.png"
                alt="Cur10usX Dashboard — Visão Geral"
                width={1101}
                height={842}
                className="w-full h-auto"
              />
            </div>
          </div>
          <div className="space-y-6">
            {highlights.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex gap-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--landing-text-primary)] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--landing-text-secondary)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="order-last lg:order-first space-y-6">
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--landing-text-primary)] mb-1">
                  Perfis adaptados a cada utilizador
                </h3>
                <p className="text-xs text-[var(--landing-text-secondary)] leading-relaxed">
                  Administradores, professores, alunos e pais — cada utilizador vê o painel certo com as ferramentas certas para o seu dia-a-dia.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <Zap size={16} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--landing-text-primary)] mb-1">
                  Dados actualizados em tempo real
                </h3>
                <p className="text-xs text-[var(--landing-text-secondary)] leading-relaxed">
                  Todas as informações são sincronizadas instantaneamente. Uma presença marcada, uma nota lançada — tudo reflectido de imediato.
                </p>
              </div>
            </div>
          </div>
          <div className="order-first lg:order-last">
            <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-900/10 dark:shadow-black/40 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11px] font-mono text-zinc-400 ml-2">cur10usx.app/professores</span>
              </div>
              <Image
                src="/screenshots/dashboard-2.png"
                alt="Cur10usX — Gestão de Professores"
                width={1101}
                height={842}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
