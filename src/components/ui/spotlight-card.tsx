"use client"

import { useRef, useState, useCallback, type ReactNode } from "react"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type SpotlightCardProps = {
  children: ReactNode
  className?: string
}

/**
 * Adapted from UI Layouts Spotlight Card pattern.
 * Provides a subtle radial pointer-tracking highlight using semantic tokens,
 * automatically disabled when prefers-reduced-motion is enabled.
 */
export function SpotlightCard({ children, className }: SpotlightCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    },
    [prefersReducedMotion]
  )

  const handleMouseEnter = useCallback(() => {
    if (!prefersReducedMotion) setOpacity(1)
  }, [prefersReducedMotion])

  const handleMouseLeave = useCallback(() => {
    setOpacity(0)
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] transition-colors duration-300 hover:border-[var(--landing-border-strong)]",
        className
      )}
    >
      {!prefersReducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            opacity,
            background: `radial-gradient(360px circle at ${position.x}px ${position.y}px, var(--landing-spotlight), transparent 65%)`,
          }}
        />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
