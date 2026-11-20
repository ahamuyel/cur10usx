"use client"

import { motion } from "framer-motion"

export default function DashboardHeroBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      {/* Light-mode base gradient */}
      <div className="absolute inset-0 dark:hidden bg-gradient-to-br from-violet-50/60 via-transparent to-amber-50/40" />

      {/* Dark-mode base gradient */}
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-violet-950/20 via-transparent to-amber-950/10" />

      {/* Glowing orbs */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20 mix-blend-screen">
        <motion.div
          animate={{
            scale: [1, 1.15, 0.95, 1],
            x: [0, 20, -15, 0],
            y: [0, -25, 15, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -left-16 w-[350px] h-[350px] rounded-full bg-gradient-to-br from-violet-300/20 via-indigo-200/10 to-transparent dark:from-violet-600/15 dark:via-indigo-500/5 dark:to-transparent"
        />
        <motion.div
          animate={{
            scale: [1, 0.9, 1.1, 1],
            x: [0, -25, 20, 0],
            y: [0, 20, -20, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-32 -right-16 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-amber-300/15 via-orange-200/5 to-transparent dark:from-amber-600/10 dark:via-orange-500/5 dark:to-transparent"
        />
      </div>

      {/* Subtle top-right highlight */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-violet-400/10 to-transparent dark:from-violet-500/5 blur-3xl"
      />

      {/* Textured overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.008] dark:opacity-[0.012] pointer-events-none" />
    </div>
  )
}
