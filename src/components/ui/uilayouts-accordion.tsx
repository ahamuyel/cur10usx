"use client"

import React, { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionContextType {
  isActive: boolean
  value: string
  onChangeIndex: (value: string) => void
}

const AccordionContext = createContext<AccordionContextType | null>(null)

const useUIAccordion = () => {
  const ctx = useContext(AccordionContext)
  if (!ctx) throw new Error("Accordion parts must be inside Accordion")
  return ctx
}

/**
 * Adapted from UI Layouts `accordion` (https://www.ui-layouts.com/components/accordion).
 * Features spring height expansion paired with polygon clip-path curtain transition.
 */
export function Accordion({
  children,
  multiple = false,
  defaultValue,
}: {
  children: ReactNode
  multiple?: boolean
  defaultValue?: string | string[]
}) {
  const [activeIndex, setActiveIndex] = useState<string | string[] | null>(
    multiple ? (Array.isArray(defaultValue) ? defaultValue : []) : defaultValue || null
  )

  const onChangeIndex = useCallback(
    (value: string) => {
      setActiveIndex((current) => {
        if (!multiple) {
          return value === current ? null : value
        }
        if (Array.isArray(current)) {
          return current.includes(value)
            ? current.filter((i) => i !== value)
            : [...current, value]
        }
        return [value]
      })
    },
    [multiple]
  )

  return (
    <div className="space-y-2.5">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null
        const value = (child.props as { value?: string }).value || ""
        const isActive = multiple
          ? Array.isArray(activeIndex) && activeIndex.includes(value)
          : activeIndex === value

        return (
          <AccordionContext.Provider value={{ isActive, value, onChangeIndex }}>
            {child}
          </AccordionContext.Provider>
        )
      })}
    </div>
  )
}

export function AccordionItem({
  children,
  value,
  className,
}: {
  children: ReactNode
  value: string
  className?: string
}) {
  const { isActive } = useUIAccordion()

  return (
    <div
      data-value={value}
      data-active={isActive || undefined}
      className={cn(
        "rounded-2xl border overflow-hidden transition-colors duration-200",
        isActive
          ? "border-[var(--landing-border-strong)] bg-[var(--landing-surface)]"
          : "border-[var(--landing-border)] bg-[var(--landing-surface)]/70 hover:border-[var(--landing-border-strong)]",
        className
      )}
    >
      {children}
    </div>
  )
}

export function AccordionHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { isActive, value, onChangeIndex } = useUIAccordion()

  return (
    <button
      id={`accordion-header-${value}`}
      type="button"
      data-active={isActive || undefined}
      aria-expanded={isActive}
      aria-controls={`accordion-panel-${value}`}
      onClick={() => onChangeIndex(value)}
      className={cn(
        "w-full min-h-[56px] px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--landing-accent)]",
        className
      )}
    >
      <span className="text-sm font-medium text-[var(--landing-text-primary)] leading-snug">
        {children}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-colors duration-200",
          isActive
            ? "border-[var(--landing-accent)]/40 bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)]"
            : "border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] text-[var(--landing-text-muted)]"
        )}
      >
        {isActive ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
      </span>
    </button>
  )
}

export function AccordionPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { isActive, value } = useUIAccordion()
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false}>
      {isActive && (
        <motion.div
          role="region"
          id={`accordion-panel-${value}`}
          aria-labelledby={`accordion-header-${value}`}
          initial={prefersReducedMotion ? false : { height: 0, overflow: "hidden" }}
          animate={{ height: "auto", overflow: "hidden" }}
          exit={prefersReducedMotion ? undefined : { height: 0, overflow: "hidden" }}
          transition={{ type: "spring", duration: 0.34, bounce: 0 }}
          className={cn(className)}
        >
          <motion.div
            initial={
              prefersReducedMotion
                ? false
                : { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)", opacity: 0 }
            }
            animate={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
              opacity: 1,
            }}
            exit={
              prefersReducedMotion
                ? undefined
                : { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)", opacity: 0 }
            }
            transition={{ type: "spring", duration: 0.38, bounce: 0 }}
            className="px-5 pb-5 text-xs sm:text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
