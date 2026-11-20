"use client"

import { motion, useReducedMotion } from "motion/react"

/**
 * Shared architectural grid + drifting primary-color ambient light aura
 * for Hero sections and closing CTA bands (Light & Dark Mode native, reduced-motion safe).
 */
export default function HeroBackdrop({
  intensity = "normal",
}: {
  intensity?: "normal" | "subtle"
}) {
  const prefersReducedMotion = useReducedMotion()
  const primaryOpacity = intensity === "normal" ? "opacity-80 dark:opacity-70" : "opacity-65 dark:opacity-55"

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* Masked architectural grid identical to the About page */}
      <div className="absolute inset-0 grid-bg opacity-70 [mask-image:radial-gradient(ellipse_62%_58%_at_50%_40%,#000_42%,transparent_100%)]" />

      {/* Drifting primary-color light orb #1 */}
      <motion.div
        className={`absolute -top-24 left-1/2 -translate-x-1/2 w-[min(620px,90vw)] h-[300px] rounded-full blur-[90px] ${primaryOpacity}`}
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--landing-accent) 28%, transparent) 0%, transparent 72%)",
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                x: ["-18%", "20%", "-10%", "-18%"],
                y: ["0%", "14%", "-6%", "0%"],
                scale: [1, 1.08, 0.96, 1],
              }
        }
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Counter-drifting secondary soft primary glow #2 */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[min(460px,80vw)] h-[240px] rounded-full blur-[100px] opacity-55 dark:opacity-45"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--landing-accent) 20%, transparent) 0%, transparent 72%)",
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                x: ["22%", "-22%", "12%", "22%"],
                y: ["8%", "-10%", "14%", "8%"],
              }
        }
        transition={{
          duration: 21,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
