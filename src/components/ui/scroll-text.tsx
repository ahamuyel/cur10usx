"use client"

import React, { useRef, type ReactNode } from "react"
import { motion, useInView, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

interface ScrollTextProps {
  text: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
  className?: string
  accentLastLine?: boolean
  delay?: number
  immediate?: boolean
}

/**
 * Adapted from UI Layouts `scroll-text` / `text-animation`
 * (https://www.ui-layouts.com/components/scroll-text).
 * Observes the outer heading container so masked inner words always reveal reliably on scroll.
 */
export function ScrollText({
  text,
  as = "h2",
  className,
  accentLastLine = false,
  delay = 0,
  immediate = false,
}: ScrollTextProps) {
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.15 })
  const visible = immediate || isInView
  const lines = text.split("\n")

  const Tag = as

  if (prefersReducedMotion) {
    return (
      <Tag className={className}>
        {lines.map((line, lineIdx) => (
          <span
            key={lineIdx}
            className={cn(
              "block",
              accentLastLine && lineIdx === lines.length - 1 && "text-[var(--landing-accent)]"
            )}
          >
            {line}
          </span>
        ))}
      </Tag>
    )
  }

  let wordCounter = 0

  return (
    <div ref={containerRef}>
      <Tag className={className}>
        {lines.map((line, lineIdx) => {
          const words = line.trim().split(/\s+/)
          const isAccent = accentLastLine && lineIdx === lines.length - 1
          return (
            <span
              key={lineIdx}
              className={cn("block", isAccent && "text-[var(--landing-accent)]")}
            >
              {words.map((word, wIdx) => {
                const idx = wordCounter++
                const itemDelay = delay + idx * 0.04
                return (
                  <span
                    key={`${lineIdx}-${wIdx}`}
                    className="inline-block overflow-hidden align-bottom py-[0.05em]"
                  >
                    <motion.span
                      className="inline-block"
                      initial={{ y: "100%", opacity: 0, filter: "blur(5px)" }}
                      animate={
                        visible
                          ? { y: "0%", opacity: 1, filter: "blur(0px)" }
                          : { y: "100%", opacity: 0, filter: "blur(5px)" }
                      }
                      transition={{
                        duration: 0.52,
                        delay: itemDelay,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {word}
                    </motion.span>
                    {wIdx < words.length - 1 ? "\u00A0" : ""}
                  </span>
                )
              })}
            </span>
          )
        })}
      </Tag>
    </div>
  )
}

export function MotionReveal({
  children,
  className,
  delay = 0,
  y = 24,
  immediate = false,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  immediate?: boolean
}) {
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.12 })
  const visible = immediate || isInView

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, filter: "blur(4px)" }}
      animate={
        visible
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y, filter: "blur(4px)" }
      }
      transition={{
        duration: 0.55,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
