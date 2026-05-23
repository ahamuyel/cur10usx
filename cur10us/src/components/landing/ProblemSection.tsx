"use client"

import { ClipboardList, MessageCircle, Search, Database } from "lucide-react"
import AnimateOnScroll from "./AnimateOnScroll"

const problems = [
  {
    icon: ClipboardList,
    title: "Processos manuais",
    description: "Professores perdem horas com papelada. Registos manuais significam erros, atrasos e frustração.",
    bg: "bg-warm-600",
  },
  {
    icon: MessageCircle,
    title: "Comunicação fragmentada",
    description: "Pais sem visibilidade do desempenho dos filhos. Escolas dependem de grupos dispersos de WhatsApp.",
    bg: "bg-warm-500",
  },
  {
    icon: Search,
    title: "Dados perdidos",
    description: "Informação académica espalhada por folhas soltas, Excel desorganizado e sistemas incompatíveis.",
    bg: "bg-warm-600",
  },
  {
    icon: Database,
    title: "Sem analytics",
    description: "Decisões tomadas sem dados concretos. Não há visão clara do desempenho institucional.",
    bg: "bg-warm-500",
  },
]

export default function ProblemSection() {
  return (
    <section id="problemas" className="section-padding px-6">
      <div className="max-w-7xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-warm-600 dark:text-warm-400 bg-warm-100 dark:bg-warm-900/30 px-4 py-1.5 rounded-full border border-warm-200/50 dark:border-warm-800/30 mb-5">
              Os desafios
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-warm-900 dark:text-warm-100">
              A educação tradicional
              <br />
              <span className="text-warm-900 dark:text-warm-100">
                enfrenta desafios reais
              </span>
            </h2>
            <p className="text-base text-warm-500 dark:text-warm-400 max-w-xl mx-auto mt-4 leading-relaxed">
              Professores sobrecarregados, pais sem informação, alunos sem feedback.
              O sistema atual já não acompanha as necessidades da educação moderna.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {problems.map((problem, i) => {
            const Icon = problem.icon
            return (
              <AnimateOnScroll key={problem.title} delay={i * 80}>
                <div className="card-base p-6 h-full relative">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl ${problem.bg} flex items-center justify-center shadow-md shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-warm-900 dark:text-warm-100 mb-1.5">
                        {problem.title}
                      </h3>
                      <p className="text-sm text-warm-500 dark:text-warm-400 leading-relaxed">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
