"use client"

import Link from "next/link"
import { ArrowRight, GraduationCap, Users, CheckCircle2 } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { TabsProvider, TabsBtn, TabsContent } from "@/components/ui/uilayouts-tabs"
import { ScrollText, MotionReveal } from "@/components/ui/scroll-text"
import EvolutionaryProfileSection from "@/components/landing/EvolutionaryProfileSection"

type PointItem = {
  title: string
  desc: string
}

/**
 * `/para-estudantes` page — dedicated, crystal-clear guide for Students & Parents
 * combining UI Layouts TabsProvider + scroll-linked Student Journey timeline.
 */
export default function StudentsPageContent() {
  const { t, tv } = useTranslation()
  const studentPoints = (tv("landing.pages.students.student_points") as PointItem[]) || []
  const parentPoints = (tv("landing.pages.students.parent_points") as PointItem[]) || []

  return (
    <>
      {/* Editorial Hero Band */}
      <section className="relative pt-16 overflow-hidden bg-[var(--landing-bg)] border-b border-[var(--landing-border)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[min(720px,95vw)] h-[240px] rounded-full bg-[var(--landing-accent-subtle)] blur-3xl opacity-65"
        />

        <div className="relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto border-x border-[var(--landing-border)] px-5 sm:px-10 pt-14 pb-14 sm:pt-20 sm:pb-20 text-center">
            <MotionReveal immediate y={10}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-xs font-normal text-[var(--landing-accent)] mb-6">
                {t("landing.pages.students.tag")}
              </span>
            </MotionReveal>

            <ScrollText
              as="h1"
              text={t("landing.pages.students.headline")}
              accentLastLine
              immediate
              delay={0.05}
              className="text-3xl sm:text-5xl lg:text-[3.5rem] font-medium tracking-[-0.035em] leading-[1.08] text-[var(--landing-text-primary)] text-balance"
            />

            <MotionReveal immediate delay={0.22} y={14}>
              <p className="mt-5 max-w-2xl mx-auto text-[15px] sm:text-base lg:text-lg font-light text-[var(--landing-text-secondary)] leading-relaxed">
                {t("landing.pages.students.description")}
              </p>
            </MotionReveal>

            <MotionReveal
              immediate
              delay={0.3}
              y={14}
              className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
            >
              <Link
                href="/aplicacao"
                className="group inline-flex items-center justify-center gap-2 px-7 h-12 rounded-full bg-[var(--landing-text-primary)] text-[var(--landing-bg)] text-sm font-medium hover:opacity-90 transition-all active:scale-[0.98]"
              >
                <span>{t("landing.pages.students.cta_primary")}</span>
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center px-7 h-12 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text-primary)] text-sm font-normal hover:bg-[var(--landing-bg-tertiary)] transition-colors"
              >
                {t("landing.pages.students.cta_secondary")}
              </Link>
            </MotionReveal>
          </div>
        </div>
      </section>

      {/* Interactive Student vs Parent Switcher (UI Layouts Wobbly Tabs, Zero cards) */}
      <section className="py-20 sm:py-24 bg-[var(--landing-bg)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <TabsProvider defaultValue="student" tabsOrder={["student", "parent"]} wobbly={true}>
            <div
              role="tablist"
              aria-label={t("landing.pages.students.tag")}
              className="inline-flex p-1 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] mb-10"
            >
              <TabsBtn value="student" className="px-5 h-10 text-xs sm:text-sm">
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
                <span>{t("landing.pages.students.tab_student")}</span>
              </TabsBtn>
              <TabsBtn value="parent" className="px-5 h-10 text-xs sm:text-sm">
                <Users className="w-4 h-4" aria-hidden="true" />
                <span>{t("landing.pages.students.tab_parent")}</span>
              </TabsBtn>
            </div>

            <TabsContent value="student">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                <div className="lg:col-span-5 space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.025em] text-[var(--landing-text-primary)] leading-snug">
                    {t("landing.pages.students.student_title")}
                  </h2>
                  <p className="text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
                    {t("landing.pages.students.student_desc")}
                  </p>
                </div>

                <div className="lg:col-span-7 divide-y divide-[var(--landing-border)] border-y border-[var(--landing-border)]">
                  {studentPoints.map((pt) => (
                    <div key={pt.title} className="py-6 flex items-start gap-3.5">
                      <CheckCircle2
                        className="w-5 h-5 text-[var(--landing-accent)] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="text-base font-medium text-[var(--landing-text-primary)]">
                          {pt.title}
                        </h3>
                        <p className="mt-1 text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed">
                          {pt.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="parent">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                <div className="lg:col-span-5 space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.025em] text-[var(--landing-text-primary)] leading-snug">
                    {t("landing.pages.students.parent_title")}
                  </h2>
                  <p className="text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
                    {t("landing.pages.students.parent_desc")}
                  </p>
                </div>

                <div className="lg:col-span-7 divide-y divide-[var(--landing-border)] border-y border-[var(--landing-border)]">
                  {parentPoints.map((pt) => (
                    <div key={pt.title} className="py-6 flex items-start gap-3.5">
                      <CheckCircle2
                        className="w-5 h-5 text-[var(--landing-accent)] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="text-base font-medium text-[var(--landing-text-primary)]">
                          {pt.title}
                        </h3>
                        <p className="mt-1 text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed">
                          {pt.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </TabsProvider>
        </div>
      </section>

      {/* Scroll-linked Student Journey Timeline */}
      <EvolutionaryProfileSection />

      {/* Direct Student/Family Closing CTA */}
      <section className="py-20 sm:py-24 bg-[var(--landing-bg)] text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollText
            text={t("landing.pages.students.cta_primary")}
            className="text-2xl sm:text-3xl font-medium tracking-[-0.025em] text-[var(--landing-text-primary)]"
          />
          <MotionReveal delay={0.12} y={14} className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/aplicacao"
              className="group inline-flex items-center justify-center gap-2 px-7 h-12 rounded-full bg-[var(--landing-text-primary)] text-[var(--landing-bg)] text-sm font-medium hover:opacity-90 transition-all"
            >
              <span>{t("landing.pages.students.cta_primary")}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center px-7 h-12 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text-primary)] text-sm font-normal hover:bg-[var(--landing-bg-tertiary)] transition-colors"
            >
              {t("landing.pages.students.cta_secondary")}
            </Link>
          </MotionReveal>
        </div>
      </section>
    </>
  )
}
