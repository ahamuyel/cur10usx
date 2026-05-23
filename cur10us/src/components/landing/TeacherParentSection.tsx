"use client"

import { BarChart3, Eye, CheckCircle, TrendingUp } from "lucide-react"
import AnimateOnScroll from "./AnimateOnScroll"

const teacherFeatures = [
  {
    title: "Painel do professor",
    items: [
      "Lançamento rápido de notas",
      "Registo de presenças integrado",
      "Planos de aula e materiais",
      "Comunicação com pais e direção",
    ],
    bg: "bg-growth-100 dark:bg-growth-900/30",
    iconColor: "text-growth-600 dark:text-growth-400",
  },
  {
    title: "Acompanhamento de pais",
    items: [
      "Notificações em tempo real",
      "Boletins online atualizados",
      "Chat direto com professores",
      "Calendário escolar completo",
    ],
    bg: "bg-sun-100 dark:bg-sun-900/30",
    iconColor: "text-sun-600 dark:text-sun-400",
  },
]

const metrics = [
  { value: "86%", label: "Menos trabalho administrativo" },
  { value: "3x", label: "Mais rapidez na comunicação" },
  { value: "100%", label: "Dados centralizados" },
]

export default function TeacherParentSection() {
  return (
    <section className="section-padding px-6">
      <div className="max-w-7xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-sun-600 dark:text-sun-400 bg-sun-50 dark:bg-sun-950/30 px-4 py-1.5 border border-sun-200/50 dark:border-sun-800/30 mb-5">
              <BarChart3 className="w-4 h-4" />
              Professores e famílias
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-warm-900 dark:text-warm-100">
              Menos papel,{" "}
              <span className="text-warm-900 dark:text-warm-100">
                mais conexão
              </span>
            </h2>
            <p className="text-base text-warm-500 dark:text-warm-400 max-w-xl mx-auto mt-4 leading-relaxed">
              Ferramentas que simplificam o dia-a-dia dos professores e aproximam as famílias da vida escolar.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid lg:grid-cols-2 gap-5 mb-12">
          {teacherFeatures.map((section) => (
            <AnimateOnScroll key={section.title} delay={150}>
              <div className="card-base p-6 h-full relative group">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 ${section.bg} border border-brand-200 dark:border-brand-700 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    {section.title === "Painel do professor" ? (
                      <BarChart3 className={`w-5 h-5 ${section.iconColor}`} />
                    ) : (
                      <Eye className={`w-5 h-5 ${section.iconColor}`} />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-warm-900 dark:text-warm-100">{section.title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-warm-600 dark:text-warm-400">
                      <CheckCircle className="w-3.5 h-3.5 text-growth-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric, i) => (
            <AnimateOnScroll key={metric.label} delay={300 + i * 50}>
              <div className="card-base p-6 text-center group">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-3xl font-bold text-warm-900 dark:text-warm-100">{metric.value}</span>
                  {i === 0 && <TrendingUp className="w-5 h-5 text-growth-500" />}
                </div>
                <p className="text-sm text-warm-500 dark:text-warm-400">{metric.label}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
