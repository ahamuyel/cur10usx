"use client"

import { useRef } from "react"
import { useTranslation } from "@/lib/i18n"
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from "@/components/ui/uilayouts-accordion"
import { TimelineAnimation } from "@/components/ui/timeline-animation"

type FAQItem = {
  q: string
  a: string
}

export default function FAQSection() {
  const { t, tv } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)

  const items = (tv("landing.faq.items") as FAQItem[]) || []

  if (!items.length) return null

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="py-20 sm:py-24 lg:py-28 bg-[var(--landing-bg-secondary)] border-t border-[var(--landing-border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Sticky Intro */}
          <TimelineAnimation
            timelineRef={sectionRef}
            animationNum={0}
            className="lg:col-span-4 lg:sticky lg:top-24"
          >
            <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-2.5">
              {t("landing.faq.tag")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]">
              {t("landing.faq.headline")}
            </h2>
            <p className="mt-3 text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed">
              {t("landing.faq.description")}
            </p>
          </TimelineAnimation>

          {/* UI Layouts Spring Clip-Path Accordion */}
          <TimelineAnimation
            timelineRef={sectionRef}
            animationNum={1}
            className="lg:col-span-8"
          >
            <Accordion defaultValue="faq-0">
              {items.map((item, idx) => (
                <AccordionItem key={item.q} value={`faq-${idx}`}>
                  <AccordionHeader>{item.q}</AccordionHeader>
                  <AccordionPanel>{item.a}</AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </TimelineAnimation>
        </div>
      </div>
    </section>
  )
}
