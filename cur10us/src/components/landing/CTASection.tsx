"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export default function CTASection() {
  return (
    <section className="section-padding px-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-warm-950 to-warm-950" />
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-growth-500/8 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-sun-500/8 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-warm-900 to-warm-950 p-10 sm:p-14 text-center overflow-hidden border border-white/10"
        >
          <div className="absolute inset-0">
            <div className="absolute top-[-50%] left-[-20%] w-[400px] h-[400px] rounded-full bg-growth-500/10 blur-3xl" />
            <div className="absolute bottom-[-50%] right-[-20%] w-[400px] h-[400px] rounded-full bg-sun-400/10 blur-3xl" />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-sm font-medium text-sun-400 bg-sun-500/10 px-4 py-1.5 mb-6 border border-sun-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Comece hoje mesmo
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white tracking-tight leading-tight"
            >
              Pronto para fazer parte
              <br />
              do futuro da educação?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-warm-400 mb-8 max-w-md mx-auto text-base leading-relaxed"
            >
              Registe a sua escola e comece a transformar a gestão académica com a plataforma mais moderna de Angola.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex gap-3 flex-wrap justify-center"
            >
              <Link
                href="/signin"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-growth-600 text-white font-bold hover:bg-growth-700 shadow-xl shadow-growth-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Entrar na plataforma
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                href="/registar-escola"
                className="px-7 py-3.5 border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-bold hover:scale-[1.02] active:scale-[0.98]"
              >
                Registar escola
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
