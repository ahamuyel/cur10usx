"use client"

import { ClipboardList, MessageCircle, Search, Database, ArrowDown } from "lucide-react"
import { motion } from "framer-motion"
import AnimateOnScroll from "./AnimateOnScroll"

const problems = [
  {
    icon: ClipboardList,
    title: "Processos manuais",
    description: "Professores perdem horas com papelada. Registos manuais significam erros, atrasos e frustração para toda a comunidade escolar.",
    bg: "bg-sun-100 dark:bg-sun-900/30",
    iconColor: "text-sun-600 dark:text-sun-400",
  },
  {
    icon: MessageCircle,
    title: "Comunicação fragmentada",
    description: "Pais sem visibilidade do desempenho dos filhos. Escolas dependem de grupos dispersos de WhatsApp sem organização.",
    bg: "bg-growth-100 dark:bg-growth-900/30",
    iconColor: "text-growth-600 dark:text-growth-400",
  },
  {
    icon: Search,
    title: "Dados perdidos",
    description: "Informação académica espalhada por folhas soltas, Excel desorganizado e sistemas incompatíveis entre si.",
    bg: "bg-sun-100 dark:bg-sun-900/30",
    iconColor: "text-sun-600 dark:text-sun-400",
  },
  {
    icon: Database,
    title: "Sem analytics",
    description: "Decisões tomadas sem dados concretos. Não há visão clara do desempenho institucional nem formas de prever resultados.",
    bg: "bg-growth-100 dark:bg-growth-900/30",
    iconColor: "text-growth-600 dark:text-growth-400",
  },
]

export default function ProblemSection() {
  return (
    <section id="problemas" className="section-padding px-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-sun-500/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-sun-600 dark:text-sun-400 bg-sun-50 dark:bg-sun-950/30 px-4 py-1.5 border border-sun-200/50 dark:border-sun-800/30 mb-5 rounded-full">
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
                <motion.div
                  whileHover={{ x: 4 }}
                  className="card-base p-6 h-full relative group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sun-400 to-growth-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex gap-4">
                    <div className={`w-11 h-11 ${problem.bg} border border-brand-200 dark:border-brand-700 flex items-center justify-center shrink-0 rounded-lg`}>
                      <Icon className={`w-5 h-5 ${problem.iconColor}`} />
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
                </motion.div>
              </AnimateOnScroll>
            )
          })}
        </div>

        <AnimateOnScroll delay={200}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2.5 mt-10 text-warm-400"
          >
            <span className="text-sm font-medium">É aqui que o Cur10usX entra</span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="w-4 h-4 text-sun-400" />
            </motion.div>
          </motion.div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
