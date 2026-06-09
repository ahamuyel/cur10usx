"use client"

import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { TheInfiniteGrid } from "@/components/ui/the-infinite-grid"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { ProgressiveBlur } from "@/components/ui/progressive-blur"
import type { PlatformBranding, SchoolLogo } from "@/types/landing"

type Props = {
  branding?: PlatformBranding
  schools?: SchoolLogo[]
  locale?: string
}

export default function HeroSection({
  schools: rawSchools = [],
  locale = "pt",
}: Props) {
  const router = useRouter()
  const { t } = useTranslation(locale)

  const schools = Array.isArray(rawSchools) ? rawSchools : []

  return (
    <TheInfiniteGrid className="min-h-screen pt-24 md:pt-32 pb-20 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HERO CONTENT */}
        <div className="flex flex-col items-center text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 dark:border-zinc-800 bg-background/80 backdrop-blur-sm text-xs font-medium text-muted-foreground mb-8">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Plataforma educativa tudo-em-um
          </div>

          {/* Headline */}
          <h1 className="max-w-5xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Mais organização para a escola.
            <br />
            Mais acompanhamento para os alunos.
          </h1>

          {/* Subheadline */}
          <p className="mt-8 max-w-3xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            O Cur10usX reúne gestão escolar, desempenho académico,
            comunicação e acompanhamento estudantil numa única
            plataforma moderna.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => router.push("/registar-escola")}
              className="
                px-8 py-3
                rounded-xl
                bg-primary
                text-primary-foreground
                font-semibold
                hover:scale-[1.02]
                active:scale-[0.98]
                transition-all
                shadow-lg
              "
            >
              Registar Escola
            </button>

            <button
              onClick={() => router.push("/signup")}
              className="
                px-8 py-3
                rounded-xl
                border
                border-neutral-200
                dark:border-zinc-800
                bg-background
                font-semibold
                hover:bg-muted
                transition-all
              "
            >
              Conhecer a Plataforma
            </button>
          </div>

          {/* STATS */}
          {/* <div className="mt-16 grid grid-cols-3 gap-8 md:gap-16">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold">
                +90%
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Organização académica
              </p>
            </div>

            <div>
              <h3 className="text-2xl md:text-3xl font-bold">
                24/7
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Acesso aos dados
              </p>
            </div>

            <div>
              <h3 className="text-2xl md:text-3xl font-bold">
                1 Plataforma
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Escola • Professor • Aluno
              </p>
            </div>
          </div> */}

          {/* DASHBOARD PREVIEW */}
          {/* <div className="mt-20 w-full max-w-6xl">
            <div
              className="
                rounded-3xl
                border
                border-neutral-200
                dark:border-zinc-800
                bg-background/80
                backdrop-blur
                shadow-2xl
                overflow-hidden
              "
            >
              <div className="border-b border-neutral-200 dark:border-zinc-800 p-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="rounded-xl bg-muted p-6 h-32" />
                  <div className="rounded-xl bg-muted p-6 h-32" />
                  <div className="rounded-xl bg-muted p-6 h-32" />
                </div>

                <div className="mt-6 rounded-xl bg-muted h-72" />
              </div>
            </div>
          </div> */}
        </div>

        {/* LOGOS */}
        {/* {schools.length > 0 && (
          <div className="mt-24">
            <p className="text-center text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground mb-8">
              Escolas que confiam no Cur10usX
            </p>

            <div className="relative h-[60px] overflow-hidden">
              <InfiniteSlider duration={35} gap={64}>
                {schools.map((school, i) => (
                  <div
                    key={school?.id || i}
                    className="
                      flex
                      h-[60px]
                      w-40
                      items-center
                      justify-center
                      grayscale
                      opacity-50
                      hover:grayscale-0
                      hover:opacity-100
                      transition-all
                    "
                  >
                    <img
                      src={school?.logo || ""}
                      alt={school?.name || "School Logo"}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </InfiniteSlider>

              <ProgressiveBlur
                className="absolute left-0 top-0 h-full w-24 z-20"
                direction="left"
                blurIntensity={1}
              />

              <ProgressiveBlur
                className="absolute right-0 top-0 h-full w-24 z-20"
                direction="right"
                blurIntensity={1}
              />
            </div>
          </div>
        )} */}
      </div>
    </TheInfiniteGrid>
  )
}