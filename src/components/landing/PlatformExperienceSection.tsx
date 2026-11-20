"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, useReducedMotion } from "motion/react"
import {
  CheckCircle2,
  Bell,
  Sparkles,
  Clock,
  BookOpen,
  Award,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { ScrollText, MotionReveal } from "@/components/ui/scroll-text"

type ExperienceView = {
  id: string
  label: string
  url: string
  title: string
  description: string
}

const SLIDE_DURATION = 6500

function SchoolCardBody() {
  const rows = [
    { name: "10.ª Classe · Turma A", note: "Horário e professores prontos", badge: "Activa", ok: true },
    { name: "11.ª Classe · Turma B", note: "Notas do trimestre actualizadas", badge: "Em dia", ok: true },
    { name: "12.ª Classe · Turma A", note: "Pautas e declarações emitidas", badge: "Concluída", ok: false },
  ]

  return (
    <div className="flex flex-col justify-between h-full gap-5">
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--landing-border-subtle)]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[var(--landing-accent)]">Painel da Escola</p>
            <p className="text-sm sm:text-base font-medium text-[var(--landing-text-primary)] truncate">
              Tudo organizado por turma
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Actualizado
        </span>
      </div>

      <div className="divide-y divide-[var(--landing-border-subtle)]">
        {rows.map((row) => (
          <div key={row.name} className="py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-[var(--landing-text-primary)] truncate">
                {row.name}
              </p>
              <p className="text-[11px] sm:text-xs font-light text-[var(--landing-text-secondary)] truncate">
                {row.note}
              </p>
            </div>
            <span
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border shrink-0 ${
                row.ok
                  ? "border-[var(--landing-accent)]/25 bg-[var(--landing-accent-subtle)]/70 text-[var(--landing-accent)]"
                  : "border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] text-[var(--landing-text-secondary)]"
              }`}
            >
              {row.badge}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-[var(--landing-border-subtle)] flex items-center gap-2 text-xs text-[var(--landing-text-muted)]">
        <CheckCircle2 className="w-4 h-4 text-[var(--landing-accent)] shrink-0" aria-hidden="true" />
        <span>Matrículas, pautas e comunicados no mesmo espaço</span>
      </div>
    </div>
  )
}

function ClassroomCardBody() {
  const moments = [
    {
      icon: Clock,
      title: "Chamada feita em segundos",
      desc: "O professor marca presenças na hora, sem folhas de papel.",
      tag: "08:05",
    },
    {
      icon: Bell,
      title: "Pais avisados no momento",
      desc: "Qualquer falta ou comunicado chega logo ao telemóvel.",
      tag: "Agora",
    },
    {
      icon: CheckCircle2,
      title: "Justificação sem filas",
      desc: "A família envia online e a escola valida num clique.",
      tag: "Validada",
    },
  ]

  return (
    <div className="flex flex-col justify-between h-full gap-5">
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--landing-border-subtle)]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[var(--landing-accent)]">Aulas & Famílias</p>
            <p className="text-sm sm:text-base font-medium text-[var(--landing-text-primary)] truncate">
              Escola e casa sempre ligadas
            </p>
          </div>
        </div>
        <span className="text-[11px] text-[var(--landing-text-muted)] shrink-0">Tempo real</span>
      </div>

      <div className="space-y-3.5">
        {moments.map(({ icon: Icon, title, desc, tag }) => (
          <div
            key={title}
            className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[var(--landing-bg-secondary)]/75 border border-[var(--landing-border-subtle)]"
          >
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-7 h-7 rounded-lg bg-[var(--landing-surface)] border border-[var(--landing-border)] text-[var(--landing-accent)] flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-[var(--landing-text-primary)]">
                  {title}
                </p>
                <p className="mt-0.5 text-[11px] sm:text-xs font-light text-[var(--landing-text-secondary)] leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[var(--landing-text-muted)] shrink-0 mt-0.5">
              {tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StudentCardBody() {
  return (
    <div className="flex flex-col justify-between h-full gap-5">
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--landing-border-subtle)]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[var(--landing-accent)]">Espaço do Estudante</p>
            <p className="text-sm sm:text-base font-medium text-[var(--landing-text-primary)] truncate">
              Aprender e acompanhar o progresso
            </p>
          </div>
        </div>
        <span className="text-[11px] font-medium text-[var(--landing-accent)] shrink-0">
          Perfil Evolutivo
        </span>
      </div>

      {/* Crisp evolution curve */}
      <div className="rounded-xl bg-[var(--landing-bg-secondary)]/70 border border-[var(--landing-border-subtle)] px-4 pt-4 pb-3">
        <svg viewBox="0 0 420 96" className="w-full h-24 overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="practice-stack-evo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--landing-accent)" stopOpacity="0.24" />
              <stop offset="100%" stopColor="var(--landing-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 10 74 C 90 68, 140 50, 210 42 C 280 34, 340 20, 410 12 L 410 86 L 10 86 Z"
            fill="url(#practice-stack-evo)"
          />
          <path
            d="M 10 74 C 90 68, 140 50, 210 42 C 280 34, 340 20, 410 12"
            fill="none"
            stroke="var(--landing-accent)"
            strokeWidth="2.4"
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
                r="4.5"
                fill="var(--landing-surface)"
                stroke="var(--landing-accent)"
                strokeWidth="2.2"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--landing-bg-secondary)]/65 border border-[var(--landing-border-subtle)]">
          <BookOpen className="w-4 h-4 text-[var(--landing-accent)] mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium text-[var(--landing-text-primary)]">Exercícios guiados</p>
            <p className="text-[11px] font-light text-[var(--landing-text-secondary)]">
              Reforço nas disciplinas difíceis
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--landing-bg-secondary)]/65 border border-[var(--landing-border-subtle)]">
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

function renderCardBody(id: string) {
  switch (id) {
    case "classroom":
      return <ClassroomCardBody />
    case "evolution":
      return <StudentCardBody />
    case "overview":
    default:
      return <SchoolCardBody />
  }
}

/**
 * Overlapping Stacked Card Deck Carousel for "Na Prática / Como funciona".
 * Cards visibly overlap in 3D-like depth and smoothly cycle to the front via spring physics.
 */
export default function PlatformExperienceSection() {
  const { t, tv } = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const views = (tv("landing.experience.views") as ExperienceView[]) || []

  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef<number>(0)

  const total = views.length

  const goTo = useCallback(
    (idx: number) => {
      if (!total) return
      setActiveIndex(((idx % total) + total) % total)
      setProgress(0)
      startTimeRef.current = performance.now()
    },
    [total]
  )

  useEffect(() => {
    if (prefersReducedMotion || paused || total <= 1) return

    startTimeRef.current = performance.now()
    let rafId = 0

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100)
      setProgress(pct)
      if (elapsed >= SLIDE_DURATION) {
        setActiveIndex((prev) => (prev + 1) % total)
        setProgress(0)
        startTimeRef.current = performance.now()
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [prefersReducedMotion, paused, total, activeIndex])

  if (!total) return null

  return (
    <section
      id="experiencia"
      className="py-20 sm:py-28 bg-[var(--landing-bg)] overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div className="max-w-xl">
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

          {/* Sleek Carousel Deck Controls */}
          <MotionReveal delay={0.14} y={12} className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-xs text-[var(--landing-text-muted)] mr-2 tabular-nums">
              0{activeIndex + 1} / 0{total}
            </span>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Anterior"
              className="w-10 h-10 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] flex items-center justify-center text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:border-[var(--landing-border-strong)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Próximo"
              className="w-10 h-10 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] flex items-center justify-center text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:border-[var(--landing-border-strong)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </MotionReveal>
        </div>

        {/* Interactive Split: Left Step Controls + Right Overlapping Stacked Card Carousel */}
        <MotionReveal delay={0.16} y={20}>
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center"
          >
            {/* Left: Clean hairline-separated step list with live progress bar */}
            <div
              role="tablist"
              aria-label={t("landing.experience.tag")}
              className="lg:col-span-5 divide-y divide-[var(--landing-border)] border-y border-[var(--landing-border)]"
            >
              {views.map((view, idx) => {
                const isActive = idx === activeIndex
                return (
                  <button
                    key={view.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => goTo(idx)}
                    className={`relative w-full py-5 px-2 text-left transition-opacity duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--landing-accent)] ${
                      isActive ? "opacity-100" : "opacity-55 hover:opacity-85"
                    }`}
                  >
                    <div className="flex items-baseline gap-3">
                      <span
                        className={`font-mono text-xs shrink-0 transition-colors ${
                          isActive
                            ? "text-[var(--landing-accent)] font-medium"
                            : "text-[var(--landing-text-muted)]"
                        }`}
                      >
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

                    {/* Smooth animated progress line under active step */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-transparent overflow-hidden"
                    >
                      <span
                        className="block h-full bg-[var(--landing-accent)] transition-[width] duration-100 ease-linear"
                        style={{
                          width: isActive ? `${prefersReducedMotion ? 100 : progress}%` : "0%",
                        }}
                      />
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Right: Overlapping Stacked Card Carousel Deck */}
            <div className="lg:col-span-7">
              <div className="relative h-[430px] sm:h-[420px] pr-4 sm:pr-7">
                {views.map((view, idx) => {
                  const stackPos = (idx - activeIndex + total) % total
                  const isFront = stackPos === 0

                  // Tactile overlapping deck offsets: cards behind clearly peek below & right
                  const yOffset = stackPos * 26
                  const xOffset = stackPos * 14
                  const rotateVal = stackPos * 1.4
                  const scaleVal = 1 - stackPos * 0.045
                  const opacityVal = isFront ? 1 : stackPos === 1 ? 0.85 : 0.58
                  const zIndexVal = total - stackPos

                  return (
                    <motion.div
                      key={view.id}
                      onClick={() => !isFront && goTo(idx)}
                      animate={
                        prefersReducedMotion
                          ? {
                              opacity: isFront ? 1 : 0,
                              zIndex: zIndexVal,
                            }
                          : {
                              y: yOffset,
                              x: xOffset,
                              rotate: rotateVal,
                              scale: scaleVal,
                              opacity: opacityVal,
                              zIndex: zIndexVal,
                            }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 25,
                        mass: 0.9,
                      }}
                      className={`absolute inset-x-0 top-0 h-[365px] sm:h-[355px] rounded-2xl border p-6 sm:p-7 transition-colors ${
                        isFront
                          ? "border-[var(--landing-border-strong)] bg-[var(--landing-surface)] shadow-[0_26px_65px_-28px_rgba(9,9,11,0.22)] dark:shadow-[0_26px_65px_-28px_rgba(0,0,0,0.92)]"
                          : "border-[var(--landing-border-strong)]/80 bg-[var(--landing-bg-secondary)] cursor-pointer hover:border-[var(--landing-accent)]/50 shadow-md"
                      }`}
                      style={{ transformOrigin: "bottom center" }}
                      aria-hidden={!isFront}
                    >
                      {renderCardBody(view.id)}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  )
}
