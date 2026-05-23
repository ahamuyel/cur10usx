"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import type { PlatformBranding } from "@/types/landing"

type Props = {
  branding: PlatformBranding
  schools: { name: string }[]
}

const springEasing = [0.16, 1, 0.3, 1] as const

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: springEasing },
  },
}

export default function HeroSection({ branding, schools }: Props) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-warm-950 via-warm-900 to-warm-950" />
        <div className="absolute top-[-15%] left-[-8%] w-[700px] h-[700px] rounded-full bg-growth-500/12 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-8%] w-[600px] h-[600px] rounded-full bg-sun-400/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full bg-brand-500/8 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="w-full max-w-5xl mx-auto px-6 pt-32 pb-24">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 text-sm font-medium text-sun-400 bg-sun-500/10 px-4 py-1.5 border border-sun-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Plataforma de gestão escolar
          </motion.span>

          <motion.h1
            variants={item}
            className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[0.92] text-white"
          >
            A educação
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sun-300 via-sun-400 to-growth-400">
              africana
            </span>
            <br />
            do futuro
          </motion.h1>

          <motion.p
            variants={item}
            className="text-base sm:text-lg text-warm-400 max-w-lg leading-relaxed"
          >
            Centraliza a gestão de alunos, professores, notas e comunicação
            numa plataforma moderna, pensada para Angola e para África.
          </motion.p>

          <motion.div variants={item} className="flex gap-3 flex-wrap justify-center pt-2">
            <Link
              href="/signin"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-growth-600 text-white font-bold hover:bg-growth-700 shadow-xl shadow-growth-600/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Começar agora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link
              href="/registar-escola"
              className="px-7 py-3.5 border border-sun-500/40 text-sun-300 hover:bg-sun-500/10 hover:border-sun-400 transition-all duration-300 font-semibold hover:scale-[1.02] active:scale-[0.98]"
            >
              Registar escola
            </Link>
          </motion.div>

          {schools.length > 0 && (
            <motion.div variants={item} className="flex items-center gap-4 pt-1">
              <div className="flex -space-x-2">
                {schools.slice(0, 4).map((school, i) => {
                  const colors = ["bg-growth-500", "bg-sun-400", "bg-brand-500", "bg-growth-400"]
                  const initials = school.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                  return (
                    <div
                      key={i}
                      className={`w-8 h-8 ${colors[i]} border-2 border-warm-950 flex items-center justify-center`}
                    >
                      <span className="text-[10px] font-bold text-white">{initials}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-sm text-warm-500">
                Escolas em Angola já utilizam o{" "}
                <span className="font-semibold text-warm-200">{branding.name}</span>
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1.5 text-warm-500"
        >
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-4 h-7 border border-warm-600 flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1 bg-warm-400"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
