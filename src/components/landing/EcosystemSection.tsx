"use client"

import Link from "next/link"
import { Building2, GraduationCap, BookOpenCheck, Users, Check, ArrowUpRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { TimelineReveal } from "@/components/ui/timeline-reveal"

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

export default function EcosystemSection() {
  const { t, tv } = useTranslation()
  const roles = (tv("landing.ecosystem.roles") as RoleCardData[]) || []

  return (
    <section
      id="ecossistema"
      className="py-20 sm:py-24 lg:py-28 bg-[var(--landing-bg-secondary)] border-y border-[var(--landing-border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 sm:mb-14">
          <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-2.5">
            {t("landing.ecosystem.tag")}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]">
            {t("landing.ecosystem.headline")}
          </h2>
          <p className="mt-3.5 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
            {t("landing.ecosystem.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {roles.map((item, idx) => {
            const meta = roleMeta[item.id] || { icon: Users, href: "/signup" }
            const Icon = meta.icon
            const ctaLabel =
              item.id === "institutions"
                ? t("landing.ecosystem.cta_institution")
                : t("landing.ecosystem.cta_member")

            return (
              <TimelineReveal key={item.id} index={idx}>
                <SpotlightCard className="h-full p-6 sm:p-7">
                  <div className="flex flex-col h-full justify-between gap-6">
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-5">
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

                      <h3 className="text-lg sm:text-xl font-medium tracking-[-0.015em] text-[var(--landing-text-primary)] mb-2.5">
                        {item.title}
                      </h3>
                      <p className="text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed mb-5">
                        {item.description}
                      </p>

                      <ul className="space-y-2.5">
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
                        className="group inline-flex items-center gap-1.5 text-xs font-medium text-[var(--landing-text-primary)] hover:text-[var(--landing-accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] rounded"
                      >
                        <span>{ctaLabel}</span>
                        <ArrowUpRight
                          className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  </div>
                </SpotlightCard>
              </TimelineReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
