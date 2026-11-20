"use client"

import { useRef } from "react"
import Link from "next/link"
import {
  Building2,
  GraduationCap,
  BookOpenCheck,
  Users,
  Check,
  ArrowUpRight,
  Shield,
  Sparkles,
  Bell,
  CalendarCheck,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { Spotlight, SpotLightItem } from "@/components/ui/spotlight"
import { TimelineAnimation } from "@/components/ui/timeline-animation"

type RoleCardData = {
  id: string
  role: string
  title: string
  description: string
  highlights: string[]
}

const roleMeta: Record<string, { icon: typeof Building2; href: string }> = {
  institutions: { icon: Building2, href: "/registar-escola" },
  students: { icon: GraduationCap, href: "/aplicacao" },
  teachers: { icon: BookOpenCheck, href: "/aplicacao" },
  parents: { icon: Users, href: "/aplicacao" },
}

function RoleVisual({ id }: { id: string }) {
  if (id === "institutions") {
    return (
      <div
        aria-hidden="true"
        className="mb-5 rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)] p-3.5 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[var(--landing-text-muted)]">
            <Shield className="w-3 h-3 text-[var(--landing-accent)]" />
            tenant://school-scope
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {["Anos Lectivos", "Turmas & Cursos", "Pautas & RBAC"].map((pill) => (
            <div
              key={pill}
              className="px-2 py-1.5 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[10px] font-normal text-[var(--landing-text-secondary)] text-center truncate"
            >
              {pill}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (id === "students") {
    return (
      <div
        aria-hidden="true"
        className="mb-5 rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)] p-3.5"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[var(--landing-accent)]">
            <Sparkles className="w-3 h-3" />
            evolution://trajectory
          </span>
          <span className="font-mono text-[10px] text-[var(--landing-text-dim)]">01 → 04</span>
        </div>
        <div className="grid grid-cols-4 items-end gap-1.5 h-10 pt-1">
          {[38, 56, 78, 100].map((h, i) => (
            <div
              key={h}
              className="h-full flex items-end rounded-md bg-[var(--landing-surface)] border border-[var(--landing-border-subtle)] p-1"
            >
              <div
                className="w-full rounded-xs transition-all duration-300 group-hover:opacity-100"
                style={{
                  height: `${h}%`,
                  backgroundColor:
                    i === 3 ? "var(--landing-accent)" : "var(--landing-accent-subtle)",
                  border: i === 3 ? "none" : "1px solid var(--landing-border)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (id === "teachers") {
    return (
      <div
        aria-hidden="true"
        className="mb-5 rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)] p-3.5"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[var(--landing-text-muted)]">
            <CalendarCheck className="w-3 h-3 text-[var(--landing-accent)]" />
            classroom://flow
          </span>
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
            sync
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {["Aula", "Presença", "Avaliação", "Alerta"].map((step, i) => (
            <div key={step} className="flex items-center gap-1.5 flex-1 min-w-0">
              <div
                className={`w-full px-1.5 py-1.5 rounded-lg border text-[10px] text-center truncate ${
                  i === 3
                    ? "border-[var(--landing-accent)]/40 bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)]"
                    : "border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text-secondary)]"
                }`}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className="mb-5 rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)] p-3.5"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[var(--landing-text-muted)]">
          <Bell className="w-3 h-3 text-[var(--landing-accent)]" />
          family://updates
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]" />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[10px] text-[var(--landing-text-secondary)]">
          <span>Assiduidade &amp; Justificações</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-[var(--landing-border-subtle)] bg-[var(--landing-surface)]/70 text-[10px] text-[var(--landing-text-muted)]">
          <span>Avisos &amp; Evolução Académica</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)] shrink-0" />
        </div>
      </div>
    </div>
  )
}

export default function EcosystemSection() {
  const { t, tv } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const roles = (tv("landing.ecosystem.roles") as RoleCardData[]) || []

  return (
    <section
      id="ecossistema"
      ref={sectionRef}
      className="py-20 sm:py-24 lg:py-28 bg-[var(--landing-bg-secondary)] border-y border-[var(--landing-border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TimelineAnimation
          timelineRef={sectionRef}
          animationNum={0}
          className="max-w-2xl mb-12 sm:mb-14"
        >
          <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-2.5">
            {t("landing.ecosystem.tag")}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]">
            {t("landing.ecosystem.headline")}
          </h2>
          <p className="mt-3.5 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
            {t("landing.ecosystem.description")}
          </p>
        </TimelineAnimation>

        <Spotlight
          ProximitySpotlight
          CursorFlowGradient
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
        >
          {roles.map((item, idx) => {
            const meta = roleMeta[item.id] || { icon: Users, href: "/signup" }
            const Icon = meta.icon
            const ctaLabel =
              item.id === "institutions"
                ? t("landing.ecosystem.cta_institution")
                : t("landing.ecosystem.cta_member")

            return (
              <TimelineAnimation
                key={item.id}
                timelineRef={sectionRef}
                animationNum={idx + 1}
              >
                <SpotLightItem className="h-full" innerClassName="p-6 sm:p-7">
                  <div className="flex flex-col h-full justify-between gap-6">
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="inline-flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" aria-hidden="true" />
                          </div>
                          <span className="text-xs font-medium tracking-wide uppercase text-[var(--landing-text-muted)]">
                            {item.role}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-[var(--landing-text-dim)]">
                          0{idx + 1}
                        </span>
                      </div>

                      {/* Custom bespoke architectural visual per role */}
                      <RoleVisual id={item.id} />

                      <h3 className="text-lg sm:text-xl font-medium tracking-[-0.015em] text-[var(--landing-text-primary)] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed mb-5">
                        {item.description}
                      </p>

                      <ul className="space-y-2">
                        {item.highlights.map((hl) => (
                          <li
                            key={hl}
                            className="flex items-start gap-2.5 text-xs sm:text-[13px] font-normal text-[var(--landing-text-secondary)]"
                          >
                            <Check
                              className="w-3.5 h-3.5 text-[var(--landing-accent)] shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-[var(--landing-border-subtle)]">
                      <Link
                        href={meta.href}
                        className="group/link inline-flex items-center gap-1.5 text-xs font-medium text-[var(--landing-text-primary)] hover:text-[var(--landing-accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] rounded"
                      >
                        <span>{ctaLabel}</span>
                        <ArrowUpRight
                          className="w-3.5 h-3.5 transition-transform duration-150 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
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
