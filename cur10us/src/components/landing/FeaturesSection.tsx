"use client"

import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  GraduationCap,
  MessageSquare,
  FileText,
  Calendar,
  BarChart3,
} from "lucide-react"
import { StaggerContainer, StaggerItem } from "./AnimateOnScroll"

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboards intuitivos",
    description: "Visão geral em tempo real com métricas claras para cada perfil.",
    bg: "bg-warm-600",
  },
  {
    icon: Users,
    title: "Gestão de alunos",
    description: "Matrículas, perfis, turmas e acompanhamento individual completo.",
    bg: "bg-warm-500",
  },
  {
    icon: ClipboardCheck,
    title: "Controlo de assiduidade",
    description: "Registo de presenças por aula ou dia, com relatórios automáticos.",
    bg: "bg-warm-600",
  },
  {
    icon: GraduationCap,
    title: "Notas e avaliações",
    description: "Lançamento de notas com médias automáticas por trimestre e exame.",
    bg: "bg-warm-500",
  },
  {
    icon: MessageSquare,
    title: "Comunicação interna",
    description: "Avisos, mensagens e notificações para toda a comunidade escolar.",
    bg: "bg-warm-600",
  },
  {
    icon: FileText,
    title: "Candidaturas online",
    description: "Formulário público de matrícula com acompanhamento de estado.",
    bg: "bg-warm-500",
  },
  {
    icon: Calendar,
    title: "Calendário e horários",
    description: "Horários de aulas, exames e eventos escolares num só lugar.",
    bg: "bg-warm-600",
  },
  {
    icon: BarChart3,
    title: "Relatórios detalhados",
    description: "Análises de desempenho, frequência e evolução institucional.",
    bg: "bg-warm-500",
  },
]

export default function FeaturesSection() {
  return (
    <section id="solucao" className="section-padding px-6">
      <div className="max-w-7xl mx-auto">
        <StaggerContainer className="text-center mb-14" staggerDelay={0.03}>
          <StaggerItem>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-warm-600 dark:text-warm-400 bg-warm-100 dark:bg-warm-900/30 px-4 py-1.5 rounded-full border border-warm-200/50 dark:border-warm-800/30 mb-5">
              A solução completa
            </span>
          </StaggerItem>
          <StaggerItem>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-warm-900 dark:text-warm-100">
              Tudo que a sua escola precisa,
              <br />
              <span className="text-warm-900 dark:text-warm-100">
                numa só plataforma
              </span>
            </h2>
          </StaggerItem>
          <StaggerItem>
            <p className="text-base text-warm-500 dark:text-warm-400 max-w-xl mx-auto mt-4 leading-relaxed">
              Ferramentas modernas pensadas para cada momento do ecossistema escolar.
            </p>
          </StaggerItem>
        </StaggerContainer>

        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          staggerDelay={0.04}
        >
          {features.map((item) => {
            const Icon = item.icon
            return (
              <StaggerItem key={item.title}>
                <div className="card-base p-6 h-full relative">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3.5 shadow-md`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-base text-warm-900 dark:text-warm-100 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-warm-500 dark:text-warm-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}
