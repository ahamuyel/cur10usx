"use client"

import { useRef } from "react"
import {
  LayoutDashboard,
  Sparkles,
  BookOpenCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Bell,
  QrCode,
  TrendingUp,
  Users,
  Layers,
  Calendar,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import {
  ProgressSlider,
  SliderContent,
  SliderWrapper,
  SliderBtnGroup,
  SliderBtn,
} from "@/components/ui/progressive-carousel"
import { Spotlight, SpotLightItem } from "@/components/ui/spotlight"
import { TimelineAnimation } from "@/components/ui/timeline-animation"

type ExperienceView = {
  id: string
  label: string
  url: string
  title: string
  description: string
}

const viewIcons: Record<string, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  evolution: Sparkles,
  classroom: BookOpenCheck,
}

function OverviewWorkspacePreview() {
  const healthRows = [
    { code: "10.ª A", track: "Ciências Físicas", bar: 86, status: "Estável" },
    { code: "11.ª B", track: "Informática", bar: 92, status: "Óptimo" },
    { code: "12.ª A", track: "Economia", bar: 68, status: "Atenção" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 min-h-[340px] sm:min-h-[380px] bg-[var(--landing-bg)]">
      {/* Mini app sidebar rail */}
      <div className="hidden md:flex md:col-span-3 flex-col justify-between p-4 border-r border-[var(--landing-border)] bg-[var(--landing-bg-secondary)]/60">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[var(--landing-surface)] border border-[var(--landing-border)]">
            <span className="w-2 h-2 rounded-full bg-[var(--landing-accent)]" />
            <span className="text-[11px] font-medium text-[var(--landing-text-primary)] truncate">
              Painel Institucional
            </span>
          </div>
          {[
            { icon: Users, label: "Matrículas & Perfis" },
            { icon: Layers, label: "Turmas & Cursos" },
            { icon: Calendar, label: "Anos Lectivos" },
            { icon: ShieldCheck, label: "Permissões RBAC" },
          ].map(({ icon: NavIcon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-[var(--landing-text-muted)]"
            >
              <NavIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Tenant isolado · 2FA activo
          </div>
          <p className="mt-1 text-[10px] text-[var(--landing-text-muted)] leading-relaxed">
            Auditoria contínua por escola e por perfil.
          </p>
        </div>
      </div>

      {/* Main dashboard canvas */}
      <div className="md:col-span-9 p-4 sm:p-6 flex flex-col justify-between gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Ciclo Académico", state: "Ano lectivo activo", accent: true },
            { label: "Saúde das Turmas", state: "Monitorização contínua", accent: false },
            { label: "Documentos Oficiais", state: "Verificação pública", accent: false },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[var(--landing-text-muted)]">
                  {card.label}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    card.accent ? "bg-[var(--landing-accent)]" : "bg-[var(--landing-border-strong)]"
                  }`}
                />
              </div>
              <p className="mt-2 text-xs font-medium text-[var(--landing-text-primary)]">
                {card.state}
              </p>
              <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--landing-bg-tertiary)] overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    card.accent ? "w-4/5 bg-[var(--landing-accent)]" : "w-3/5 bg-[var(--landing-text-muted)]/40"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Class health telemetry table */}
        <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--landing-border-subtle)] flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--landing-text-primary)]">
              Saúde Académica por Turma
            </span>
            <span className="text-[10px] font-mono text-[var(--landing-text-muted)]">
              LIVE · MULTI-TURMA
            </span>
          </div>
          <div className="divide-y divide-[var(--landing-border-subtle)]">
            {healthRows.map((row) => (
              <div
                key={row.code}
                className="px-4 py-3 grid grid-cols-12 items-center gap-3"
              >
                <div className="col-span-5 sm:col-span-4 min-w-0">
                  <p className="text-xs font-medium text-[var(--landing-text-primary)] truncate">
                    {row.code}
                  </p>
                  <p className="text-[10px] text-[var(--landing-text-muted)] truncate">
                    {row.track}
                  </p>
                </div>
                <div className="col-span-4 sm:col-span-5">
                  <div className="h-1.5 rounded-full bg-[var(--landing-bg-tertiary)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        row.bar >= 80 ? "bg-[var(--landing-accent)]" : "bg-amber-500"
                      }`}
                      style={{ width: `${row.bar}%` }}
                    />
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                      row.bar >= 80
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EvolutionWorkspacePreview() {
  const topics = [
    { name: "Álgebra & Funções", level: "Dominado", tone: "bg-[var(--landing-accent)]" },
    { name: "Mecânica Aplicada", level: "Consolidado", tone: "bg-emerald-500" },
    { name: "Redacção Científica", level: "Em curso", tone: "bg-cyan-500" },
    { name: "Estatística Descritiva", level: "Reforço", tone: "bg-amber-500" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 min-h-[340px] sm:min-h-[380px] bg-[var(--landing-bg)] p-4 sm:p-6 gap-4">
      {/* Left: Longitudinal Trajectory */}
      <div className="md:col-span-7 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--landing-accent)]" aria-hidden="true" />
              <span className="text-xs font-medium text-[var(--landing-text-primary)]">
                Curva Evolutiva Longitudinal
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] text-[var(--landing-text-muted)]">
              MULTI-ANO
            </span>
          </div>
          <p className="mt-1 text-[11px] font-light text-[var(--landing-text-secondary)]">
            Assiduidade, avaliações contínuas e domínio curricular num só eixo.
          </p>
        </div>

        {/* SVG Trajectory Curve */}
        <div className="my-4 rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)]/60 p-4">
          <svg
            viewBox="0 0 360 120"
            className="w-full h-28 overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="exp-evo-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--landing-accent)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--landing-accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[25, 58, 91].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="360"
                y2={y}
                stroke="var(--landing-border)"
                strokeDasharray="3 4"
              />
            ))}
            <path
              d="M 12 96 C 72 88, 102 64, 152 56 C 204 48, 244 34, 348 18 L 348 112 L 12 112 Z"
              fill="url(#exp-evo-area)"
            />
            <path
              d="M 12 96 C 72 88, 102 64, 152 56 C 204 48, 244 34, 348 18"
              fill="none"
              stroke="var(--landing-accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {[
              { x: 12, y: 96, label: "Ingresso" },
              { x: 120, y: 64, label: "Trim. I" },
              { x: 232, y: 40, label: "Trilhas" },
              { x: 348, y: 18, label: "Portfólio" },
            ].map((pt) => (
              <g key={pt.label}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="var(--landing-surface)"
                  stroke="var(--landing-accent)"
                  strokeWidth="2"
                />
                <text
                  x={pt.x}
                  y="116"
                  textAnchor={pt.x === 12 ? "start" : pt.x === 348 ? "end" : "middle"}
                  fill="var(--landing-text-muted)"
                  fontSize="9"
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Topic Mastery Pills */}
        <div className="grid grid-cols-2 gap-2">
          {topics.map((topic) => (
            <div
              key={topic.name}
              className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)]/50"
            >
              <span className="flex items-center gap-1.5 text-[11px] text-[var(--landing-text-primary)] truncate">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${topic.tone}`} />
                <span className="truncate">{topic.name}</span>
              </span>
              <span className="text-[10px] font-mono text-[var(--landing-text-muted)] shrink-0">
                {topic.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Verifiable Credential Card */}
      <div className="md:col-span-5 flex flex-col gap-4">
        <div className="flex-1 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--landing-accent)]">
                Portfólio Verificável
              </span>
              <QrCode className="w-4 h-4 text-[var(--landing-text-muted)]" aria-hidden="true" />
            </div>
            <h4 className="mt-2 text-sm font-medium text-[var(--landing-text-primary)]">
              Histórico & Certificação Oficial
            </h4>
            <p className="mt-1 text-[11px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
              Declarações e certificados emitidos pela instituição com validação pública instantânea.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            {[
              "Histórico Multi-Ano Consolidado",
              "Competências & Trilhas Concluídas",
              "Código Público de Autenticidade",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-[11px] text-[var(--landing-text-primary)]"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--landing-border-subtle)] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--landing-text-muted)]">
              /verificar-certificado
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
              Autêntico
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClassroomWorkspacePreview() {
  const schedule = [
    { time: "08:00", title: "Matemática · 10.ª A", state: "Chamada registada" },
    { time: "09:45", title: "Física Aplicada · 11.ª B", state: "Em aula" },
    { time: "11:30", title: "Projecto Integrador · 12.ª A", state: "Próxima sessão" },
  ]

  const notifications = [
    {
      title: "Presença confirmada",
      meta: "Notificação imediata ao encarregado",
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Justificação digital recebida",
      meta: "Validação pela coordenação pedagógica",
      tone: "text-[var(--landing-accent)]",
    },
    {
      title: "Nova tarefa publicada",
      meta: "Prazo sincronizado no calendário do aluno",
      tone: "text-cyan-600 dark:text-cyan-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 min-h-[340px] sm:min-h-[380px] bg-[var(--landing-bg)] p-4 sm:p-6 gap-4">
      {/* Left: Classroom Schedule & Digital Attendance */}
      <div className="md:col-span-7 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--landing-text-primary)]">
              Agenda Docente & Chamada Digital
            </span>
            <Clock className="w-3.5 h-3.5 text-[var(--landing-text-muted)]" aria-hidden="true" />
          </div>

          <div className="mt-4 space-y-2.5">
            {schedule.map((slot, idx) => (
              <div
                key={slot.time}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                  idx === 1
                    ? "border-[var(--landing-accent)]/40 bg-[var(--landing-accent-subtle)]/40"
                    : "border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)]/50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[11px] font-mono text-[var(--landing-text-muted)] shrink-0">
                    {slot.time}
                  </span>
                  <span className="text-xs font-medium text-[var(--landing-text-primary)] truncate">
                    {slot.title}
                  </span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text-secondary)] shrink-0">
                  {slot.state}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance state legend */}
        <div className="mt-4 pt-3 border-t border-[var(--landing-border-subtle)] flex flex-wrap items-center gap-2">
          {[
            { label: "Presente", dot: "bg-emerald-500" },
            { label: "Justificada", dot: "bg-[var(--landing-accent)]" },
            { label: "Atraso", dot: "bg-amber-500" },
          ].map((pill) => (
            <span
              key={pill.label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] text-[10px] font-medium text-[var(--landing-text-secondary)]"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${pill.dot}`} />
              {pill.label}
            </span>
          ))}
        </div>
      </div>

      {/* Right: Synchronized Family Feed */}
      <div className="md:col-span-5 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--landing-text-primary)]">
              Sincronia Escola ↔ Família
            </span>
            <Bell className="w-3.5 h-3.5 text-[var(--landing-accent)]" aria-hidden="true" />
          </div>
          <p className="mt-1 text-[11px] font-light text-[var(--landing-text-secondary)]">
            Eventos académicos entregues com contexto e histórico auditável.
          </p>

          <div className="mt-4 space-y-2.5">
            {notifications.map((item) => (
              <div
                key={item.title}
                className="p-3 rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)]/50"
              >
                <p className={`text-xs font-medium ${item.tone}`}>{item.title}</p>
                <p className="mt-0.5 text-[11px] font-light text-[var(--landing-text-secondary)]">
                  {item.meta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function renderWorkspacePreview(id: string) {
  switch (id) {
    case "evolution":
      return <EvolutionWorkspacePreview />
    case "classroom":
      return <ClassroomWorkspacePreview />
    case "overview":
    default:
      return <OverviewWorkspacePreview />
  }
}

export default function PlatformExperienceSection() {
  const { t, tv } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const views = (tv("landing.experience.views") as ExperienceView[]) || []

  if (!views.length) return null

  const sliderOrder = views.map((v) => v.id)

  return (
    <section
      id="experiencia"
      ref={sectionRef}
      className="py-20 sm:py-24 lg:py-28 bg-[var(--landing-bg)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TimelineAnimation timelineRef={sectionRef} animationNum={0} className="max-w-2xl mb-10 sm:mb-12">
          <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-2.5">
            {t("landing.experience.tag")}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]">
            {t("landing.experience.headline")}
          </h2>
          <p className="mt-3.5 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
            {t("landing.experience.description")}
          </p>
        </TimelineAnimation>

        {/* UI Layouts Progressive Carousel wrapping live code-rendered workspace previews */}
        <TimelineAnimation timelineRef={sectionRef} animationNum={1}>
          <ProgressSlider
            activeSlider={views[0].id}
            sliderOrder={sliderOrder}
            duration={7000}
            fastDuration={260}
          >
            {/* Interactive Workspace Canvas inside Spotlight frame */}
            <Spotlight className="block" ProximitySpotlight={true} HoverFocusSpotlight={false}>
              <SpotLightItem className="rounded-2xl shadow-[0_24px_64px_-32px_rgba(9,9,11,0.18)] dark:shadow-[0_24px_64px_-32px_rgba(0,0,0,0.8)]">
                <div className="rounded-[15px] overflow-hidden bg-[var(--landing-surface)]">
                  <SliderContent>
                    {views.map((view) => (
                      <SliderWrapper key={view.id} value={view.id}>
                        {/* Browser Chrome Header */}
                        <div className="flex items-center justify-between px-4 h-10 border-b border-[var(--landing-border)] bg-[var(--landing-bg-secondary)]">
                          <div className="flex items-center gap-1.5" aria-hidden="true">
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--landing-border-strong)]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--landing-border-strong)]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--landing-border-strong)]" />
                          </div>
                          <span className="text-[11px] font-mono text-[var(--landing-text-muted)] truncate px-3">
                            {view.url}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--landing-accent)] hidden sm:inline">
                            {view.label}
                          </span>
                        </div>

                        {/* Live Theme-Native Workspace Preview */}
                        {renderWorkspacePreview(view.id)}
                      </SliderWrapper>
                    ))}
                  </SliderContent>
                </div>
              </SpotLightItem>
            </Spotlight>

            {/* UI Layouts Progressive Selector Cards */}
            <SliderBtnGroup
              className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3"
              aria-label={t("landing.experience.tag")}
            >
              {views.map((view) => {
                const Icon = viewIcons[view.id] || LayoutDashboard
                return (
                  <SliderBtn
                    key={view.id}
                    value={view.id}
                    className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] hover:border-[var(--landing-border-strong)] p-4 sm:p-5"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-7 h-7 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] flex items-center justify-center text-[var(--landing-accent)] shrink-0">
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                      <span className="text-xs font-medium text-[var(--landing-text-primary)]">
                        {view.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[var(--landing-text-primary)] leading-snug">
                      {view.title}
                    </h3>
                    <p className="mt-1.5 text-xs font-light text-[var(--landing-text-secondary)] leading-relaxed">
                      {view.description}
                    </p>
                  </SliderBtn>
                )
              })}
            </SliderBtnGroup>
          </ProgressSlider>
        </TimelineAnimation>
      </div>
    </section>
  )
}
