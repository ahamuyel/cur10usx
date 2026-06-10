"use client"

import { useTranslation } from "@/lib/i18n"
import { Users, GraduationCap, ClipboardCheck, BarChart3, MessageSquare, FileText, Calendar, BookOpen, Building2, ShieldCheck } from "lucide-react"

type Props = { locale?: string }

const modules = [
  {
    icon: Users,
    title: "Alunos",
    description: "Perfil completo, matrícula simplificada, histórico académico e documentos organizados.",
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    icon: GraduationCap,
    title: "Professores",
    description: "Dados profissionais, turmas atribuídas, disciplinas e registo de actividades.",
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Building2,
    title: "Turmas",
    description: "Organização, horários, alocação de disciplinas e professores por turma.",
    gradient: "from-amber-500 to-amber-600",
  },
  {
    icon: ClipboardCheck,
    title: "Presenças",
    description: "Registo rápido pelo telemóvel com notificação automática aos pais.",
    gradient: "from-cyan-500 to-cyan-600",
  },
  {
    icon: BarChart3,
    title: "Avaliações",
    description: "Lançamento de notas, cálculo automático de médias e relatórios de desempenho.",
    gradient: "from-violet-500 to-violet-600",
  },
  {
    icon: FileText,
    title: "Relatórios",
    description: "Boletins, pautas e históricos gerados automaticamente. Prontos para imprimir.",
    gradient: "from-rose-500 to-rose-600",
  },
  {
    icon: MessageSquare,
    title: "Comunicação",
    description: "Avisos, notificações e mensagens para pais, professores e alunos.",
    gradient: "from-sky-500 to-sky-600",
  },
  {
    icon: Calendar,
    title: "Calendário",
    description: "Horários de aulas, exames, eventos e prazos num só lugar.",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    icon: ShieldCheck,
    title: "Segurança",
    description: "Dados encriptados, backups diários e conformidade com protecção de dados.",
    gradient: "from-teal-500 to-teal-600",
  },
  {
    icon: BookOpen,
    title: "Registos Académicos",
    description: "Histórico escolar completo, certificados e documentação organizada.",
    gradient: "from-purple-500 to-purple-600",
  },
]

const profiles = [
  { name: "Direcção", color: "bg-indigo-500", x: "left-[5%]", y: "top-0" },
  { name: "Professores", color: "bg-emerald-500", x: "left-[38%]", y: "top-0" },
  { name: "Alunos", color: "bg-amber-500", x: "left-[62%]", y: "top-0" },
  { name: "Pais", color: "bg-rose-500", x: "left-[85%]", y: "top-0" },
]

export default function ProductEcosystem({ locale = "pt" }: Props) {
  const { t } = useTranslation(locale)

  return (
    <section
      id="ecosystem"
      className="py-20 md:py-32 bg-[var(--landing-bg-dark)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dark-secondary)] uppercase tracking-widest block mb-3">
            Tudo a Funcionar em Conjunto
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-dark-primary)] leading-none mb-6">
            Tudo o que a sua escola precisa. Conectado num só lugar.
          </h2>
          <p className="text-[var(--landing-text-dark-secondary)] text-sm md:text-base leading-relaxed">
            A Cur10usX não é um conjunto de ferramentas isoladas. É um ecossistema onde cada perfil da comunidade escolar trabalha conectado.
          </p>
        </div>

        {/* Architecture visual */}
        <div className="relative mb-20">
          {/* Connected profiles */}
          <div className="flex justify-between relative">
            {profiles.map((profile) => (
              <div key={profile.name} className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-neutral-700 bg-neutral-900 flex items-center justify-center shadow-lg">
                  <span className="text-[10px] md:text-xs font-bold text-neutral-300 text-center leading-tight px-1">
                    {profile.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Connection lines */}
          <div className="relative mt-0">
            <div className="mx-auto w-fit mt-6">
              <div className="flex items-center gap-4 px-6 py-3 rounded-full border border-neutral-700 bg-neutral-900 shadow-lg">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                  CX
                </div>
                <span className="text-sm font-semibold text-neutral-100">
                  Cur10usX Platform
                </span>
                <span className="text-[10px] text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full font-mono border border-neutral-700">
                  cloud native
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modules grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {modules.map((mod) => {
            const Icon = mod.icon
            return (
              <div
                key={mod.title}
                className="group border border-neutral-800 bg-neutral-900/50 p-5 rounded-xl transition-all duration-300 hover:border-neutral-600 hover:bg-neutral-900"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mod.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={14} className="text-white" />
                </div>
                <h3 className="text-xs font-semibold text-neutral-100 mb-2">
                  {mod.title}
                </h3>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  {mod.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
