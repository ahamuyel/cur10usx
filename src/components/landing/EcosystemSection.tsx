"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import {
  Building2,
  GraduationCap,
  BookOpenCheck,
  Users,
  Check,
  ArrowRight,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { TabsProvider, TabsBtn, TabsPanels, TabsContent } from "@/components/ui/uilayouts-tabs"
import { ScrollText, MotionReveal } from "@/components/ui/scroll-text"

type RoleData = {
  id: string
  role: string
  title: string
  description: string
  highlights: string[]
}

const roleIcons: Record<string, typeof Building2> = {
  institutions: Building2,
  teachers: BookOpenCheck,
  students: GraduationCap,
  parents: Users,
}

const roleOrder = ["institutions", "teachers", "students", "parents"]

function RoleEverydayFlow({ roleId, highlights }: { roleId: string; highlights: string[] }) {
  const prefersReducedMotion = useReducedMotion()

  const stepLabels: Record<string, string[]> = {
    institutions: ["Secretaria", "Pedagógico", "Comunicação"],
    teachers: ["Em sala", "Avaliações", "Acompanhamento"],
    students: ["Dia a dia", "Estudo", "Portfólio"],
    parents: ["Presenças", "Notas", "Escola ↔ Casa"],
  }

  const tags = stepLabels[roleId] || ["01", "02", "03"]

  return (
    <div className="relative pl-6 border-l border-[var(--landing-border)] space-y-6 py-2">
      {highlights.map((item, idx) => (
        <motion.div
          key={item}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: idx * 0.055,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative"
        >
          <span
            aria-hidden="true"
            className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--landing-bg-secondary)] border-2 border-[var(--landing-accent)]"
          />
          <span className="block text-[11px] font-medium uppercase tracking-wider text-[var(--landing-accent)] mb-1">
            {tags[idx] || `0${idx + 1}`}
          </span>
          <p className="text-sm sm:text-[15px] font-normal text-[var(--landing-text-primary)] leading-snug">
            {item}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

export default function EcosystemSection() {
  const { t, tv } = useTranslation()

  const rawRoles = (tv("landing.ecosystem.roles") as RoleData[]) || []
  const roles = roleOrder
    .map((id) => rawRoles.find((r) => r.id === id))
    .filter((r): r is RoleData => Boolean(r))

  if (!roles.length) return null

  return (
    <section
      id="ecossistema"
      className="py-20 sm:py-28 bg-[var(--landing-bg-secondary)] border-y border-[var(--landing-border)]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <MotionReveal y={12}>
            <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-3">
              {t("landing.ecosystem.tag")}
            </span>
          </MotionReveal>
          <ScrollText
            text={t("landing.ecosystem.headline")}
            className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]"
          />
          <MotionReveal delay={0.12} y={14}>
            <p className="mt-4 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
              {t("landing.ecosystem.description")}
            </p>
          </MotionReveal>
        </div>

        {/* Distortion-free, feather-light spring tabs */}
        <MotionReveal delay={0.14} y={16}>
          <TabsProvider defaultValue={roles[0].id} tabsOrder={roles.map((r) => r.id)}>
            <div
              role="tablist"
              aria-label={t("landing.ecosystem.tag")}
              className="flex flex-wrap items-center gap-1.5 pb-6 border-b border-[var(--landing-border)]"
            >
              {roles.map((role) => {
                const Icon = roleIcons[role.id] || Building2
                return (
                  <TabsBtn
                    key={role.id}
                    value={role.id}
                    className="px-4 h-10 rounded-lg text-xs sm:text-sm font-medium"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{role.role}</span>
                  </TabsBtn>
                )
              })}
            </div>

            <TabsPanels className="pt-8 sm:pt-10 min-h-[280px]">
              {roles.map((role) => {
                const isSchool = role.id === "institutions"
                return (
                  <TabsContent key={role.id} value={role.id}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                      {/* Left: Clear editorial explanation + CTA */}
                      <div className="lg:col-span-6 space-y-5">
                        <h3 className="text-xl sm:text-2xl font-medium tracking-[-0.02em] text-[var(--landing-text-primary)] leading-snug">
                          {role.title}
                        </h3>
                        <p className="text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
                          {role.description}
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-4">
                          <Link
                            href={isSchool ? "/registar-escola" : "/aplicacao"}
                            className="group inline-flex items-center gap-2 px-5 h-10 rounded-full bg-[var(--landing-text-primary)] text-[var(--landing-bg)] text-[13px] font-medium hover:opacity-90 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
                          >
                            <span>
                              {isSchool
                                ? t("landing.ecosystem.cta_institution")
                                : t("landing.ecosystem.cta_member")}
                            </span>
                            <ArrowRight
                              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </Link>

                          <Link
                            href={isSchool || role.id === "teachers" ? "/para-escolas" : "/para-estudantes"}
                            className="text-xs sm:text-sm font-normal text-[var(--landing-text-secondary)] hover:text-[var(--landing-accent)] transition-colors"
                          >
                            {t("landing.nav.features")} →
                          </Link>
                        </div>
                      </div>

                      {/* Right: Clean open timeline of everyday benefits */}
                      <div className="lg:col-span-6">
                        <RoleEverydayFlow roleId={role.id} highlights={role.highlights} />
                        <div className="mt-6 pt-4 border-t border-[var(--landing-border-subtle)] flex items-center gap-2 text-xs font-light text-[var(--landing-text-muted)]">
                          <Check className="w-3.5 h-3.5 text-[var(--landing-accent)] shrink-0" aria-hidden="true" />
                          <span>
                            {isSchool
                              ? t("landing.nav.demo")
                              : `${role.role} · ${t("landing.nav.signin")}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )
              })}
            </TabsPanels>
          </TabsProvider>
        </MotionReveal>
      </div>
    </section>
  )
}
