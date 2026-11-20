"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  ChevronDown,
  Building2,
  BookOpenCheck,
  GraduationCap,
  Users,
  ShieldCheck,
  Sparkles,
  Award,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { TimelineAnimation } from "@/components/ui/timeline-animation"
import { AnimatedBeam, BeamNode } from "@/components/ui/animated-beam"

type NodeKey = "institutions" | "teachers" | "core" | "students" | "parents"

export default function HeroSection() {
  const { t, tv } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const instRef = useRef<HTMLDivElement>(null)
  const teacherRef = useRef<HTMLDivElement>(null)
  const studentRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)

  const [focusedNode, setFocusedNode] = useState<NodeKey>("core")

  const headlineLines = t("landing.hero.headline").split("\n")
  const roles = (tv("landing.ecosystem.roles") as {
    id: string
    role: string
    title: string
    description: string
  }[]) || []

  const nodeSummary: Record<NodeKey, { label: string; text: string }> = {
    core: {
      label: "Cur10usX Core",
      text: t("landing.hero.preview_label"),
    },
    institutions: {
      label: roles[0]?.role || "Instituições",
      text: roles[0]?.title || "",
    },
    students: {
      label: roles[1]?.role || "Estudantes",
      text: roles[1]?.title || "",
    },
    teachers: {
      label: roles[2]?.role || "Professores",
      text: roles[2]?.title || "",
    },
    parents: {
      label: roles[3]?.role || "Encarregados",
      text: roles[3]?.title || "",
    },
  }

  const activeInfo = nodeSummary[focusedNode]

  return (
    <section
      id="produto"
      ref={sectionRef}
      className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 overflow-hidden bg-[var(--landing-bg)]"
    >
      {/* Architectural CSS grid mask */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_75%_55%_at_50%_15%,#000_25%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[min(780px,95vw)] h-[260px] rounded-full bg-[var(--landing-accent-subtle)] blur-3xl opacity-75"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow */}
          <TimelineAnimation
            timelineRef={sectionRef}
            animationNum={0}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-xs font-normal text-[var(--landing-text-secondary)] mb-6 sm:mb-7"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]"
              aria-hidden="true"
            />
            <span>{t("landing.hero.badge")}</span>
          </TimelineAnimation>

          {/* Headline — Geist Medium, refined scale */}
          <TimelineAnimation
            as="h1"
            timelineRef={sectionRef}
            animationNum={1}
            className="text-[2rem] sm:text-5xl lg:text-[3.5rem] font-medium tracking-[-0.03em] leading-[1.08] text-[var(--landing-text-primary)] text-balance"
          >
            {headlineLines.map((line, i) => (
              <span key={i} className="block">
                {i === headlineLines.length - 1 ? (
                  <span className="text-[var(--landing-accent)]">{line}</span>
                ) : (
                  line
                )}
              </span>
            ))}
          </TimelineAnimation>

          {/* Subheadline */}
          <TimelineAnimation
            as="p"
            timelineRef={sectionRef}
            animationNum={2}
            className="mt-5 sm:mt-6 max-w-2xl mx-auto text-[15px] sm:text-base lg:text-[17px] font-light text-[var(--landing-text-secondary)] leading-relaxed"
          >
            {t("landing.hero.subheadline")}
          </TimelineAnimation>

          {/* CTAs */}
          <TimelineAnimation
            timelineRef={sectionRef}
            animationNum={3}
            className="mt-8 sm:mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
          >
            <Link
              href="/registar-escola"
              className="group inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl bg-[var(--landing-text-primary)] text-[var(--landing-bg)] text-sm font-medium hover:opacity-90 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-bg)]"
            >
              <span>{t("landing.hero.cta")}</span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>

            <a
              href="#experiencia"
              className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text-primary)] text-sm font-normal hover:bg-[var(--landing-bg-tertiary)] hover:border-[var(--landing-border-strong)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              <span>{t("landing.hero.explore")}</span>
              <ChevronDown
                className="w-4 h-4 text-[var(--landing-text-muted)]"
                aria-hidden="true"
              />
            </a>
          </TimelineAnimation>
        </div>

        {/* Interactive UI Layouts AnimatedBeam Ecosystem Stage (No outdated PNGs) */}
        <TimelineAnimation
          timelineRef={sectionRef}
          animationNum={4}
          className="mt-12 sm:mt-16 max-w-5xl mx-auto"
        >
          <div className="rounded-3xl border border-[var(--landing-border)] bg-[var(--landing-surface)]/95 p-1.5 sm:p-2 shadow-[0_24px_70px_-34px_rgba(9,9,11,0.22)] dark:shadow-[0_24px_70px_-34px_rgba(0,0,0,0.9)]">
            <div className="rounded-[calc(1.5rem-6px)] border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)] overflow-hidden">
              {/* Top architectural bar */}
              <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-11 border-b border-[var(--landing-border)] bg-[var(--landing-surface)]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                  <span className="font-mono text-[11px] text-[var(--landing-text-muted)] truncate">
                    cur10usx://ecosystem-graph
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-[var(--landing-text-muted)]">
                  <span className="px-2 py-0.5 rounded-md border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)]">
                    Multi-Tenant
                  </span>
                  <span className="px-2 py-0.5 rounded-md border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)]">
                    RBAC · 2FA
                  </span>
                  <span className="px-2 py-0.5 rounded-md border border-[var(--landing-accent)]/30 bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)]">
                    {t("landing.evolution.tag")}
                  </span>
                </div>
              </div>

              {/* Animated Beam Topology */}
              <div
                ref={canvasRef}
                className="relative px-4 py-8 sm:px-10 sm:py-12 lg:py-14 overflow-hidden"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 grid-bg-fine opacity-70"
                />

                {/* Responsive Grid of Connected Nodes */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 items-center gap-6 md:gap-8">
                  {/* Left Column: Institutions + Teachers */}
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-3 sm:gap-5">
                    <button
                      type="button"
                      onMouseEnter={() => setFocusedNode("institutions")}
                      onFocus={() => setFocusedNode("institutions")}
                      onClick={() => setFocusedNode("institutions")}
                      className="text-left focus-visible:outline-none"
                    >
                      <BeamNode
                        ref={instRef}
                        className={`w-full justify-start gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5 cursor-pointer transition-all duration-200 ${
                          focusedNode === "institutions"
                            ? "border-[var(--landing-accent)] ring-2 ring-[var(--landing-accent-subtle)]"
                            : "hover:border-[var(--landing-border-strong)]"
                        }`}
                      >
                        <span className="w-9 h-9 rounded-xl bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs sm:text-sm font-medium text-[var(--landing-text-primary)] truncate">
                            {roles[0]?.role || "Instituições"}
                          </span>
                          <span className="block text-[11px] font-light text-[var(--landing-text-muted)] truncate">
                            Multi-tenant · Pautas
                          </span>
                        </span>
                      </BeamNode>
                    </button>

                    <button
                      type="button"
                      onMouseEnter={() => setFocusedNode("teachers")}
                      onFocus={() => setFocusedNode("teachers")}
                      onClick={() => setFocusedNode("teachers")}
                      className="text-left focus-visible:outline-none"
                    >
                      <BeamNode
                        ref={teacherRef}
                        className={`w-full justify-start gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5 cursor-pointer transition-all duration-200 ${
                          focusedNode === "teachers"
                            ? "border-[var(--landing-accent)] ring-2 ring-[var(--landing-accent-subtle)]"
                            : "hover:border-[var(--landing-border-strong)]"
                        }`}
                      >
                        <span className="w-9 h-9 rounded-xl bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center shrink-0">
                          <BookOpenCheck className="w-4 h-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs sm:text-sm font-medium text-[var(--landing-text-primary)] truncate">
                            {roles[2]?.role || "Professores"}
                          </span>
                          <span className="block text-[11px] font-light text-[var(--landing-text-muted)] truncate">
                            Aulas · Avaliações
                          </span>
                        </span>
                      </BeamNode>
                    </button>
                  </div>

                  {/* Center Hub: Cur10usX Core */}
                  <div className="flex flex-col items-center justify-center">
                    <button
                      type="button"
                      onMouseEnter={() => setFocusedNode("core")}
                      onFocus={() => setFocusedNode("core")}
                      onClick={() => setFocusedNode("core")}
                      className="group relative focus-visible:outline-none cursor-pointer"
                    >
                      <div
                        aria-hidden="true"
                        className="absolute -inset-4 rounded-3xl bg-[var(--landing-accent-subtle)] blur-xl opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      <BeamNode
                        ref={coreRef}
                        className={`flex-col gap-2 px-6 py-5 rounded-2xl border-2 transition-all duration-200 ${
                          focusedNode === "core"
                            ? "border-[var(--landing-accent)]"
                            : "border-[var(--landing-border-strong)] hover:border-[var(--landing-accent)]"
                        }`}
                      >
                        <Image
                          src="/blacklogo.png"
                          alt="Cur10usX"
                          width={32}
                          height={32}
                          className="h-8 w-auto rounded-lg dark:hidden"
                          priority
                        />
                        <Image
                          src="/whitelogo.png"
                          alt="Cur10usX"
                          width={32}
                          height={32}
                          className="h-8 w-auto rounded-lg hidden dark:block"
                          priority
                        />
                        <span className="text-xs font-medium tracking-tight text-[var(--landing-text-primary)]">
                          Cur10us<span className="text-[var(--landing-accent)]">X</span> Core
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--landing-text-muted)]">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                          <span>Sync · Audit</span>
                        </div>
                      </BeamNode>
                    </button>
                  </div>

                  {/* Right Column: Students (Evolutionary Profile) + Parents */}
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-3 sm:gap-5">
                    <button
                      type="button"
                      onMouseEnter={() => setFocusedNode("students")}
                      onFocus={() => setFocusedNode("students")}
                      onClick={() => setFocusedNode("students")}
                      className="text-left focus-visible:outline-none"
                    >
                      <BeamNode
                        ref={studentRef}
                        className={`w-full justify-start gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5 cursor-pointer transition-all duration-200 ${
                          focusedNode === "students"
                            ? "border-[var(--landing-accent)] ring-2 ring-[var(--landing-accent-subtle)]"
                            : "hover:border-[var(--landing-border-strong)]"
                        }`}
                      >
                        <span className="w-9 h-9 rounded-xl bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs sm:text-sm font-medium text-[var(--landing-text-primary)] truncate">
                            {roles[1]?.role || "Estudantes"}
                          </span>
                          <span className="block text-[11px] font-light text-[var(--landing-text-muted)] truncate">
                            {t("landing.evolution.tag")}
                          </span>
                        </span>
                      </BeamNode>
                    </button>

                    <button
                      type="button"
                      onMouseEnter={() => setFocusedNode("parents")}
                      onFocus={() => setFocusedNode("parents")}
                      onClick={() => setFocusedNode("parents")}
                      className="text-left focus-visible:outline-none"
                    >
                      <BeamNode
                        ref={parentRef}
                        className={`w-full justify-start gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5 cursor-pointer transition-all duration-200 ${
                          focusedNode === "parents"
                            ? "border-[var(--landing-accent)] ring-2 ring-[var(--landing-accent-subtle)]"
                            : "hover:border-[var(--landing-border-strong)]"
                        }`}
                      >
                        <span className="w-9 h-9 rounded-xl bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs sm:text-sm font-medium text-[var(--landing-text-primary)] truncate">
                            {roles[3]?.role || "Encarregados"}
                          </span>
                          <span className="block text-[11px] font-light text-[var(--landing-text-muted)] truncate">
                            Assiduidade · Avisos
                          </span>
                        </span>
                      </BeamNode>
                    </button>
                  </div>
                </div>

                {/* Animated curved beams (desktop/tablet topology) */}
                <div className="hidden md:block">
                  <AnimatedBeam
                    containerRef={canvasRef}
                    fromRef={instRef}
                    toRef={coreRef}
                    curvature={-28}
                    duration={4.2}
                    delay={0}
                  />
                  <AnimatedBeam
                    containerRef={canvasRef}
                    fromRef={teacherRef}
                    toRef={coreRef}
                    curvature={28}
                    duration={4.6}
                    delay={0.6}
                  />
                  <AnimatedBeam
                    containerRef={canvasRef}
                    fromRef={coreRef}
                    toRef={studentRef}
                    curvature={-28}
                    duration={4.0}
                    delay={0.3}
                  />
                  <AnimatedBeam
                    containerRef={canvasRef}
                    fromRef={coreRef}
                    toRef={parentRef}
                    curvature={28}
                    duration={4.8}
                    delay={0.9}
                  />
                </div>
              </div>

              {/* Interactive bottom telemetry bar (reacts to hovered/clicked node) */}
              <div className="px-4 sm:px-6 py-3.5 border-t border-[var(--landing-border)] bg-[var(--landing-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--landing-accent)] shrink-0" aria-hidden="true" />
                  <span className="text-xs font-medium text-[var(--landing-text-primary)] shrink-0">
                    {activeInfo.label}
                  </span>
                  <span className="text-[var(--landing-border-strong)]" aria-hidden="true">
                    —
                  </span>
                  <span className="text-xs font-light text-[var(--landing-text-secondary)] truncate">
                    {activeInfo.text}
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[var(--landing-text-muted)] shrink-0">
                  <Award className="w-3.5 h-3.5 text-[var(--landing-accent)]" aria-hidden="true" />
                  <span>{t("landing.features.tag")}</span>
                </div>
              </div>
            </div>
          </div>
        </TimelineAnimation>
      </div>
    </section>
  )
}
