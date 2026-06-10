"use client"

import { useTranslation } from "@/lib/i18n"
import { Quote } from "lucide-react"

type Props = { locale?: string }

type TestimonialItem = {
  quote: string
  author: string
  role: string
  school: string
}

export default function TestimonialsSection({ locale = "pt" }: Props) {
  const { t, tv } = useTranslation(locale)

  const items = tv("landing.testimonials.items") as TestimonialItem[]

  return (
    <section className="py-20 md:py-32 bg-[var(--landing-bg)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            {t("landing.testimonials.tag")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-primary)] leading-none mb-6">
            {t("landing.testimonials.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            {t("landing.testimonials.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] p-6 md:p-8 rounded-xl relative transition-all duration-300 hover:border-[var(--landing-border-strong)] hover:shadow-sm"
            >
              <Quote size={24} className="text-primary/20 absolute top-6 right-6" />
              <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed mb-8 italic">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="border-t border-[var(--landing-border)] pt-4 mt-auto">
                <p className="text-sm font-bold text-[var(--landing-text-primary)]">
                  {item.author}
                </p>
                <p className="text-xs text-[var(--landing-text-dim)]">
                  {item.role}, {item.school}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
