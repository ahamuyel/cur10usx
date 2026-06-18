"use client"

import { motion } from "framer-motion"

export default function HeroBackgroundPaths() {
  // Gerar nós fixos em vez de Math.random puro para evitar incompatibilidade de hidratação (SSR)
  const nodes = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 7) % 100, // posições em %
    y: (i * 13) % 100,
    id: `hero-node-${i}`
  }))

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none text-violet-500/20 dark:text-violet-400/10">
      <svg className="absolute inset-0 w-full h-full" width="100%" height="100%">
        {/* Linhas de Fluxo Horizontais Suaves */}
        <motion.path
          d="M-20,50 Q25,20 50,60 T120,40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 0], opacity: [0, 0.5, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M-20,30 Q30,70 65,20 T120,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 0], opacity: [0, 0.3, 0] }}
          transition={{ duration: 16, delay: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Pequenos pontos brilhantes simulando a rede */}
        {nodes.map((node, i) => (
          <motion.circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="1.5"
            fill="currentColor"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.4, 0.8],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
    </div>
  )
}