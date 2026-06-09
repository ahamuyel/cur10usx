"use client"

import { useTranslation } from "@/lib/i18n"
import { Feature } from "@/components/ui/feature-with-image-carousel"

type Props = { locale?: string }

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    alt: "Sala de aula moderna com alunos utilizando tablets",
  },
  {
    src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    alt: "Professor auxiliando alunos em ambiente digital",
  },
  {
    src: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80",
    alt: "Gestão escolar com ferramentas digitais",
  },
  {
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    alt: "Estudante pesquisando online",
  },
  {
    src: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800&q=80",
    alt: "Dashboard de analytics educacional",
  },
]

export default function ProblemSection({ locale = "pt" }: Props) {
  const { t, tv } = useTranslation(locale)
  const items = tv("landing.problem.items") as {
    title: string
    description: string
  }[]

  return (
    <section
      id="problems"
      className="py-20 md:py-32 bg-[var(--landing-bg-secondary)] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Feature
          badge={t("landing.problem.tag")}
          title={t("landing.problem.headline")}
          description={t("landing.problem.description")}
          images={IMAGES}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 -mt-10">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="border border-[var(--landing-border)] bg-[var(--landing-bg)] p-8 rounded-xl transition-colors hover:border-[var(--landing-border-strong)]"
            >
              <span className="text-sm font-bold text-[var(--landing-text-dim)] mb-3 block">
                0{idx + 1}
              </span>
              <h3 className="text-lg font-bold text-[var(--landing-text-primary)] tracking-tight mb-3">
                {item.title}
              </h3>
              <p className="text-[var(--landing-text-secondary)] text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
