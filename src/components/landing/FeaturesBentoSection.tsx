"use client"

import { useRef } from "react"
import {
  Building2,
  TrendingUp,
  Award,
  CalendarCheck,
  Sparkles,
  Check,
  ShieldCheck,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { Spotlight, SpotLightItem } from "@/components/ui/spotlight"
import { TimelineAnimation } from "@/components/ui/timeline-animation"

type FeatureCardItem = {
  id: string
  eyebrow: string
  title: string
  description: string
  bullets: string[]
}

const iconMap: Record<string, typeof Building2> = {
  institutional: Building2,
  evolutionary: TrendingUp,
  portfolio: Award,
  tracking: CalendarCheck,
  intelligence: Sparkles,
}

function BentoVisual({ id }: { id: string }) {
  if (id === "institutional") {
    const modules = ["Admissões", "Matrículas", "Turmas", "Horários", "Pautas", "Transição"]
    return (
      <div
        aria-hidden="true"
        className="my-5 rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)] p-3.5"
      >
        <div className="grid grid-cols-3 gap-2">
          {modules.map((mod, i) => (
            <div
              key={mod}
              className={`px-2.5 py-2 rounded-lg border text-[11px] font-normal flex items-center justify-between gap-1.5 transition-transform duration-300 group-hover:-translate-y-0.5 ${
                i === 0 || i === 4
                  ? "border-[var(--landing-accent)]/35 bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)]"
                  : "border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text-secondary)]"
              }`}
              style={{ transitionDelay: `${i * 25}ms` }}
            >
              <span className="truncate">{mod}</span>
              <span className="w-1 h-1 rounded-full bg-current opacity-60 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (id === "evolutionary") {
    return (
      <div
        aria-hidden="true"
        className="my-5 rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)] p-4"
      >
        <svg viewBox="0 0 480 68" className="w-full h-16 overflow-visible">
          <defs>
            <linearGradient id="bento-evo-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--landing-accent)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--landing-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 8 56 C 94 50, 148 39, 232 33 C 318 27, 384 15, 472 9 L 472 64 L 8 64 Z"
            fill="url(#bento-evo-area)"
          />
          <path
            d="M 8 56 C 94 50, 148 39, 232 33 C 318 27, 384 15, 472 9"
            fill="none"
            stroke="var(--landing-accent)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {[
            { cx: 8, cy: 56 },
            { cx: 162, cy: 39 },
            { cx: 318, cy: 25 },
            { cx: 472, cy: 9 },
          ].map((pt, i) => (
            <circle
              key={i}
              cx={pt.cx}
              cy={pt.cy}
              r={i === 3 ? 4.5 : 3}
              fill="var(--landing-surface)"
              stroke="var(--landing-accent)"
              strokeWidth="2"
            />
          ))}
        </svg>
        <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-[var(--landing-text-dim)]">
          <span>T1</span>
          <span>T2</span>
          <span>T3</span>
          <span className="text-[var(--landing-accent)]">Portfólio</span>
        </div>
      </div>
    )
  }

  if (id === "portfolio") {
    return (
      <div
        aria-hidden="true"
        className="my-5 rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)] p-3.5"
      >
        <div className="rounded-lg border border-[var(--landing-border)] bg-[var(--landing-surface)] p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Verificável</span>
            </div>
            <p className="mt-1 font-mono text-[10px] text-[var(--landing-text-muted)] truncate">
              /verificar-documento/•••
            </p>
          </div>
          <div className="grid grid-cols-3 gap-0.5 p-1.5 rounded-md border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] shrink-0">
            {[1, 1, 0, 1, 0, 1, 0, 1, 1].map((on, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-[1px] ${
                  on ? "bg-[var(--landing-text-primary)]/70" : "bg-transparent"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (id === "tracking") {
    return (
      <div
        aria-hidden="true"
        className="my-5 rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)] p-3 space-y-1.5"
      >
        {[
          { label: "Assiduidade", dot: "bg-emerald-500" },
          { label: "Justificações", dot: "bg-[var(--landing-accent)]" },
          { label: "Comunicados", dot: "bg-amber-500" },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[10px] text-[var(--landing-text-secondary)]"
          >
            <span>{row.label}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${row.dot}`} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className="my-5 rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)] p-3.5"
    >
      <div className="grid grid-cols-5 gap-1.5">
        {[true, true, true, false, true, true, false, true, true, true].map((active, i) => (
          <div
            key={i}
            className={`h-5 rounded-md border transition-colors ${
              active
                ? "border-[var(--landing-accent)]/35 bg-[var(--landing-accent-subtle)]"
                : "border-[var(--landing-border)] bg-[var(--landing-surface)]"
            }`}
          />
        ))}
      </div>
      <p className="mt-2 font-mono text-[10px] text-[var(--landing-text-dim)]">
        trilhas · tópicos · domínio
      </p>
    </div>
  )
}

export default function FeaturesBentoSection() {
  const { t, tv } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const items = (tv("landing.features.items") as FeatureCardItem[]) || []

  return (
    <section
      id="funcionalidades"
      ref={sectionRef}
      className="py-20 sm:py-24 lg:py-28 bg-[var(--landing-bg)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TimelineAnimation
          timelineRef={sectionRef}
          animationNum={0}
          className="max-w-2xl mb-12 sm:mb-14"
        >
          <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-2.5">
            {t("landing.features.tag")}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]">
            {t("landing.features.headline")}
          </h2>
          <p className="mt-3.5 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
            {t("landing.features.description")}
          </p>
        </TimelineAnimation>

        {/* UI Layouts Bento Grid + Proximity Spotlight */}
        <Spotlight
          ProximitySpotlight
          CursorFlowGradient
          className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-5"
        >
          {items.map((item, idx) => {
            const Icon = iconMap[item.id] || Sparkles
            const colSpan = idx < 2 ? "md:col-span-3" : "md:col-span-2"

            return (
              <TimelineAnimation
                key={item.id}
                timelineRef={sectionRef}
                animationNum={idx + 1}
                className={colSpan}
              >
                <SpotLightItem className="h-full" innerClassName="p-6 sm:p-7">
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center">
                          <Icon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] text-[11px] font-normal text-[var(--landing-text-muted)]">
                          {item.eyebrow}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-medium tracking-[-0.015em] text-[var(--landing-text-primary)] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed">
                        {item.description}
                      </p>

                      {/* Distinct bespoke visual diagram per Bento tile */}
                      <BentoVisual id={item.id} />
                    </div>

                    <ul className="pt-4 border-t border-[var(--landing-border-subtle)] space-y-2">
                      {item.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-center gap-2 text-xs text-[var(--landing-text-secondary)]"
                        >
                          <Check
                            className="w-3.5 h-3.5 text-[var(--landing-accent)] shrink-0"
                            aria-hidden="true"
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </SpotLightItem>
              </TimelineAnimation>
            )
          })}
        </Spotlight>
      </div>
    </section>
  )
}
