"use client"

import { motion } from "framer-motion";
import { Compass, BarChart3, User, Link2 } from "lucide-react";

export default function ProblemSection() {
  const problems = [
    {
      id: "direcao",
      icon: Compass,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      title: "Falta de direção",
      description: "Muitos estudantes estudam sem clareza sobre seus objetivos e caminhos possíveis.",
    },
    {
      id: "acompanhamento",
      icon: BarChart3,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
      title: "Acompanhamento limitado",
      description: "Escolas monitoram notas, mas não o crescimento real do estudante.",
    },
    {
      id: "aprendizado",
      icon: User,
      iconColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
      title: "Aprendizado genérico",
      description: "Cada aluno aprende de um jeito, mas o sistema não se adapta às suas necessidades.",
    },
    {
      id: "desconexao",
      icon: Link2,
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-50",
      title: "Desconexão com o mercado",
      description: "Pouca conexão entre o que se aprende na escola e o que o mundo profissional exige.",
    },
  ];

  return (
    <section id="sobre" className="relative overflow-hidden bg-white py-20 lg:py-28 border-b border-muted-brand/30">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <span className="font-sans text-xs font-extrabold tracking-widest text-primary-brand uppercase">
            O Problema
          </span>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-fg-brand sm:text-4xl">
            Educação ainda é desconectada do futuro
          </h2>
          <div className="mt-4 h-1 w-12 bg-primary-brand mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <motion.div
                key={prob.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative rounded-2xl border border-muted-brand/40 bg-bg-brand/40 p-6 transition-all duration-300 hover:bg-white hover:shadow-xl hover:border-transparent flex flex-col justify-between"
                id={`problem-card-${prob.id}`}
              >
                <div>
                  <div className={`p-3 rounded-xl ${prob.bgColor} ${prob.iconColor} w-12 h-12 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 stroke-[2]" />
                  </div>

                  <h3 className="font-display text-lg font-bold text-fg-brand mb-3 group-hover:text-primary-brand transition-colors">
                    {prob.title}
                  </h3>
                  <p className="font-sans text-sm text-fg-brand/70 leading-relaxed">
                    {prob.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-muted-brand/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs font-bold text-primary-brand inline-flex items-center gap-1">
                    Como a Cur10usX resolve? <span className="translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center max-w-xl mx-auto"
        >
          <p className="font-sans text-sm italic text-fg-brand/50">
            &ldquo;Sem clareza de onde as habilidades se conectam às carreiras, alunos prosseguem seus estudos com baixa motivação acadêmica.&rdquo;
          </p>
        </motion.div>

      </div>
    </section>
  );
}
