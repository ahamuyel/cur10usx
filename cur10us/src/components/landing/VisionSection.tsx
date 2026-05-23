"use client"

import { Globe, Rocket, Heart, Quote } from "lucide-react"
import { motion } from "framer-motion"
import AnimateOnScroll from "./AnimateOnScroll"

const values = [
  {
    icon: Rocket,
    title: "Inovação",
    description: "Tecnologia de ponta para transformar a educação em África.",
    bg: "bg-growth-100/10",
    iconColor: "text-growth-400",
  },
  {
    icon: Globe,
    title: "Impacto continental",
    description: "Construir o maior ecossistema académico africano.",
    bg: "bg-sun-100/10",
    iconColor: "text-sun-400",
  },
  {
    icon: Heart,
    title: "Educação para todos",
    description: "Democratizar o acesso à educação de qualidade no continente.",
    bg: "bg-growth-100/10",
    iconColor: "text-growth-400",
  },
]

export default function VisionSection() {
  return (
    <section id="visao" className="section-padding px-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-warm-950 to-warm-950" />
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-growth-500/8 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-sun-500/8 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-sun-400 bg-sun-500/10 px-4 py-1.5 border border-sun-500/20 mb-5">
              <Quote className="w-4 h-4" />
              A nossa visão
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Construir o futuro da
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sun-400 to-growth-400">
                educação africana
              </span>
            </h2>
            <p className="text-base text-warm-400 max-w-2xl mx-auto mt-4 leading-relaxed">
              O Cur10usX nasceu em Angola com a missão de levar tecnologia de gestão escolar a todas as escolas
              africanas. Acreditamos que uma educação bem organizada é a base para formar a próxima geração de líderes.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
          {values.map((value) => {
            const Icon = value.icon
            return (
              <AnimateOnScroll key={value.title} delay={80}>
                <div className="group text-center p-6 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500">
                  <div className={`w-12 h-12 ${value.bg} border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className={`w-5 h-5 ${value.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-warm-400 leading-relaxed">{value.description}</p>
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>

        <AnimateOnScroll>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-warm-800/20 via-warm-900/20 to-warm-800/20 border border-white/10 p-10 md:p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0">
              <div className="absolute top-[-30%] left-[-10%] w-[300px] h-[300px] rounded-full bg-growth-500/10 blur-[80px]" />
              <div className="absolute bottom-[-30%] right-[-10%] w-[300px] h-[300px] rounded-full bg-sun-500/10 blur-[80px]" />
            </div>
            <div className="relative z-10">
              <Quote className="w-8 h-8 text-sun-400/50 mx-auto mb-5" />
              <blockquote className="text-xl md:text-2xl font-medium text-white leading-relaxed max-w-3xl mx-auto">
                &ldquo;A educação não é apenas transmitir conhecimento — é criar as condições para que cada jovem
                africano descubra o seu potencial e transforme o seu futuro.&rdquo;
              </blockquote>
              <div className="mt-7 flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-growth-500 to-growth-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xs">CX</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white">Equipa Cur10usX</div>
                  <div className="text-xs text-warm-500">Luanda, Angola</div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
