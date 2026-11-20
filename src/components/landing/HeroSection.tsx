"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { ArrowRight, ChevronDown, Building2, GraduationCap } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { ScrollText, MotionReveal } from "@/components/ui/scroll-text"
import { AnimatedBeam, BeamNode } from "@/components/ui/animated-beam"

type SideKey = "school" | "family"

export default function HeroSection() {
  const { t, tv } = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const bridgeRef = useRef<HTMLDivElement>(null)
  const schoolRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const familyRef = useRef<HTMLDivElement>(null)

  const [activeSide, setActiveSide] = useState<SideKey>("school")

  const roles = (tv("landing.ecosystem.roles") as {
    id: string
    role: string
    title: string
    description: string
  }[]) || []

  const schoolRole = roles.find((r) => r.id === "institutions") || roles[0]
  const studentRole = roles.find((r) => r.id === "students") || roles[1]

  const sideContent: Record<SideKey, { label: string; summary: string; href: string; cta: string }> = {
    school: {
      label: schoolRole?.role || "Escolas",
      summary: schoolRole?.title || "",
      href: "/registar-escola",
      cta: t("landing.ecosystem.cta_institution"),
    },
    family: {
      label: `${studentRole?.role || "Estudantes"} & ${roles.find((r) => r.id === "parents")?.role || "Encarregados"}`,
      summary: studentRole?.title || "",
      href: "/aplicacao",
      cta: t("landing.ecosystem.cta_member"),
    },
  }

  const current = sideContent[activeSide]

  return (
    <section
      id="produto"
      className="relative pt-28 pb-20 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 overflow-hidden bg-[var(--landing-bg)]"
    >
      {/* Subtle ambient glow only — clean & airy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[min(760px,95vw)] h-[280px] rounded-full bg-[var(--landing-accent-subtle)] blur-3xl opacity-70"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Plain human audience pill */}
          <MotionReveal immediate delay={0} y={12}>
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)]/80 text-xs font-normal text-[var(--landing-text-secondary)] mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]" aria-hidden="true" />
              <span>{t("landing.hero.badge")}</span>
            </span>
          </MotionReveal>

          {/* Animated Word-by-Word Headline */}
          <ScrollText
            as="h1"
            text={t("landing.hero.headline")}
            accentLastLine
            immediate
            delay={0.05}
            className="text-[2.25rem] sm:text-5xl lg:text-[3.75rem] font-medium tracking-[-0.035em] leading-[1.08] text-[var(--landing-text-primary)] text-balance"
          />

          {/* Clear, warm subheadline */}
          <MotionReveal immediate delay={0.28} y={16}>
            <p className="mt-6 max-w-xl mx-auto text-[15px] sm:text-base lg:text-[17px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
              {t("landing.hero.subheadline")}
            </p>
          </MotionReveal>

          {/* Two unmistakable doors: School vs Student/Parent */}
          <MotionReveal
            immediate
            delay={0.38}
            y={16}
            className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
          >
            <Link
              href="/registar-escola"
              className="group inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-[var(--landing-text-primary)] text-[var(--landing-bg)] text-sm font-medium hover:opacity-90 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-bg)]"
            >
              <span>{t("landing.hero.cta")}</span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>

            <a
              href="#ecossistema"
              className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text-primary)] text-sm font-normal hover:bg-[var(--landing-bg-tertiary)] hover:border-[var(--landing-border-strong)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              <span>{t("landing.hero.explore")}</span>
              <ChevronDown className="w-4 h-4 text-[var(--landing-text-muted)]" aria-hidden="true" />
            </a>
          </MotionReveal>
        </div>

        {/* Light, Frameless Interactive Two-Sided Bridge (Zero card clutter, zero jargon) */}
        <MotionReveal immediate delay={0.5} y={24} className="mt-16 sm:mt-20">
          <div
            ref={bridgeRef}
            className="relative py-8 sm:py-10 px-2 sm:px-6"
          >
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 items-center gap-5 md:gap-8">
              {/* Side A: A Escola */}
              <button
                type="button"
                onClick={() => setActiveSide("school")}
                onMouseEnter={() => setActiveSide("school")}
                onFocus={() => setActiveSide("school")}
                aria-pressed={activeSide === "school"}
                className="text-left focus-visible:outline-none cursor-pointer"
              >
                <BeamNode
                  ref={schoolRef}
                  className={`w-full justify-start gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                    activeSide === "school"
                      ? "border-[var(--landing-accent)] bg-[var(--landing-surface)] shadow-[0_12px_36px_-18px_rgba(99,102,241,0.35)] scale-[1.01]"
                      : "border-[var(--landing-border)] bg-[var(--landing-surface)]/70 hover:border-[var(--landing-border-strong)]"
                  }`}
                >
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      activeSide === "school"
                        ? "bg-[var(--landing-accent)] text-white"
                        : "bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)]"
                    }`}
                  >
                    <Building2 className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[var(--landing-text-primary)] truncate">
                      {schoolRole?.role || "Escolas"}
                    </span>
                    <span className="block text-xs font-light text-[var(--landing-text-muted)] truncate">
                      {roles.find((r) => r.id === "teachers")?.role || "Professores"} · Gestão
                    </span>
                  </span>
                </BeamNode>
              </button>

              {/* Center Hub: Cur10usX */}
              <div className="flex justify-center">
                <BeamNode
                  ref={coreRef}
                  className="px-5 py-4 rounded-2xl border border-[var(--landing-border-strong)] bg-[var(--landing-surface)] gap-2.5 shadow-sm"
                >
                  <Image
                    src="/blacklogo.png"
                    alt="Cur10usX"
                    width={28}
                    height={28}
                    className="h-7 w-auto rounded-lg dark:hidden"
                    priority
                  />
                  <Image
                    src="/whitelogo.png"
                    alt="Cur10usX"
                    width={28}
                    height={28}
                    className="h-7 w-auto rounded-lg hidden dark:block"
                    priority
                  />
                  <span className="text-sm font-medium tracking-tight text-[var(--landing-text-primary)]">
                    Cur10us<span className="text-[var(--landing-accent)]">X</span>
                  </span>
                </BeamNode>
              </div>

              {/* Side B: Alunos & Famílias */}
              <button
                type="button"
                onClick={() => setActiveSide("family")}
                onMouseEnter={() => setActiveSide("family")}
                onFocus={() => setActiveSide("family")}
                aria-pressed={activeSide === "family"}
                className="text-left focus-visible:outline-none cursor-pointer"
              >
                <BeamNode
                  ref={familyRef}
                  className={`w-full justify-start gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                    activeSide === "family"
                      ? "border-[var(--landing-accent)] bg-[var(--landing-surface)] shadow-[0_12px_36px_-18px_rgba(99,102,241,0.35)] scale-[1.01]"
                      : "border-[var(--landing-border)] bg-[var(--landing-surface)]/70 hover:border-[var(--landing-border-strong)]"
                  }`}
                >
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      activeSide === "family"
                        ? "bg-[var(--landing-accent)] text-white"
                        : "bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)]"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[var(--landing-text-primary)] truncate">
                      {studentRole?.role || "Estudantes"}
                    </span>
                    <span className="block text-xs font-light text-[var(--landing-text-muted)] truncate">
                      {roles.find((r) => r.id === "parents")?.role || "Encarregados"}
                    </span>
                  </span>
                </BeamNode>
              </button>
            </div>

            {/* Smooth animated connecting beams on md+ */}
            <div className="hidden md:block">
              <AnimatedBeam
                containerRef={bridgeRef}
                fromRef={schoolRef}
                toRef={coreRef}
                curvature={-18}
                duration={3.8}
              />
              <AnimatedBeam
                containerRef={bridgeRef}
                fromRef={coreRef}
                toRef={familyRef}
                curvature={18}
                duration={3.8}
                delay={0.4}
              />
            </div>
          </div>

          {/* Animated 1-line dynamic explanation */}
          <div className="mt-2 pt-5 border-t border-[var(--landing-border-subtle)] min-h-[56px] flex items-center justify-center text-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeSide}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4"
              >
                <span className="text-xs sm:text-sm font-medium text-[var(--landing-accent)]">
                  {current.label}
                </span>
                <span className="hidden sm:inline text-[var(--landing-border-strong)]" aria-hidden="true">
                  ·
                </span>
                <span className="text-xs sm:text-sm font-light text-[var(--landing-text-secondary)]">
                  {current.summary}
                </span>
                <Link
                  href={current.href}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--landing-text-primary)] hover:text-[var(--landing-accent)] transition-colors"
                >
                  <span>{current.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </MotionReveal>
      </div>
    </section>
  )
}
