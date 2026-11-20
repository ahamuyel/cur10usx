"use client"

import { CheckCircle2, Bell, Sparkles, Clock, BookOpen, Award } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import {
  ProgressSlider,
  SliderContent,
  SliderWrapper,
  SliderBtnGroup,
  SliderBtn,
} from "@/components/ui/progressive-carousel"
import { ScrollText, MotionReveal } from "@/components/ui/scroll-text"

type ExperienceView = {
  id: string
  label: string
  url: string
  title: string
  description: string
}

function SchoolPreview() {
  const rows = [
    { name: "10.ª Classe · Turma A", note: "Horário e professores prontos", badge: "Activa" },
    { name: "11.ª Classe · Turma B", note: "Notas do trimestre actualizadas", badge: "Em dia" },
    { name: "12.ª Classe · Turma A", note: "Pautas e declarações prontas", badge: "Concluída" },
  ]

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--landing-border-subtle)] pb-4">
        <div>
          <p className="text-xs font-medium text-[var(--landing-accent)]">Painel da Escola</p>
          <p className="mt-0.5 text-base font-medium text-[var(--landing-text-primary)]">
            Tudo organizado por turma
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Actualizado
        </span>
      </div>

      <div className="divide-y divide-[var(--landing-border-subtle)]">
        {rows.map((row) => (
          <div key={row.name} className="py-3.5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--landing-text-primary)] truncate">
                {row.name}
              </p>
              <p className="text-xs font-light text-[var(--landing-text-secondary)] truncate">
                {row.note}
              </p>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[var(--landing-bg-secondary)] border border-[var(--landing-border)] text-[var(--landing-text-secondary)] shrink-0">
              {row.badge}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-2 flex items-center gap-2 text-xs text-[var(--landing-text-muted)]">
        <CheckCircle2 className="w-4 h-4 text-[var(--landing-accent)] shrink-0" aria-hidden="true" />
        <span>Matrículas, pautas e comunicados no mesmo painel</span>
      </div>
    </div>
  )
}

function ClassroomPreview() {
  const moments = [
    {
      icon: Clock,
      title: "Chamada feita em segundos",
      desc: "O professor marca presenças directamente na aula, sem folhas de papel.",
    },
    {
      icon: Bell,
      title: "Pais avisados no momento",
      desc: "Se houver falta ou um novo comunicado, o encarregado recebe logo no telemóvel.",
    },
    {
      icon: CheckCircle2,
      title: "Justificação simples",
      desc: "A família envia a justificação online e a escola valida sem filas na secretaria.",
    },
  ]

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="border-b border-[var(--landing-border-subtle)] pb-4">
        <p className="text-xs font-medium text-[var(--landing-accent)]">Sala de Aula & Famílias</p>
        <p className="mt-0.5 text-base font-medium text-[var(--landing-text-primary)]">
          Escola e casa sempre ligadas
        </p>
      </div>

      <div className="space-y-5">
        {moments.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3.5">
            <span className="w-8 h-8 rounded-lg bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-4 h-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--landing-text-primary)]">{title}</p>
              <p className="mt-0.5 text-xs font-light text-[var(--landing-text-secondary)] leading-relaxed">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StudentPreview() {
  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--landing-border-subtle)] pb-4">
        <div>
          <p className="text-xs font-medium text-[var(--landing-accent)]">Espaço do Estudante</p>
          <p className="mt-0.5 text-base font-medium text-[var(--landing-text-primary)]">
            Aprender e acompanhar o progresso
          </p>
        </div>
        <Sparkles className="w-4 h-4 text-[var(--landing-accent)] shrink-0" aria-hidden="true" />
      </div>

      {/* Gentle evolution curve */}
      <div className="py-2">
        <svg viewBox="0 0 420 96" className="w-full h-24 overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="practice-evo-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--landing-accent)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--landing-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 10 74 C 90 68, 140 50, 210 42 C 280 34, 340 20, 410 12 L 410 88 L 10 88 Z"
            fill="url(#practice-evo-area)"
          />
          <path
            d="M 10 74 C 90 68, 140 50, 210 42 C 280 34, 340 20, 410 12"
            fill="none"
            stroke="var(--landing-accent)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {[
            { x: 10, y: 74, label: "1.º Trim." },
            { x: 145, y: 52, label: "2.º Trim." },
            { x: 280, y: 32, label: "3.º Trim." },
            { x: 410, y: 12, label: "Portfólio" },
          ].map((pt) => (
            <g key={pt.label}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="var(--landing-surface)"
                stroke="var(--landing-accent)"
                strokeWidth="2"
              />
              <text
                x={pt.x}
                y="94"
                textAnchor={pt.x === 10 ? "start" : pt.x === 410 ? "end" : "middle"}
                fill="var(--landing-text-muted)"
                fontSize="10"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--landing-border-subtle)]">
        <div className="flex items-start gap-2.5">
          <BookOpen className="w-4 h-4 text-[var(--landing-accent)] mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium text-[var(--landing-text-primary)]">Exercícios guiados</p>
            <p className="text-[11px] font-light text-[var(--landing-text-secondary)]">
              Reforço nas disciplinas que mais precisa
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Award className="w-4 h-4 text-[var(--landing-accent)] mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium text-[var(--landing-text-primary)]">Certificados prontos</p>
            <p className="text-[11px] font-light text-[var(--landing-text-secondary)]">
              Histórico escolar sempre guardado
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function renderPreview(id: string) {
  switch (id) {
    case "classroom":
      return <ClassroomPreview />
    case "evolution":
      return <StudentPreview />
    case "overview":
    default:
      return <SchoolPreview />
  }
}

