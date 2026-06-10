"use client"

import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { ArrowRight, ShieldCheck, Clock, Headphones } from "lucide-react"

type Props = {
  locale?: string
}

export default function CTASection({ locale = "pt" }: Props) {
  const router = useRouter()
  const { t } = useTranslation(locale)

  return (
    <section className="py-20 md:py-32 bg-[var(--landing-bg-dark)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs text-[var(--landing-text-dark-secondary)] uppercase tracking-widest block mb-3">
            Uma Escola Preparada para o Futuro
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-dark-primary)] leading-none mb-6">
            Modernizar uma escola não começa com mais trabalho.
          </h2>
          <p className="text-[var(--landing-text-dark-secondary)] text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-10">
            Começa com melhores sistemas, melhor visibilidade e melhores ferramentas para crescer. A Cur10usX ajuda a sua escola a organizar o presente e preparar-se para o futuro.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={() => router.push("/registar-escola")}
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-lg"
            >
              Solicitar Demonstração
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-900 transition-all"
            >
              Criar Conta Gratuita
            </button>
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--landing-text-dark-secondary)]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Dados encriptados e seguros
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-emerald-500" />
              Configuração em dias
            </div>
            <div className="flex items-center gap-1.5">
              <Headphones size={14} className="text-emerald-500" />
              Suporte dedicado
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
