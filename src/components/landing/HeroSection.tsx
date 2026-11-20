"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import {
  ArrowRight,
  Building2,
  BookOpenCheck,
  GraduationCap,
  Users,
  MousePointer2,
  CheckCircle2,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { ScrollText, MotionReveal } from "@/components/ui/scroll-text"
import HeroBackdrop from "@/components/landing/HeroBackdrop"

type RoleId = "institutions" | "teachers" | "students" | "parents"

type RoleData = {
  id: RoleId
  role: string
  title: string
  description: string
  highlights: string[]
}

const roleMeta: Record<
  RoleId,
  {
    icon: typeof Building2
    pageHref: string
    actionHref: string
    progressWidth: string
    progressLabel: string
  }
> = {
  institutions: {
    icon: Building2,
    pageHref: "/para-escolas",
    actionHref: "/registar-escola",
    progressWidth: "84%",
    progressLabel: "Ano lectivo organizado",
  },
  teachers: {
    icon: BookOpenCheck,
    pageHref: "/para-escolas",
    actionHref: "/aplicacao",
    progressWidth: "90%",
    progressLabel: "Aulas e notas em dia",
  },
  students: {
    icon: GraduationCap,
    pageHref: "/para-estudantes",
    actionHref: "/aplicacao",
    progressWidth: "78%",
    progressLabel: "Evolução do trimestre",
  },
  parents: {
    icon: Users,
    pageHref: "/para-estudantes",
    actionHref: "/aplicacao",
    progressWidth: "95%",
    progressLabel: "Acompanhamento em tempo real",
  },
}

const roleOrder: RoleId[] = ["institutions", "teachers", "students", "parents"]

/**
 * Adapted from UI Layouts `hero-ai-value-proposition` block
 * (https://www.ui-layouts.com/blocks/hero-section).
 * Features architectural rail framing, stacked 3-layer floating preview,
 * and an interactive 2x2 audience selector so schools & students immediately see their space.
 */
