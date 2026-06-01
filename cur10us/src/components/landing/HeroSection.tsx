"use client"

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight,
  Play,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Lightbulb,
  Briefcase,
  Flag,
  Trophy,
  CheckCircle,
  Sparkles
} from "lucide-react";

interface JourneyNode {
  id: string;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
  achievement: string;
  xp: number;
}

export default function HeroSection() {
  const [activeStep, setActiveStep] = useState<number>(2);

  const journeySteps: JourneyNode[] = [
    {
      id: "entrada",
      label: "Entrada na escola",
      icon: GraduationCap,
      color: "text-emerald-800",
      bgColor: "bg-emerald-100",
      description: "O primeiro passo do ciclo. Diagnóstico inicial de competências e interesses.",
      achievement: "Crachá de Pioneiro de Aprendizado",
      xp: 10
    },
    {
      id: "aprendizado",
      label: "Aprendizado",
      icon: BookOpen,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      description: "Acompanhamento acadêmico inteligente com trilhas focadas nas tuas forças.",
      achievement: "Maratona da Sabedoria nível 1",
      xp: 25
    },
    {
      id: "crescimento",
      label: "Crescimento",
      icon: TrendingUp,
      color: "text-emerald-700",
      bgColor: "bg-emerald-100/80",
      description: "Visualização diária do progresso, evolução de habilidades e conquista de pontos de XP.",
      achievement: "Inovador em Evolução Contínua (78%)",
      xp: 50
    },
    {
      id: "descoberta",
      label: "Descoberta",
      icon: Lightbulb,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      description: "Mentorias integradas e testes para encontrar os teus verdadeiros propósitos.",
      achievement: "Desbravador Vocacional",
      xp: 75
    },
    {
      id: "oportunidades",
      label: "Oportunidades",
      icon: Briefcase,
      color: "text-teal-800",
      bgColor: "bg-teal-100",
      description: "Acesso a estágios, bolsas de estudo regionais e parcerias estratégicas.",
      achievement: "Candidato de Alto Potencial",
      xp: 100
    },
    {
      id: "carreira",
      label: "Carreira",
      icon: Flag,
      color: "text-amber-700",
      bgColor: "bg-amber-100",
      description: "Conexão oficial com o mercado de trabalho africano com perfil profissional verificado.",
      achievement: "Líder do Futuro Cur10usX",
      xp: 150
    },
  ];

  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256"
  ];

  return (
    <section id="inicio" className="relative overflow-hidden bg-bg-brand py-16 lg:py-24">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-primary-brand/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-secondary-brand/10 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 relative">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

          <div className="lg:col-span-5 flex flex-col justify-center text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary-brand/20 bg-amber-50 px-3 py-1 text-sm font-semibold text-primary-brand mb-6 max-w-fit"
            >
              <Sparkles className="h-4 w-4 fill-primary-brand/20 animate-pulse" />
              <span>Plataforma Inteligente de Crescimento Estudantil</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-4xl font-extrabold tracking-tight text-fg-brand sm:text-5xl lg:text-5xl xl:text-6xl"
            >
              Cada estudante tem um futuro. <br className="hidden sm:inline" />
              <span className="text-primary-brand relative">
                A gente conecta.
                <svg className="absolute -bottom-2 left-0 w-full h-2 text-primary-brand/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-8 font-sans text-base leading-relaxed text-fg-brand/80 sm:text-lg"
            >
              Cur10usX acompanha toda a jornada estudantil — do primeiro dia de aula ao mercado de trabalho — com tecnologia, gamificação e propósito.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 sm:items-center"
            >
              <motion.a
                href="#criar-conta"
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-brand px-6 py-4 font-sans text-base font-bold text-white shadow-md hover:bg-primary-brand/90 transition-all cursor-pointer group"
              >
                <span>Comece agora</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a
                href="#sobre"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-muted-brand bg-white px-6 py-4 font-sans text-base font-bold text-fg-brand hover:border-fg-brand/40 hover:bg-bg-brand transition-all cursor-pointer group"
              >
                <span>Explorar plataforma</span>
                <Play className="h-4 w-4 fill-fg-brand/10 text-fg-brand" />
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-12 flex items-center gap-4 border-t border-muted-brand/60 pt-8"
            >
              <div className="flex -space-x-3">
                {avatars.map((ava, idx) => (
                  <img
                    key={idx}
                    className="h-10 w-10 rounded-full border-2 border-bg-brand object-cover"
                    src={ava}
                    alt={`Estudante Cur10usX ${idx + 2}`}
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <div>
                <p className="font-sans text-sm font-semibold text-fg-brand">
                  +5.000 estudantes
                </p>
                <p className="font-sans text-xs text-fg-brand/60">
                  já estão evoluindo com Cur10usX
                </p>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7 relative h-[560px] md:h-[650px] lg:h-[700px] w-full flex items-center justify-center" id="hero-interactive-map">

            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 700 700"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="gradient-path" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#14532D" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#D97706" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#D97706" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              <path
                d="M 50 560 Q 150 480 200 350 T 450 180 T 650 60"
                stroke="url(#gradient-path)"
                strokeWidth="3"
                strokeDasharray="8,8"
                fill="none"
              />
            </svg>

            <div className="absolute left-[8%] bottom-[12%] z-20">
              <JourneyNodeButton
                node={journeySteps[0]}
                index={0}
                isActive={activeStep === 0}
                onClick={() => setActiveStep(0)}
              />
            </div>

            <div className="absolute left-[30%] bottom-[32%] z-20">
              <JourneyNodeButton
                node={journeySteps[1]}
                index={1}
                isActive={activeStep === 1}
                onClick={() => setActiveStep(1)}
              />
            </div>

            <div className="absolute left-[54%] top-[34%] z-20">
              <JourneyNodeButton
                node={journeySteps[2]}
                index={2}
                isActive={activeStep === 2}
                onClick={() => setActiveStep(2)}
              />
            </div>

            <div className="absolute left-[70%] top-[18%] z-20">
              <JourneyNodeButton
                node={journeySteps[3]}
                index={3}
                isActive={activeStep === 3}
                onClick={() => setActiveStep(3)}
              />
            </div>

            <div className="absolute right-[18%] top-[10%] z-20">
              <JourneyNodeButton
                node={journeySteps[4]}
                index={4}
                isActive={activeStep === 4}
                onClick={() => setActiveStep(4)}
              />
            </div>

            <div className="absolute right-[4%] top-[1%] z-20">
              <JourneyNodeButton
                node={journeySteps[5]}
                index={5}
                isActive={activeStep === 5}
                onClick={() => setActiveStep(5)}
              />
            </div>

            <div className="relative z-10 w-[240px] h-[320px] md:w-[320px] md:h-[420px] rounded-full overflow-visible flex items-center justify-center">
              <div className="absolute inset-0 bg-secondary-brand/10 rounded-full filter blur-3xl translate-y-6" />
              <img
                src="/images/hero_student.png"
                alt="Cur10usX Student Hero"
                className="relative z-20 max-w-[110%] max-h-[110%] md:max-w-[125%] md:max-h-[125%] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.12)] bottom-[-20px]"
                referrerPolicy="no-referrer"
              />
            </div>

            <motion.div
              style={{ x: -60, y: 110 }}
              animate={{ y: [100, 108, 100] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute left-[10%] bottom-[12%] md:bottom-[15%] z-30 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-xl border border-muted-brand/60 w-[240px] hidden sm:block"
            >
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-amber-50 rounded-xl text-primary-brand text-lg">
                  <Trophy className="h-6 w-6 stroke-[2]" />
                </div>
                <div className="flex-1">
                  <span className="font-sans text-[10px] font-bold text-primary-brand uppercase tracking-wider block">Próximo desafio</span>
                  <h4 className="font-display text-sm font-extrabold text-fg-brand mt-0.5">Olimpíada de Matemática</h4>
                  <p className="font-sans text-[11.5px] text-fg-brand/60 mt-1 leading-tight">Participe e ganhe <strong className="text-secondary-brand">50 XP</strong></p>
                  <a href="#competicoes" className="font-sans text-[11px] font-bold text-primary-brand hover:underline inline-flex items-center gap-1 mt-2">
                    Inscrever-se <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              style={{ x: 60, y: -80 }}
              animate={{ y: [-85, -78, -85] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute right-[5%] top-[25%] md:top-[30%] z-30 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-xl border border-muted-brand/60 w-[170px] hidden sm:block"
            >
              <span className="font-sans text-[10px] font-bold text-fg-brand/60 uppercase tracking-wider block mb-2">Seu progresso</span>
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="23" stroke="#F3F4F6" strokeWidth="4" fill="transparent" />
                    <circle cx="28" cy="28" r="23" stroke="#D97706" strokeWidth="4" fill="transparent"
                      strokeDasharray="144" strokeDashoffset={144 * (1 - 0.78)} strokeLinecap="round" />
                  </svg>
                  <span className="absolute font-display text-xs font-black text-fg-brand">78%</span>
                </div>
                <div>
                  <p className="font-sans text-xs font-bold text-emerald-800">Excelente!</p>
                  <a href="#progresso" className="font-sans text-[10px] font-semibold text-primary-brand hover:underline inline-flex items-center mt-1">
                    Ver detalhes <ArrowRight className="h-2 w-2 ml-0.5" />
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              style={{ x: 100, y: 130 }}
              animate={{ y: [122, 128, 122] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}
              className="absolute right-[8%] bottom-[12%] md:bottom-[15%] z-30 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-xl border border-muted-brand/60 w-[240px] hidden md:block"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-sans text-[10.5px] font-bold text-fg-brand/70 uppercase tracking-wide">Habilidades em foco</span>
                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-primary-brand">Level: Pro</span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-fg-brand mb-1">
                    <span>Lógica</span>
                    <span className="font-semibold text-emerald-700">Avançado</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-700 rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-fg-brand mb-1">
                    <span>Comunicação</span>
                    <span className="font-semibold text-primary-brand">Intermediário</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-brand rounded-full" style={{ width: "60%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-fg-brand mb-1">
                    <span>Criatividade</span>
                    <span className="font-semibold text-gray-500">Desenvolvimento</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full" style={{ width: "40%" }} />
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-[-15px] left-1/2 transform -translate-x-1/2 w-[90%] sm:w-[420px] z-30">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-secondary-brand text-white rounded-2xl p-4 shadow-2xl border border-secondary-brand/20 flex gap-4 items-center"
                >
                  <div className={`p-3 rounded-xl bg-white/10 text-white`}>
                    {(() => {
                      const Icon = journeySteps[activeStep].icon;
                      return <Icon className="h-6 w-6 stroke-[2]" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-display font-black text-sm tracking-wide text-amber-400 uppercase">Jovens em Jornada • Passo {activeStep + 1}</span>
                      <span className="bg-amber-400 text-secondary-brand text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Trophy className="h-2.5 w-2.5 fill-current" /> +{journeySteps[activeStep].xp} XP
                      </span>
                    </div>
                    <h3 className="font-display text-base font-extrabold mt-0.5">{journeySteps[activeStep].label}</h3>
                    <p className="font-sans text-xs text-white/80 leading-relaxed mt-1">{journeySteps[activeStep].description}</p>
                    <div className="mt-2 text-[10px] font-medium text-amber-300 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 stroke-[2]" /> Conquista ativa: <span className="font-semibold">{journeySteps[activeStep].achievement}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

function JourneyNodeButton({
  node,
  index,
  isActive,
  onClick
}: {
  node: JourneyNode;
  index: number;
  isActive: boolean;
  onClick: () => void
}) {
  const Icon = node.icon;

  return (
    <button
      onClick={onClick}
      className="relative group focus:outline-none flex flex-col items-center cursor-pointer"
      id={`journey-node-${node.id}`}
    >
      {isActive && (
        <span className="absolute -inset-2 rounded-full bg-primary-brand/35 animate-ping opacity-75" />
      )}

      <div
        className={`relative h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${isActive
            ? "bg-primary-brand text-white scale-110 ring-4 ring-white/80"
            : "bg-white text-fg-brand/70 hover:text-primary-brand hover:scale-105"
          }`}
      >
        <Icon className="h-5 w-5 stroke-[2]" />
      </div>

      <span className={`absolute top-12 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded shadow-sm transition-all pointer-events-none ${isActive
          ? "bg-secondary-brand text-white opacity-100"
          : "bg-white text-fg-brand/80 opacity-0 group-hover:opacity-100"
        }`}>
        {node.label}
      </span>
    </button>
  );
}
