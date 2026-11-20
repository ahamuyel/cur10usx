"use client"

import { type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type TimelineRevealProps = {
  children: ReactNode
  index?: number
  className?: string
}

/**
 * Adapted from UI Layouts Timeline Animation pattern.
 * Subtle entrance reveal with built-in prefers-reduced-motion support.
 */
export function TimelineReveal({
  children,
  index = 0,
  className,
}: TimelineRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.06, 0.24),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
