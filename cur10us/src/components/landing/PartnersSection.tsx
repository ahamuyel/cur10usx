"use client"

import { School, Users, GraduationCap, UserCheck } from "lucide-react"
import AnimateOnScroll from "./AnimateOnScroll"

const targets = [
  {
    icon: School,
    title: "Escolas",
    description: "Gestão académica centralizada com ferramentas modernas para administração e direção.",
    bg: "bg-growth-100 dark:bg-growth-900/30",
    iconColor: "text-growth-600 dark:text-growth-400",
  },
  {
    icon: Users,
    title: "Professores",
    description: "Registo de notas, presenças e comunicação simplificados para o dia-a-dia.",
    bg: "bg-sun-100 dark:bg-sun-900/30",
    iconColor: "text-sun-600 dark:text-sun-400",
  },
  {
    icon: GraduationCap,
    title: "Alunos",
    description: "Acompanhamento do desempenho escolar com feedback contínuo e transparência.",
    bg: "bg-growth-100 dark:bg-growth-900/30",
    iconColor: "text-growth-600 dark:text-growth-400",
  },
  {
    icon: UserCheck,
    title: "Famílias",
    description: "Visibilidade total sobre a vida académica com notificações em tempo real.",
    bg: "bg-sun-100 dark:bg-sun-900/30",
    iconColor: "text-sun-600 dark:text-sun-400",
  },
]

export default function PartnersSection() {
  return (
    <section className="section-padding px-6">
      <div className="max-w-7xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-growth-600 dark:text-growth-400 bg-growth-50 dark:bg-growth-950/30 px-4 py-1.5 border border-growth-200/50 dark:border-growth-800/30 mb-5">
              Ecossistema
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-warm-900 dark:text-warm-100">
              Pensado para toda a
              <br />
              <span className="text-warm-900 dark:text-warm-100">
                comunidade escolar
              </span>
            </h2>
            <p className="text-base text-warm-500 dark:text-warm-400 leading-relaxed mt-4">
              O Cur10usX foi construído para conectar escolas, professores, alunos e famílias
              numa única plataforma — simplificando a gestão e potencializando o aprendizado.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {targets.map((item) => {
            const Icon = item.icon
            return (
              <AnimateOnScroll key={item.title} delay={80}>
                <div className="card-base p-6 text-center group">
                  <div className={`w-11 h-11 ${item.bg} border border-brand-200 dark:border-brand-700 flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-base text-warm-900 dark:text-warm-100 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-warm-500 dark:text-warm-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
