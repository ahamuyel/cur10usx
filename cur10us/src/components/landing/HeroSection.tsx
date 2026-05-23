"use client"

import Link from "next/link"
import { GraduationCap, Users, BarChart3, ArrowRight } from "lucide-react"
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
        <div className="absolute inset-0 bg-gradient-to-br from-warm-950 via-warm-900 to-warm-950 dark:from-warm-950 dark:via-warm-900 dark:to-warm-950 transition-opacity duration-700" />
        <div className="absolute top-[-15%] left-[-8%] w-[700px] h-[700px] rounded-full bg-warm-500/15 dark:bg-warm-500/10 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-8%] w-[600px] h-[600px] rounded-full bg-warm-400/10 dark:bg-warm-400/8 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <motion.span
              variants={item}
              className="inline-flex items-center gap-2 text-sm font-medium text-warm-300 bg-warm-500/10 px-4 py-1.5 rounded-full border border-warm-500/20 w-fit"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-warm-400 animate-pulse" />
              Plataforma de gestão escolar
            </motion.span>

            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[0.92] text-white"
            >
              A educação
              <br />
              <span className="text-white">
                africana
              </span>
              <br />
              do futuro
            </motion.h1>

            <motion.p
              variants={item}
              className="text-base sm:text-lg text-warm-400 dark:text-warm-400 max-w-lg leading-relaxed"
            >
              Centraliza a gestão de alunos, professores, notas e comunicação
              numa plataforma moderna, pensada para Angola.
            </motion.p>

            <motion.div variants={item} className="flex gap-3 flex-wrap pt-2">
              <Link
                href="/signin"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-warm-200 text-warm-950 font-bold hover:bg-warm-300 shadow-xl shadow-black/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Começar agora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                href="/registar-escola"
                className="px-7 py-3.5 rounded-xl border border-warm-700 text-warm-300 hover:bg-white/5 hover:border-warm-500 transition-all duration-300 font-semibold hover:scale-[1.02] active:scale-[0.98]"
              >
                Registar escola
              </Link>
            </motion.div>

            {schools.length > 0 && (
              <motion.div variants={item} className="flex items-center gap-4 pt-1">
                <div className="flex -space-x-2">
                  {schools.slice(0, 4).map((school, i) => {
                    const colors = ["bg-warm-500", "bg-warm-400", "bg-warm-600", "bg-warm-300"]
                    const initials = school.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                    return (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full ${colors[i]} border-2 border-warm-950 flex items-center justify-center`}
                      >
                        <span className="text-[10px] font-bold text-white">{initials}</span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-sm text-warm-500 dark:text-warm-500">
                  Escolas em Angola já utilizam o{" "}
                  <span className="font-semibold text-warm-200 dark:text-warm-200">{branding.name}</span>
                </p>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="rounded-2xl border border-white/10 dark:border-white/10 bg-white/[0.05] dark:bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/40 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-warm-500 to-warm-700 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Dashboard Escolar</div>
                      <div className="text-[11px] text-warm-400">Visão geral</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warm-400/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warm-300/50" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: "Alunos", value: "1.247", icon: Users, bg: "bg-warm-500" },
                    { label: "Professores", value: "86", icon: GraduationCap, bg: "bg-warm-400" },
                    { label: "Turmas", value: "42", icon: BarChart3, bg: "bg-warm-500" },
                  ].map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div key={stat.label} className="rounded-lg bg-white/[0.05] dark:bg-white/[0.04] p-3 space-y-1.5 border border-white/10 dark:border-white/5">
                        <div className={`w-6 h-6 rounded-md ${stat.bg} flex items-center justify-center`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <div className="text-base font-bold text-white">{stat.value}</div>
                        <div className="text-[10px] text-warm-400">{stat.label}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="rounded-lg bg-white/[0.05] dark:bg-white/[0.04] p-3.5 border border-white/10 dark:border-white/5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-medium text-warm-400">Desempenho mensal</span>
                    <BarChart3 className="w-3.5 h-3.5 text-warm-500" />
                  </div>
                  <div className="flex items-end gap-1.5 h-16">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-warm-500/70 to-warm-300/70"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ x: [0, 6, 0], y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-4 -left-5 rounded-xl border border-white/10 bg-white/[0.08] dark:bg-white/[0.06] backdrop-blur-xl shadow-xl p-3.5 flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-warm-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Notas lançadas</div>
                  <div className="text-[10px] text-warm-400">Turma 10A — Matemática</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ x: [0, -5, 0], y: [0, 4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-3 -right-4 rounded-xl border border-white/10 bg-white/[0.08] dark:bg-white/[0.06] backdrop-blur-xl shadow-xl p-3.5 flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-warm-400/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-warm-300" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">+12 alunos</div>
                  <div className="text-[10px] text-warm-400">Matriculados hoje</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
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
          <div className="w-4 h-7 rounded-full border border-warm-600 flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1 rounded-full bg-warm-400"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
