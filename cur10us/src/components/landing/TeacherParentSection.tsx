"use client"

import { BarChart3, Eye, CheckCircle } from "lucide-react"
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
    bg: "bg-warm-600",
  },
  {
    title: "Acompanhamento de pais",
    items: [
      "Notificações em tempo real",
      "Boletins online atualizados",
      "Chat direto com professores",
      "Calendário escolar completo",
    ],
    bg: "bg-warm-500",
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
            <span className="inline-flex items-center gap-2 text-sm font-medium text-warm-600 dark:text-warm-400 bg-warm-100 dark:bg-warm-900/30 px-4 py-1.5 rounded-full border border-warm-200/50 dark:border-warm-800/30 mb-5">
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
              <div className="card-base p-6 hover:border-warm-200/50 dark:hover:border-warm-800/30 h-full relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-9 h-9 rounded-lg ${section.bg} flex items-center justify-center shrink-0`}>
                    {section.title === "Painel do professor" ? (
                      <BarChart3 className="w-4 h-4 text-white" />
                    ) : (
                      <Eye className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-warm-900 dark:text-warm-100">{section.title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-warm-600 dark:text-warm-400">
                      <CheckCircle className="w-3.5 h-3.5 text-warm-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <AnimateOnScroll key={metric.label} delay={300}>
              <div className="card-base p-6 text-center hover:border-warm-200/50 dark:hover:border-warm-800/30">
                <span className="text-3xl font-bold text-warm-900 dark:text-warm-100">
                  {metric.value}
                </span>
                <p className="text-sm text-warm-500 dark:text-warm-400 mt-1.5">{metric.label}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
