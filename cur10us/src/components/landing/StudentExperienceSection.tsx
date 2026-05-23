"use client"

import { Trophy, Target, Zap, TrendingUp, CheckCircle } from "lucide-react"
import AnimateOnScroll from "./AnimateOnScroll"

const highlights = [
  {
    icon: Trophy,
    title: "Gamificação inteligente",
    description: "Conquistas e rankings que motivam os alunos a superarem-se.",
    bg: "bg-warm-600",
  },
  {
    icon: Target,
    title: "Metas personalizadas",
    description: "Cada aluno define objetivos e acompanha a evolução em tempo real.",
    bg: "bg-warm-500",
  },
  {
    icon: Zap,
    title: "Feedback imediato",
    description: "Resultados disponíveis logo após a correção, com recomendações.",
    bg: "bg-warm-600",
  },
  {
    icon: TrendingUp,
    title: "Evolução visual",
    description: "Gráficos claros do progresso ao longo do ano, disciplina por disciplina.",
    bg: "bg-warm-500",
  },
]

const benefits = [
  "Agenda organizada com prazos",
  "Materiais sempre disponíveis",
  "Comunicação com professores",
  "Histórico de desempenho",
]

export default function StudentExperienceSection() {
  return (
    <section id="experiencia" className="section-padding px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <AnimateOnScroll direction="left" className="order-2 lg:order-1">
            <div className="relative">
              <div className="rounded-2xl bg-warm-100/50 dark:bg-warm-900/30 border border-warm-200/50 dark:border-warm-800/50 p-5">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-warm-600 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-warm-900 dark:text-white">O Teu Progresso</div>
                    <div className="text-[11px] text-warm-500 dark:text-warm-400">Visão do estudante</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {[
                    { name: "Matemática", grade: "16" },
                    { name: "Português", grade: "15" },
                    { name: "Física", grade: "18" },
                    { name: "História", grade: "14" },
                  ].map((subject) => (
                    <div
                      key={subject.name}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white/50 dark:bg-warm-900/50 border border-warm-200 dark:border-warm-800/50"
                    >
                      <span className="text-sm text-warm-700 dark:text-warm-300">{subject.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-warm-900 dark:text-warm-100">{subject.grade}/20</span>
                        <CheckCircle className="w-3.5 h-3.5 text-warm-500" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-warm-100/80 dark:bg-warm-800/30 border border-warm-200/50 dark:border-warm-800/50">
                  <div>
                    <div className="text-[11px] text-warm-500 dark:text-warm-400">Média Geral</div>
                    <div className="text-xl font-bold text-warm-900 dark:text-white">15.7</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-warm-600 dark:text-warm-400 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +8% este trimestre
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll direction="right" className="order-1 lg:order-2">
            <div className="flex flex-col gap-5">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-warm-600 dark:text-warm-400 bg-warm-100 dark:bg-warm-900/30 px-4 py-1.5 rounded-full border border-warm-200/50 dark:border-warm-800/30 w-fit">
                Experiência do estudante
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-warm-900 dark:text-warm-100 leading-[1.1]">
                O aluno no centro
                <br />
                <span className="text-warm-900 dark:text-warm-100">
                  de tudo
                </span>
              </h2>

              <p className="text-sm sm:text-base text-warm-500 dark:text-warm-400 leading-relaxed">
                Uma experiência motivadora que transforma a rotina escolar numa jornada de crescimento.
                O estudante ganha autonomia, visibilidade e incentivo.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {highlights.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.title}
                      className="group p-4 rounded-xl bg-white dark:bg-warm-900/50 border border-warm-200 dark:border-warm-800/50 hover:border-warm-200/50 dark:hover:border-warm-800/30 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm text-warm-900 dark:text-warm-100 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-warm-500 dark:text-warm-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-1.5 text-sm text-warm-600 dark:text-warm-400">
                    <CheckCircle className="w-3.5 h-3.5 text-warm-500 shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
