"use client"

import React, { forwardRef, useEffect, useId, useState, type RefObject } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export interface AnimatedBeamProps {
  className?: string
  containerRef: RefObject<HTMLElement | null>
  fromRef: RefObject<HTMLElement | null>
  toRef: RefObject<HTMLElement | null>
  curvature?: number
  reverse?: boolean
  duration?: number
  delay?: number
  pathOpacity?: number
  pathWidth?: number
  gradientStartColor?: string
  gradientStopColor?: string
}

/**
 * Adapted from UI Layouts `animated-beam` (https://www.ui-layouts.com/components/animated-beam).
 * Dynamically computes curved SVG paths between DOM nodes and pulses light along them,
 * respecting prefers-reduced-motion.
 */
export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 4.5,
  delay = 0,
  pathOpacity = 0.25,
  pathWidth = 1.5,
  gradientStartColor = "#6366f1",
  gradientStopColor = "#a855f7",
}: AnimatedBeamProps) {
  const id = useId()
  const prefersReducedMotion = useReducedMotion()
  const [pathD, setPathD] = useState("")
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      const rectA = fromRef.current.getBoundingClientRect()
      const rectB = toRef.current.getBoundingClientRect()

      const width = containerRect.width
      const height = containerRect.height
      setSvgDimensions({ width, height })

      const startX = rectA.left - containerRect.left + rectA.width / 2
      const startY = rectA.top - containerRect.top + rectA.height / 2
      const endX = rectB.left - containerRect.left + rectB.width / 2
      const endY = rectB.top - containerRect.top + rectB.height / 2

      const controlY = (startY + endY) / 2 - curvature
      const d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`
      setPathD(d)
    }

    const observer = new ResizeObserver(updatePath)
    if (containerRef.current) observer.observe(containerRef.current)
    updatePath()
    window.addEventListener("resize", updatePath)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updatePath)
    }
  }, [containerRef, fromRef, toRef, curvature])

  const gradientCoordinates = reverse
    ? { x1: ["90%", "-10%"], x2: ["100%", "0%"] }
    : { x1: ["10%", "110%"], x2: ["0%", "100%"] }

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu stroke-2",
        className
      )}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path
        d={pathD}
        stroke="currentColor"
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
        className="text-[var(--landing-border-strong)]"
      />
      {!prefersReducedMotion && pathD && (
        <path
          d={pathD}
          strokeWidth={pathWidth}
          stroke={`url(#${id})`}
          strokeOpacity="1"
          strokeLinecap="round"
        />
      )}
      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
          animate={{
            x1: gradientCoordinates.x1,
            x2: gradientCoordinates.x2,
            y1: ["0%", "0%"],
            y2: ["0%", "0%"],
          }}
          transition={{
            delay,
            duration,
            ease: [0.16, 1, 0.3, 1],
            repeat: Infinity,
            repeatDelay: 0.6,
          }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  )
}

export const BeamNode = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-10 flex items-center justify-center rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] shadow-xs transition-colors",
      className
    )}
  >
    {children}
  </div>
))
BeamNode.displayName = "BeamNode"
