"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

interface SpotlightContextType {
  ProximitySpotlight: boolean
  HoverFocusSpotlight: boolean
  CursorFlowGradient: boolean
  mousePosition: { x: number; y: number }
  reducedMotion: boolean
}

const SpotlightContext = createContext<SpotlightContextType | undefined>(undefined)

export const useSpotlight = () => {
  const context = useContext(SpotlightContext)
  if (!context) {
    throw new Error("useSpotlight must be used within a Spotlight provider")
  }
  return context
}

interface SpotlightProps {
  children: ReactNode
  className?: string
  ProximitySpotlight?: boolean
  HoverFocusSpotlight?: boolean
  CursorFlowGradient?: boolean
}

/**
 * Adapted from UI Layouts `spotlight` (https://www.ui-layouts.com/components/spotlight-cards).
 * Provides proximity border glow + cursor-flow radial illumination across a card grid,
 * tuned for both Light Mode and Dark Mode semantic tokens.
 */
export function Spotlight({
  children,
  className,
  ProximitySpotlight = true,
  HoverFocusSpotlight = false,
  CursorFlowGradient = true,
}: SpotlightProps) {
  const reducedMotion = Boolean(useReducedMotion())
  const [mousePosition, setMousePosition] = useState({ x: -9999, y: -9999 })

  useEffect(() => {
    if (reducedMotion || (!ProximitySpotlight && !HoverFocusSpotlight)) return
    const handleMove = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY })
    }
    window.addEventListener("mousemove", handleMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMove)
  }, [reducedMotion, ProximitySpotlight, HoverFocusSpotlight])

  return (
    <SpotlightContext.Provider
      value={{
        ProximitySpotlight,
        HoverFocusSpotlight,
        CursorFlowGradient,
        mousePosition,
        reducedMotion,
      }}
    >
      <div className={cn("group/spotlight relative z-10", className)}>
        {children}
      </div>
    </SpotlightContext.Provider>
  )
}

interface SpotLightItemProps {
  children: ReactNode
  className?: string
  innerClassName?: string
}

export function SpotLightItem({
  children,
  className,
  innerClassName,
}: SpotLightItemProps) {
  const {
    HoverFocusSpotlight,
    ProximitySpotlight,
    CursorFlowGradient,
    mousePosition,
    reducedMotion,
  } = useSpotlight()

  const boxRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [localPos, setLocalPos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    setLocalPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={boxRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !reducedMotion && CursorFlowGradient && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative rounded-2xl p-[1.5px] bg-[var(--landing-border)] overflow-hidden transition-transform duration-300",
        className
      )}
    >
      {/* Proximity border spotlight (lights neighboring card borders on mouse approach) */}
      {!reducedMotion && ProximitySpotlight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
          style={{
            background: `radial-gradient(280px circle at ${mousePosition.x}px ${mousePosition.y}px, var(--landing-accent), transparent 72%) fixed`,
          }}
        />
      )}

      {/* Optional Hover Focus border beam */}
      {!reducedMotion && HoverFocusSpotlight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(240px circle at ${mousePosition.x}px ${mousePosition.y}px, var(--landing-accent), transparent 65%) fixed`,
          }}
        />
      )}

      {/* Inner surface */}
      <div
        className={cn(
          "relative z-10 h-full w-full rounded-[calc(1rem-1.5px)] bg-[var(--landing-surface)] overflow-hidden",
          innerClassName
        )}
      >
        {/* Inner Cursor Flow Gradient */}
        {!reducedMotion && CursorFlowGradient && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(320px circle at ${localPos.x}px ${localPos.y}px, var(--landing-spotlight), transparent 70%)`,
            }}
          />
        )}
        <div className="relative z-10 h-full">{children}</div>
      </div>
    </div>
  )
}