export default function HeroSection() {
  const { t, tv } = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const [selectedRole, setSelectedRole] = useState<RoleId>("institutions")

  const rawRoles = (tv("landing.ecosystem.roles") as RoleData[]) || []
  const roles = roleOrder
    .map((id) => rawRoles.find((r) => r.id === id))
    .filter((r): r is RoleData => Boolean(r))

  const activeRole = roles.find((r) => r.id === selectedRole) || roles[0]
  const activeMeta = roleMeta[selectedRole]

  return (
    <section
      id="produto"
      className="relative pt-16 overflow-hidden bg-[var(--landing-bg)]"
    >
      {/* Shared architectural grid + drifting primary-color light aura */}
      <HeroBackdrop />

      {/* Band 1: Headline inside UI Layouts architectural rail */}
      <div className="relative z-10 border-b border-[var(--landing-border)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto border-x border-[var(--landing-border)] px-5 sm:px-10 pt-14 pb-12 sm:pt-20 sm:pb-16 text-center">
          <MotionReveal immediate delay={0} y={10}>
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-xs font-normal text-[var(--landing-text-secondary)] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]" aria-hidden="true" />
              <span>{t("landing.hero.badge")}</span>
            </span>
          </MotionReveal>

          <ScrollText
            as="h1"
            text={t("landing.hero.headline")}
            accentLastLine
            immediate
            delay={0.04}
            className="text-[2.2rem] sm:text-5xl lg:text-[4rem] font-medium tracking-[-0.035em] leading-[1.06] text-[var(--landing-text-primary)] text-balance"
          />

          <MotionReveal immediate delay={0.22} y={14}>
            <p className="mt-5 max-w-2xl mx-auto text-[15px] sm:text-base lg:text-lg font-light text-[var(--landing-text-secondary)] leading-relaxed">
              {t("landing.hero.subheadline")}
            </p>
          </MotionReveal>
        </div>
      </div>

      {/* Band 2: Two Clear Doors CTA strip */}
      <div className="relative z-10 border-b border-[var(--landing-border)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto border-x border-[var(--landing-border)] px-5 sm:px-10 py-7 sm:py-8">
          <MotionReveal
            immediate
            delay={0.3}
            y={12}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
          >
            <Link
              href="/registar-escola"
              className="group inline-flex items-center justify-center gap-2 px-7 h-12 rounded-full bg-[var(--landing-text-primary)] text-[var(--landing-bg)] text-sm font-medium shadow-sm hover:opacity-90 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-bg)]"
            >
              <span>{t("landing.hero.cta")}</span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/para-estudantes"
              className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text-primary)] text-sm font-normal hover:bg-[var(--landing-bg-tertiary)] hover:border-[var(--landing-border-strong)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              <span>{t("landing.hero.explore")}</span>
            </Link>
          </MotionReveal>
        </div>
      </div>

      {/* Band 3: UI Layouts 3-Layer Stacked Interactive Workspace Preview */}
      {activeRole && (
        <div className="relative z-10 border-b border-[var(--landing-border)] px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto border-x border-[var(--landing-border)] p-4 sm:p-8 lg:p-10">
            <MotionReveal immediate delay={0.38} y={24}>
              <div className="relative rounded-3xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-2 shadow-[0_32px_90px_-34px_rgba(9,9,11,0.16)] dark:shadow-[0_32px_90px_-34px_rgba(0,0,0,0.85)]">
                {/* Soft tinted backdrop stage */}
                <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-b from-[var(--landing-bg-secondary)] via-[var(--landing-bg-secondary)] to-[var(--landing-accent-subtle)] pt-12 sm:pt-16 px-3 sm:px-8 lg:px-12">
                  <div className="relative z-10 max-w-4xl mx-auto">
                    {/* Stacked background depth sheets (UI Layouts signature detail) */}
                    <div
                      aria-hidden="true"
                      className="hidden sm:block absolute -top-7 left-1/2 -translate-x-1/2 w-[86%] h-full rounded-t-3xl border border-[var(--landing-border)] bg-[var(--landing-surface)]/55"
                    />
                    <div
                      aria-hidden="true"
                      className="hidden sm:block absolute -top-3.5 left-1/2 -translate-x-1/2 w-[93%] h-full rounded-t-3xl border border-[var(--landing-border)] bg-[var(--landing-surface)]/80"
                    />

                    {/* Main Interactive Front Sheet */}
                    <div className="relative z-10 rounded-t-2xl sm:rounded-t-3xl border border-b-0 border-[var(--landing-border)] bg-[var(--landing-surface)] p-5 sm:p-8 lg:p-10">
                      {/* Top Breadcrumb Bar */}
                      <div className="flex items-center justify-between gap-3 pb-6 mb-6 border-b border-[var(--landing-border-subtle)]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                          <span className="text-xs text-[var(--landing-text-muted)]">Cur10usX /</span>
                          <span className="text-xs sm:text-sm font-medium text-[var(--landing-text-primary)] truncate">
                            {activeRole.role}
                          </span>
                        </div>
                        <Link
                          href={activeMeta.pageHref}
                          className="text-xs font-medium text-[var(--landing-accent)] hover:underline whitespace-nowrap"
                        >
                          {t("landing.nav.features")} →
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                        {/* Left: Live human role summary */}
                        <div className="lg:col-span-7 min-h-[250px] flex flex-col justify-between">
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                              key={activeRole.id}
                              initial={
                                prefersReducedMotion
                                  ? false
                                  : { opacity: 0, y: 10, filter: "blur(4px)" }
                              }
                              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                              exit={
                                prefersReducedMotion
                                  ? undefined
                                  : { opacity: 0, y: -8, filter: "blur(4px)" }
                              }
                              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                              className="space-y-5"
                            >
                              <div>
                                <h2 className="text-lg sm:text-xl font-medium tracking-[-0.02em] text-[var(--landing-text-primary)]">
                                  {activeRole.title}
                                </h2>
                                <p className="mt-2 text-xs sm:text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed">
                                  {activeRole.description}
                                </p>
                              </div>

                              {/* Clean progress indicator */}
                              <div className="rounded-xl bg-[var(--landing-bg-secondary)] border border-[var(--landing-border-subtle)] p-4">
                                <div className="flex items-center justify-between text-[11px] mb-2.5">
                                  <span className="font-medium text-[var(--landing-text-primary)]">
                                    {activeMeta.progressLabel}
                                  </span>
                                  <span className="text-[var(--landing-accent)] font-medium">
                                    Cur10usX
                                  </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-[var(--landing-bg-tertiary)] overflow-hidden">
                                  <motion.div
                                    initial={prefersReducedMotion ? false : { width: "20%" }}
                                    animate={{ width: activeMeta.progressWidth }}
                                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                    className="h-full rounded-full bg-[var(--landing-accent)]"
                                  />
                                </div>
                              </div>

                              {/* 3 plain everyday highlights */}
                              <ul className="space-y-2">
                                {activeRole.highlights.map((item) => (
                                  <li
                                    key={item}
                                    className="flex items-start gap-2.5 text-xs sm:text-[13px] text-[var(--landing-text-secondary)]"
                                  >
                                    <CheckCircle2
                                      className="w-4 h-4 text-[var(--landing-accent)] shrink-0 mt-0.5"
                                      aria-hidden="true"
                                    />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Right: UI Layouts Interactive 2x2 Choice Panel */}
                        <div className="lg:col-span-5">
                          <div className="rounded-2xl bg-[var(--landing-bg-secondary)] border border-[var(--landing-border-subtle)] p-4 sm:p-5">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--landing-text-muted)] mb-4">
                              {t("landing.ecosystem.tag")}
                            </p>

                            <div className="grid grid-cols-2 gap-2.5">
                              {roles.map((role) => {
                                const isSelected = role.id === selectedRole
                                const Icon = roleMeta[role.id]?.icon || Building2
                                return (
                                  <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setSelectedRole(role.id)}
                                    aria-pressed={isSelected}
                                    className={`relative text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] ${
                                      isSelected
                                        ? "bg-[var(--landing-surface)] border-[var(--landing-accent)] shadow-md"
                                        : "bg-[var(--landing-surface)]/70 border-[var(--landing-border)] opacity-75 hover:opacity-100 hover:border-[var(--landing-border-strong)]"
                                    }`}
                                  >
                                    <span
                                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                                        isSelected
                                          ? "bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)]"
                                          : "bg-[var(--landing-bg-tertiary)] text-[var(--landing-text-muted)]"
                                      }`}
                                    >
                                      <Icon className="w-4 h-4" aria-hidden="true" />
                                    </span>
                                    <span className="text-xs font-medium text-[var(--landing-text-primary)] leading-tight">
                                      {role.role}
                                    </span>
                                    {isSelected && (
                                      <MousePointer2
                                        aria-hidden="true"
                                        className="w-4 h-4 absolute top-3 right-3 text-[var(--landing-text-primary)] fill-[var(--landing-text-primary)]"
                                      />
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MotionReveal>
          </div>
        </div>
      )}
    </section>
  )
}
