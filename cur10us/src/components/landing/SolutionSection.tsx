"use client"

import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Trophy,
  Users,
  ShoppingBag,
  Award,
  Briefcase,
  CheckCircle2,
  BookOpen,
  Headphones
} from "lucide-react";

export default function SolutionSection() {
  const features = [
    {
      id: "acompanhamento",
      title: "Acompanhamento inteligente",
      description: "Dados académicos transformados em insights claros sobre evolução, pontos fortes e melhorias.",
      badge: "Inteligência Artificial",
      bgStyle: "bg-white",
      visual: (
        <div className="mt-4 flex flex-col gap-2.5 bg-bg-brand p-3.5 rounded-xl border border-muted-brand/30">
          <div className="flex justify-between items-center text-[10px] font-bold text-fg-brand/50 uppercase">
            <span>Visão Acadêmica</span>
            <span className="text-emerald-800">Ativo</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-fg-brand">Ciências & Matemática</span>
              <span className="text-xs font-black text-emerald-800">89%</span>
            </div>
            <div className="h-2 w-full bg-white rounded-full overflow-hidden">
              <div className="h-full bg-emerald-800 rounded-full" style={{ width: "89%" }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-fg-brand">Artes & Humanas</span>
              <span className="text-xs font-black text-primary-brand">72%</span>
            </div>
            <div className="h-2 w-full bg-white rounded-full overflow-hidden">
              <div className="h-full bg-primary-brand rounded-full" style={{ width: "72%" }} />
            </div>
          </div>
        </div>
      )
    },
    {
      id: "gamificacao",
      title: "Gamificação",
      description: "Desafios, missões e recompensas que tornam o aprendizado mais motivador e envolvente.",
      badge: "Diversão",
      bgStyle: "bg-white",
      visual: (
        <div className="mt-4 flex justify-around items-center bg-bg-brand p-3 rounded-xl border border-muted-brand/30">
          <div className="flex flex-col items-center">
            <div className="h-9 w-9 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-lg shadow-sm">
              <Trophy className="h-5 w-5 stroke-[2] fill-yellow-100" />
            </div>
            <span className="text-[9.5px] font-bold text-fg-brand/60 mt-1.5">Rank Gold</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-9 w-9 rounded-full bg-amber-100 text-primary-brand flex items-center justify-center text-lg shadow-sm">
              <Sparkles className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[9.5px] font-bold text-fg-brand/60 mt-1.5">Streak 12d</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-9 w-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-lg shadow-sm">
              <Award className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[9.5px] font-bold text-fg-brand/60 mt-1.5">+500 XP</span>
          </div>
        </div>
      )
    },
    {
      id: "comunidades",
      title: "Comunidades",
      description: "Conecte-se com colegas, participe de grupos de estudo e aprenda em rede.",
      badge: "Social",
      bgStyle: "bg-white",
      visual: (
        <div className="mt-4 flex items-center gap-3 bg-bg-brand p-3.5 rounded-xl border border-muted-brand/30">
          <div className="flex -space-x-2">
            <img className="h-7 w-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=128" alt="Membro" referrerPolicy="no-referrer" />
            <img className="h-7 w-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=128" alt="Membro" referrerPolicy="no-referrer" />
            <img className="h-7 w-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=128" alt="Membro" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-1">
            <p className="font-sans text-[11px] font-semibold text-fg-brand leading-none">Grupo de Estudo IA</p>
            <p className="font-sans text-[9px] text-fg-brand/50 mt-1">12 membros online agora</p>
          </div>
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-emerald-800">+99</span>
        </div>
      )
    },
    {
      id: "marketplace",
      title: "Marketplace",
      description: "Acesse materiais, cursos, mentorias e serviços que impulsionam o seu crescimento.",
      badge: "Apoio",
      bgStyle: "bg-white",
      visual: (
        <div className="mt-4 flex gap-2 justify-between bg-bg-brand p-3.5 rounded-xl border border-muted-brand/30">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white rounded-lg border border-muted-brand/30 flex-1 justify-center">
            <ShoppingBag className="h-4 w-4 text-primary-brand" />
            <span className="text-[10px] font-bold text-fg-brand/70">Sacola</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white rounded-lg border border-muted-brand/30 flex-1 justify-center">
            <BookOpen className="h-4 w-4 text-emerald-800" />
            <span className="text-[10px] font-bold text-fg-brand/70">Livros</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white rounded-lg border border-muted-brand/30 flex-1 justify-center">
            <Headphones className="h-4 w-4 text-indigo-500" />
            <span className="text-[10px] font-bold text-fg-brand/70">Aulas</span>
          </div>
        </div>
      )
    },
    {
      id: "competicoes",
      title: "Competições",
      description: "Participe de olimpíadas, desafios e torneios académicos e conquiste reconhecimento.",
      badge: "Desafios",
      bgStyle: "bg-white",
      visual: (
        <div className="mt-4 flex justify-center items-center gap-4 bg-bg-brand p-3 rounded-xl border border-muted-brand/30">
          <div className="flex flex-col items-center text-center">
            <span className="text-lg">🥈</span>
            <span className="text-[9px] font-bold text-fg-brand/60 block mt-1">2º Lugar</span>
          </div>
          <div className="flex flex-col items-center text-center transform -translate-y-1">
            <span className="text-2xl">🥇</span>
            <span className="text-[10px] font-extrabold text-primary-brand block mt-1">Vencedor</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-lg">🥉</span>
            <span className="text-[9px] font-bold text-fg-brand/60 block mt-1">3º Lugar</span>
          </div>
        </div>
      )
    },
    {
      id: "carreira",
      title: "Carreira e oportunidades",
      description: "Descubra oportunidades, estágios, bolsas e caminhos alinhados ao seu perfil.",
      badge: "Futuro",
      bgStyle: "bg-white",
      visual: (
        <div className="mt-4 flex items-center justify-between bg-bg-brand p-3.5 rounded-xl border border-muted-brand/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 rounded-lg text-primary-brand">
              <Briefcase className="h-4 w-4 fill-primary-brand/10" />
            </div>
            <div>
              <p className="font-sans text-[11.5px] font-bold text-fg-brand leading-none">Estágio TI Júnior</p>
              <p className="font-sans text-[9px] text-fg-brand/50 mt-1">Parceiro Oficial Telecom</p>
            </div>
          </div>
          <div className="text-right">
            <span className="bg-emerald-100 text-emerald-800 text-[8.5px] font-black px-1.5 py-0.5 rounded-full uppercase">
              Aplicável
            </span>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="funcionalidades" className="relative overflow-hidden bg-bg-brand py-20 lg:py-28 border-b border-muted-brand/30">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="absolute top-0 right-0 h-[600px] w-auto text-secondary-brand/20" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
          <path d="M 100,0 C 70,30 30,50 0,100" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">

          <div className="lg:col-span-4 lg:sticky lg:top-28 flex flex-col justify-start">
            <span className="font-sans text-xs font-extrabold tracking-widest text-secondary-brand uppercase">
              A Solução
            </span>
            <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-fg-brand sm:text-4xl leading-tight">
              Uma plataforma completa para uma jornada completa
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-fg-brand/75">
              Cur10usX é um ecossistema inteligente que conecta aprendizado, desenvolvimento pessoal e oportunidades em um só lugar.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {[
                "Portefólio estudantil vitalício",
                "Certificação de competências no perfil",
                "Recomendações inteligentes automáticas"
              ].map((benefit, bIdx) => (
                <div key={bIdx} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary-brand shrink-0" />
                  <span className="font-sans text-sm font-semibold text-fg-brand/85">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <motion.a
                href="#criar-conta"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary-brand px-6 py-3.5 font-sans text-sm font-bold text-white shadow-md hover:bg-secondary-brand/90 transition-all cursor-pointer group"
              >
                <span>Conhecer funcionalidades</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feat, fIdx) => (
                <motion.div
                  key={feat.id}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: fIdx * 0.08 }}
                  className={`${feat.bgStyle} relative rounded-2xl border border-muted-brand/60 p-5 shadow-sm hover:shadow-lg hover:border-transparent transition-all duration-300 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="rounded-full bg-muted-brand/50 px-2 py-0.5 text-[9.5px] font-bold text-fg-brand/70 uppercase">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-extrabold text-fg-brand mb-1">
                      {feat.title}
                    </h3>
                    <p className="font-sans text-xs text-fg-brand/60 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  {feat.visual}
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
