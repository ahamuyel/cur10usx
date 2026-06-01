"use client"

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, MessageCircle } from "lucide-react";

export default function CTASection() {
  return (
    <section id="para-escolas" className="relative overflow-hidden bg-bg-brand py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="relative rounded-3xl overflow-hidden py-24 px-8 lg:p-20 text-center shadow-2xl border border-muted-brand/40" id="final-cta-container">

          <div className="absolute inset-0 z-0">
            <img
              src="/images/cta_sunset.png"
              alt="Estudantes olhando para o pôr do sol"
              className="w-full h-full object-cover select-none pointer-events-none filter scale-[1.05]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30 z-10" />
            <div className="absolute inset-0 bg-secondary-brand/10 mix-blend-overlay z-10" />

            <svg className="absolute inset-0 w-full h-full opacity-35 z-20 pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none">
              <circle cx="500" cy="800" r="400" stroke="#FAF8F5" strokeWidth="1" strokeDasharray="4,8" fill="none" />
              <circle cx="500" cy="800" r="550" stroke="#D97706" strokeWidth="1" strokeDasharray="8,12" fill="none" />
            </svg>
          </div>

          <div className="relative z-30 max-w-2xl mx-auto flex flex-col items-center">

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-amber-300 md:mb-8 mb-6"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>Crescimento que começa hoje</span>
            </motion.div>

            <h2 className="font-display text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-5xl leading-tight">
              O futuro não acontece por acaso. <br className="hidden sm:inline" />
              A gente constrói, <span className="text-primary-brand">juntos.</span>
            </h2>

            <p className="mt-6 font-sans text-sm sm:text-base leading-relaxed text-white/80 max-w-lg">
              Junte-se à Cur10usX e mude a forma como encaramos o percurso escolar. Seja como estudante individual, professor ou instituição ativa.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
              <motion.a
                href="#criar-conta"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-brand px-7 py-4 font-sans text-base font-bold text-white shadow-lg hover:bg-orange-600 transition-all cursor-pointer group"
              >
                <span>Criar conta gratuitamente</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>

              <motion.a
                href="#falar-equipa"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/5 backdrop-blur-sm px-7 py-4 font-sans text-sm font-bold text-white hover:bg-white/10 hover:border-white transition-all cursor-pointer group"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Falar com nossa equipa</span>
              </motion.a>
            </div>

            <div className="mt-8 text-white/50 text-[10.5px] font-medium tracking-wide">
              * MVP em fase de ensaio &bull; Acesso gratuito para as primeiras escolas parceiras
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
