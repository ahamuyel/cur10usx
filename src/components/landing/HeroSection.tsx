"use client"

import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { TheInfiniteGrid } from "@/components/ui/the-infinite-grid"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { ProgressiveBlur } from "@/components/ui/progressive-blur"
import { BarChart3, GraduationCap, Users, School } from "lucide-react"
import type { PlatformBranding, SchoolLogo, LandingStats } from "@/types/landing"

type Props = {
  branding?: PlatformBranding
  schools?: SchoolLogo[]
  stats: LandingStats
  locale?: string
}

export default function HeroSection({
  schools: rawSchools = [],
  stats,
  locale = "pt",
}: Props) {
  const router = useRouter()
  const { t } = useTranslation(locale)

  const schools = Array.isArray(rawSchools) ? rawSchools : []

  return (
    <TheInfiniteGrid className="min-h-screen pt-24 md:pt-32 pb-20 md:pb-28 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HERO CONTENT — Split layout: text left, visual right */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Text */}
          <div className="text-center lg:text-left">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--landing-border)] bg-[var(--landing-bg)]/80 backdrop-blur-sm text-xs font-medium text-[var(--landing-text-secondary)] mb-8">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {t("landing.hero.badge")}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-[var(--landing-text-primary)] whitespace-pre-line">
              {t("landing.hero.headline")}
            </h1>

            {/* Subheadline */}
            <p className="mt-6 max-w-xl text-base md:text-lg text-[var(--landing-text-secondary)] leading-relaxed">
              {t("landing.hero.subheadline")}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/registar-escola")}
                className="
                  px-8 py-3.5
                  rounded-xl
                  bg-neutral-900 dark:bg-white
                  text-white dark:text-neutral-900
                  font-semibold text-sm
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  transition-all
                  shadow-xl shadow-neutral-900/10 dark:shadow-white/5
                "
              >
                {t("landing.hero.cta")}
              </button>

              <button
                onClick={() => router.push("/signup")}
                className="
                  px-8 py-3.5
                  rounded-xl
                  border border-[var(--landing-border)]
                  bg-[var(--landing-bg)]
                  text-[var(--landing-text-primary)]
                  font-semibold text-sm
                  hover:bg-[var(--landing-bg-tertiary)]
                  transition-all
                "
              >
                {t("landing.hero.explore")}
              </button>
            </div>

            {/* Stats */}
            <div className="mt-10 flex items-center gap-8">
              <div className="flex items-center gap-2 text-sm text-[var(--landing-text-secondary)]">
                <School size={16} className="text-primary" />
                <span className="font-bold text-[var(--landing-text-primary)]">{stats.schools}</span>
                <span>escolas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--landing-text-secondary)]">
                <Users size={16} className="text-primary" />
                <span className="font-bold text-[var(--landing-text-primary)]">{stats.students}</span>
                <span>alunos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--landing-text-secondary)]">
                <BarChart3 size={16} className="text-primary" />
                <span className="font-bold text-[var(--landing-text-primary)]">{stats.results}</span>
                <span>avaliações</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Dashboard Mockup */}
          <div className="hidden lg:block relative">
            <div className="relative">
              {/* Glow effect behind the mockup */}
              <div className="absolute -inset-16 bg-gradient-to-r from-primary/20 via-cyan/10 to-transparent rounded-[40px] blur-3xl opacity-60" />
              
              {/* TODO: Replace this mockup with a real screenshot of the Cur10usX dashboard */}
              <div className="relative rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] shadow-2xl overflow-hidden">
                {/* Mockup header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--landing-border)] bg-[var(--landing-bg-secondary)]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-mono text-[var(--landing-text-dim)] ml-3">cur10usx.app/dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <GraduationCap size={12} className="text-primary" />
                    </div>
                  </div>
                </div>

                {/* Mockup body */}
                <div className="p-5 space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                      <p className="text-[11px] text-[var(--landing-text-dim)] font-medium uppercase tracking-wider">Alunos</p>
                      <p className="text-2xl font-bold text-[var(--landing-text-primary)] mt-1">{stats.students}</p>
                    </div>
                    <div className="rounded-xl bg-cyan/5 border border-cyan/10 p-4">
                      <p className="text-[11px] text-[var(--landing-text-dim)] font-medium uppercase tracking-wider">Professores</p>
                      <p className="text-2xl font-bold text-[var(--landing-text-primary)] mt-1">{stats.teachers}</p>
                    </div>
                    <div className="rounded-xl bg-emerald/5 border border-emerald/10 p-4">
                      <p className="text-[11px] text-[var(--landing-text-dim)] font-medium uppercase tracking-wider">Turmas</p>
                      <p className="text-2xl font-bold text-[var(--landing-text-primary)] mt-1">{stats.classes}</p>
                    </div>
                  </div>

                  {/* Chart section */}
                  <div className="rounded-xl bg-[var(--landing-bg-secondary)] border border-[var(--landing-border)] p-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-semibold text-[var(--landing-text-primary)]">Desempenho por Turma</p>
                      <span className="text-[10px] text-[var(--landing-text-dim)]">Este período</span>
                    </div>
                    <div className="flex items-end gap-3 h-24">
                      <div className="flex-1 bg-primary/20 rounded-t-lg h-16" style={{ height: "65%" }} />
                      <div className="flex-1 bg-primary/30 rounded-t-lg" style={{ height: "80%" }} />
                      <div className="flex-1 bg-primary/40 rounded-t-lg" style={{ height: "45%" }} />
                      <div className="flex-1 bg-primary/50 rounded-t-lg" style={{ height: "90%" }} />
                      <div className="flex-1 bg-primary/60 rounded-t-lg" style={{ height: "55%" }} />
                      <div className="flex-1 bg-primary/40 rounded-t-lg" style={{ height: "70%" }} />
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div className="flex items-center justify-between text-[11px] text-[var(--landing-text-dim)]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {stats.schools} {t("landing.hero.stats")}
                    </span>
                    <span>actualizado em tempo real</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LOGOS CAROUSEL */}
        {schools.length > 0 && (
          <div className="mt-20 md:mt-24">
            <p className="text-center text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--landing-text-dim)] mb-6">
              {t("landing.hero.trusted_by")}
            </p>

            <div className="relative h-[50px] overflow-hidden">
              <InfiniteSlider duration={35} gap={56}>
                {schools.map((school, i) => (
                  <div
                    key={i}
                    className="
                      flex h-[50px] w-36
                      items-center justify-center
                      grayscale opacity-40
                      hover:grayscale-0 hover:opacity-100
                      transition-all duration-300
                    "
                  >
                    {school.logo ? (
                      <img
                        src={school.logo}
                        alt={school.name || "School Logo"}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs font-medium text-[var(--landing-text-dim)]">
                        {school.name}
                      </span>
                    )}
                  </div>
                ))}
              </InfiniteSlider>

              <ProgressiveBlur
                className="absolute left-0 top-0 h-full w-24 z-20 pointer-events-none"
                direction="left"
                blurIntensity={1}
              />
              <ProgressiveBlur
                className="absolute right-0 top-0 h-full w-24 z-20 pointer-events-none"
                direction="right"
                blurIntensity={1}
              />
            </div>
          </div>
        )}
      </div>
    </TheInfiniteGrid>
  )
}