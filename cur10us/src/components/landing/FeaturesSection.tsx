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
import { motion } from "framer-motion"
import { StaggerContainer, StaggerItem } from "./AnimateOnScroll"
import Carousel from "./Carousel"

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboards intuitivos",
    description: "Visão geral em tempo real com métricas claras para cada perfil da escola.",
    bg: "bg-growth-100 dark:bg-growth-900/30",
    iconColor: "text-growth-600 dark:text-growth-400",
  },
  {
    icon: Users,
    title: "Gestão de alunos",
    description: "Matrículas, perfis, turmas e acompanhamento individual completo.",
    bg: "bg-sun-100 dark:bg-sun-900/30",
    iconColor: "text-sun-600 dark:text-sun-400",
  },
  {
    icon: ClipboardCheck,
    title: "Controlo de assiduidade",
    description: "Registo de presenças por aula ou dia, com relatórios automáticos.",
    bg: "bg-growth-100 dark:bg-growth-900/30",
    iconColor: "text-growth-600 dark:text-growth-400",
  },
  {
    icon: GraduationCap,
    title: "Notas e avaliações",
    description: "Lançamento de notas com médias automáticas por trimestre e exame.",
    bg: "bg-sun-100 dark:bg-sun-900/30",
    iconColor: "text-sun-600 dark:text-sun-400",
  },
  {
    icon: MessageSquare,
    title: "Comunicação interna",
    description: "Avisos, mensagens e notificações para toda a comunidade escolar.",
    bg: "bg-growth-100 dark:bg-growth-900/30",
    iconColor: "text-growth-600 dark:text-growth-400",
  },
  {
    icon: FileText,
    title: "Candidaturas online",
    description: "Formulário público de matrícula com acompanhamento de estado.",
    bg: "bg-sun-100 dark:bg-sun-900/30",
    iconColor: "text-sun-600 dark:text-sun-400",
  },
  {
    icon: Calendar,
    title: "Calendário e horários",
    description: "Horários de aulas, exames e eventos escolares num só lugar.",
    bg: "bg-growth-100 dark:bg-growth-900/30",
    iconColor: "text-growth-600 dark:text-growth-400",
  },
  {
    icon: BarChart3,
    title: "Relatórios detalhados",
    description: "Análises de desempenho, frequência e evolução institucional.",
    bg: "bg-sun-100 dark:bg-sun-900/30",
    iconColor: "text-sun-600 dark:text-sun-400",
  },
]

export default function FeaturesSection() {
  return (
    <section id="solucao" className="section-padding px-6">
      <div className="max-w-7xl mx-auto">
        <StaggerContainer className="text-center mb-14" staggerDelay={0.03}>
          <StaggerItem>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-growth-600 dark:text-growth-400 bg-growth-50 dark:bg-growth-950/30 px-4 py-1.5 border border-growth-200/50 dark:border-growth-800/30 mb-5 rounded-full">
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

        <Carousel
          className="max-w-7xl mx-auto"
          itemWidth="min-w-[280px] w-[85vw] sm:min-w-[300px] sm:w-[45vw] lg:min-w-[260px] lg:w-[22vw]"
          autoPlay
          interval={5000}
        >
          {features.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                whileHover={{ y: -4 }}
                className="card-base p-6 h-full group"
              >
                <div className={`w-11 h-11 ${item.bg} border border-brand-200 dark:border-brand-700 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <h3 className="font-bold text-base text-warm-900 dark:text-warm-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-warm-500 dark:text-warm-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            )
          })}
        </Carousel>
      </div>
    </section>
  )
}