export default function PlatformExperienceSection() {
  const { t, tv } = useTranslation()
  const views = (tv("landing.experience.views") as ExperienceView[]) || []

  if (!views.length) return null

  const sliderOrder = views.map((v) => v.id)

  return (
    <section
      id="experiencia"
      className="py-20 sm:py-28 bg-[var(--landing-bg)]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 sm:mb-14">
          <MotionReveal y={12}>
            <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-3">
              {t("landing.experience.tag")}
            </span>
          </MotionReveal>
          <ScrollText
            text={t("landing.experience.headline")}
            className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]"
          />
          <MotionReveal delay={0.12} y={14}>
            <p className="mt-4 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
              {t("landing.experience.description")}
            </p>
          </MotionReveal>
        </div>

        {/* Open 12-col editorial split with UI Layouts ProgressSlider (NO repetitive card grid) */}
        <MotionReveal delay={0.16} y={20}>
          <ProgressSlider
            activeSlider={views[0].id}
            sliderOrder={sliderOrder}
            duration={6500}
            fastDuration={240}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left: Clean hairline-separated interactive steps */}
              <SliderBtnGroup
                aria-label={t("landing.experience.tag")}
                className="lg:col-span-5 divide-y divide-[var(--landing-border)] border-y border-[var(--landing-border)]"
              >
                {views.map((view, idx) => (
                  <SliderBtn
                    key={view.id}
                    value={view.id}
                    className="w-full py-5 px-2 text-left"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[11px] text-[var(--landing-accent)] shrink-0">
                        0{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-[15px] font-medium text-[var(--landing-text-primary)] leading-snug">
                          {view.label}
                        </h3>
                        <p className="mt-1 text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
                          {view.description}
                        </p>
                      </div>
                    </div>
                  </SliderBtn>
                ))}
              </SliderBtnGroup>

              {/* Right: Single clean architectural preview surface */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] shadow-[0_20px_50px_-32px_rgba(9,9,11,0.16)] dark:shadow-[0_20px_50px_-32px_rgba(0,0,0,0.85)] overflow-hidden min-h-[320px]">
                  <SliderContent>
                    {views.map((view) => (
                      <SliderWrapper key={view.id} value={view.id}>
                        {renderPreview(view.id)}
                      </SliderWrapper>
                    ))}
                  </SliderContent>
                </div>
              </div>
            </div>
          </ProgressSlider>
        </MotionReveal>
      </div>
    </section>
  )
}
