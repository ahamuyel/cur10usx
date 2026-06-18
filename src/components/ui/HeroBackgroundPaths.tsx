"use client"

import { motion } from "framer-motion"

export default function HeroBackgroundPaths() {
  // Nós estáticos calculados matematicamente para evitar quebra de SSR
  const nodes = Array.from({ length: 15 }, (_, i) => ({
    x: (i * 9) % 100, 
    y: (i * 17) % 100,
    r: (i % 2 === 0) ? 1.5 : 2.5,
    id: `constellation-node-${i}`
  }))

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none bg-zinc-950">
      
      {/* 1. AURORAS FLUIDAS (Efeito de Profundidade Orgânica) */}
      <div className="absolute inset-0 opacity-30 mix-blend-screen filter blur-[60px]">
        <motion.div 
          animate={{
            scale: [1, 1.2, 0.9, 1],
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-20 w-[450px] h-[450px] rounded-full bg-radial from-violet-600/30 via-indigo-500/10 to-transparent"
        />
        <motion.div 
          animate={{
            scale: [1, 0.8, 1.1, 1],
            x: [0, -30, 40, 0],
            y: [0, 30, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-45 -right-20 w-[500px] h-[500px] rounded-full bg-radial from-fuchsia-600/20 via-violet-500/5 to-transparent"
        />
      </div>

      {/* 2. LINHAS VECTORIAIS CINÉTICAS (SVG Premium) */}
      <svg className="absolute inset-0 w-full h-full" width="100%" height="100%">
        <defs>
          {/* Gradiente Linear para as Linhas de Fluxo */}
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          
          {/* Gradiente para os Feixes de Pulso */}
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d946ef" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Linha de Fluxo Complexa 1 (Onda Harmónica) */}
        <motion.path
          d="M-50,80 C 150,20 250,120 450,50 C 650,-20 850,90 1150,30 C 1350,-20 1450,70 1650,40"
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />

        {/* Feixe Laser Perseguidor (Animação de Pulso Cortando a Onda) */}
        <motion.path
          d="M-50,80 C 150,20 250,120 450,50 C 650,-20 850,90 1150,30 C 1350,-20 1450,70 1650,40"
          fill="none"
          stroke="url(#pulseGrad)"
          strokeWidth="2.5"
          strokeDasharray="100 800"
          animate={{ strokeDashoffset: [-900, 900] }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        />

        {/* Linha Subtil Secundária (Contrapeso) */}
        <motion.path
          d="M-50,20 C 300,110 600,-30 900,70 C 1200,140 1400,10 1650,50"
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="1"
          opacity="0.5"
          animate={{
            d: [
              "M-50,20 C 300,110 600,-30 900,70 C 1200,140 1400,10 1650,50",
              "M-50,40 C 350,70 550,10 950,50 C 1150,110 1450,-10 1650,30",
              "M-50,20 C 300,110 600,-30 900,70 C 1200,140 1400,10 1650,50"
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* 3. CONSTELAÇÃO DIGITAL (Nós Quânticos) */}
        {nodes.map((node, i) => (
          <g key={node.id}>
            {/* Brilho externo (Aura do ponto) */}
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.r * 2.5}
              fill="#8b5cf6"
              opacity="0.1"
              animate={{ scale: [1, 1.8, 1] }}
              transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
            />
            {/* Ponto central rígido */}
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.r}
              fill={i % 3 === 0 ? "#d946ef" : "#a78bfa"}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2 + (i % 2), repeat: Infinity, delay: i * 0.15 }}
            />
          </g>
        ))}
      </svg>
      
      {/* Overlay de grão discreto para textura premium */}
      <div className="absolute inset-0 bg-noise opacity-[0.015] pointer-events-none" />
    </div>
  )
}