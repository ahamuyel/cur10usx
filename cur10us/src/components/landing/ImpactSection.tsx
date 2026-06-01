"use client"

import { motion } from "framer-motion";
import { Users, School, Quote, Globe, Building2 } from "lucide-react";

export default function ImpactSection() {
  const impacts = [
    {
      id: "estudantes",
      icon: Users,
      borderHover: "hover:border-primary-brand/50",
      iconBg: "bg-amber-100 text-primary-brand",
      title: "Estudantes",
      description: "Mais autonomia, motivação e clareza sobre o futuro profissional e acadêmico.",
    },
    {
      id: "escolas",
      icon: School,
      borderHover: "hover:border-emerald-700/50",
      iconBg: "bg-emerald-100 text-emerald-800",
      title: "Escolas",
      description: "Gestão eficiente, engajamento e visão real em tempo real do desenvolvimento dos alunos.",
    },
    {
      id: "sociedade",
      icon: Globe,
      borderHover: "hover:border-indigo-500/50",
      iconBg: "bg-indigo-100 text-indigo-700",
      title: "Sociedade",
      description: "Jovens mais preparados e equipados com habilidades reais, gerando oportunidades para todos.",
    },
    {
      id: "mercado",
      icon: Building2,
      borderHover: "hover:border-primary-brand/50",
      iconBg: "bg-amber-100 text-primary-brand",
      title: "Mercado",
      description: "Canal facilitador de talentos qualificados de alto potencial, prontos para atuar e transformar.",
    },
  ];

  return (
    <section id="impacto" className="relative overflow-hidden bg-white py-20 lg:py-28 border-b border-muted-brand/30">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <span className="font-sans text-xs font-extrabold tracking-widest text-primary-brand uppercase">
            Impacto Real
          </span>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-fg-brand sm:text-4xl">
            Transformamos estudantes. Impulsionamos o futuro.
          </h2>
          <p className="mt-4 font-sans text-base text-fg-brand/60 leading-relaxed">
            Ligamos os pontos do ecossistema educacional de Angola e de toda a África, criando impacto mensurável para todos os envolvidos.
          </p>
          <div className="mt-5 h-1 w-12 bg-primary-brand mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {impacts.map((imp, idx) => {
            const Icon = imp.icon;
            return (
              <motion.div
                key={imp.id}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`rounded-2xl border border-muted-brand/50 p-6 bg-bg-brand/20 transition-all duration-300 ${imp.borderHover} hover:bg-white hover:shadow-lg hover:translate-y-[-4px]`}
                id={`impact-card-${imp.id}`}
              >
                <div className="flex gap-4 items-start">
                  <div className={`p-2.5 rounded-xl ${imp.iconBg} shrink-0`}>
                    <Icon className="h-5 w-5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-fg-brand mb-1.5">
                      {imp.title}
                    </h3>
                    <p className="font-sans text-xs text-fg-brand/70 leading-relaxed">
                      {imp.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-20 rounded-3xl bg-secondary-brand text-white p-8 lg:p-12 relative overflow-hidden" id="impact-quote-banner">
          <div className="absolute -right-10 -bottom-10 h-72 w-72 rounded-full bg-white/5 blur-xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8">
              <Quote className="h-10 w-10 text-amber-400 opacity-60 mb-4 stroke-[1.5]" />
              <blockquote className="font-display text-xl sm:text-2xl font-semibold leading-relaxed tracking-tight text-white">
                &ldquo;Cur10usX não é apenas uma plataforma de gestão escolar. É um ecossistema gamificado de crescimento estudantil que acompanha os alunos desde a entrada na escola até o mercado de trabalho.&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-400 text-secondary-brand font-display font-extrabold flex items-center justify-center text-sm">
                  CX
                </div>
                <div>
                  <p className="font-sans text-sm font-bold text-white">Equipa de Fundadores Cur10usX</p>
                  <p className="font-sans text-xs text-amber-400">Pioneiros EdTech &bull; Angola</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 border-l lg:border-l border-t lg:border-t-0 border-white/20 pt-8 lg:pt-0 lg:pl-10 space-y-6">
              <div>
                <p className="font-display text-4xl font-extrabold text-amber-400 tracking-tight">MVP</p>
                <p className="font-sans text-xs text-white/70 uppercase tracking-widest mt-1">Status do Desenvolvimento</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-display text-2xl font-black text-white">100%</p>
                  <p className="font-sans text-[10px] text-white/60">Foco em África</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-black text-white">6 etapas</p>
                  <p className="font-sans text-[10px] text-white/60">De Jornada Integrada</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
