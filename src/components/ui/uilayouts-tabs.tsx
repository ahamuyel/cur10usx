"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

interface TabContextType {
  activeTab: string
  setActiveTab: (value: string) => void
  wobbly: boolean
  defaultValue: string
  prevIndex: number
  setPrevIndex: (value: number) => void
  tabsOrder: string[]
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export const useUITabs = () => {
  const context = useContext(TabContext)
  if (!context) {
    throw new Error("useUITabs must be used within TabsProvider")
  }
  return context
}

/**
 * Adapted from UI Layouts `tabs` (https://www.ui-layouts.com/components/tabs).
 * Features the signature wobbly dual-layer spring layoutId indicator and directional y-slide content.
 */
export function TabsProvider({
  children,
  defaultValue,
  tabsOrder,
  wobbly = true,
}: {
  children: ReactNode
  defaultValue: string
  tabsOrder: string[]
  wobbly?: boolean
}) {
  const [activeTab, setActiveTab] = useState(defaultValue)
  const [prevIndex, setPrevIndex] = useState(0)

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      wobbly,
      defaultValue,
      prevIndex,
      setPrevIndex,
      tabsOrder,
    }),
    [activeTab, wobbly, defaultValue, prevIndex, tabsOrder]
  )

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>
}

export function TabsBtn({
  children,
  value,
  className,
}: {
  children: ReactNode
  value: string
  className?: string
}) {
  const { activeTab, setActiveTab, setPrevIndex, defaultValue, wobbly, tabsOrder } =
    useUITabs()
  const prefersReducedMotion = useReducedMotion()
  const isActive = activeTab === value

  const handleClick = useCallback(() => {
    setPrevIndex(tabsOrder.indexOf(activeTab))
    setActiveTab(value)
  }, [activeTab, setActiveTab, setPrevIndex, tabsOrder, value])

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={handleClick}
      className={cn(
        "relative cursor-pointer px-4 h-9 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]",
        isActive
          ? "text-[var(--landing-bg)]"
          : "text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]",
        className
      )}
    >
      <span className="relative z-10 inline-flex items-center gap-1.5">
        {children}
      </span>

      <AnimatePresence mode="wait">
        {isActive && (
          <>
            <motion.span
              layoutId={prefersReducedMotion ? undefined : `${defaultValue}-pill`}
              transition={{
                layout: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
              }}
              className="absolute inset-0 rounded-lg bg-[var(--landing-text-primary)] z-0"
            />
            {wobbly && !prefersReducedMotion && (
              <motion.span
                layoutId={`${defaultValue}-pill-trail`}
                transition={{
                  layout: { duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: 0.04 },
                }}
                className="absolute inset-0 rounded-lg bg-[var(--landing-accent)]/25 blur-[2px] -z-10"
              />
            )}
          </>
        )}
      </AnimatePresence>
    </button>
  )
}

export function TabsContent({
  children,
  value,
  className,
  yValue = true,
}: {
  children: ReactNode
  value: string
  className?: string
  yValue?: boolean
}) {
  const { activeTab, tabsOrder, prevIndex } = useUITabs()
  const prefersReducedMotion = useReducedMotion()
  const isForward = tabsOrder.indexOf(activeTab) >= prevIndex

  return (
    <AnimatePresence mode="wait" initial={false}>
      {activeTab === value && (
        <motion.div
          key={value}
          role="tabpanel"
          initial={
            prefersReducedMotion
              ? false
              : { opacity: 0, y: yValue ? (isForward ? 12 : -12) : 0, filter: "blur(4px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            prefersReducedMotion
              ? undefined
              : { opacity: 0, y: yValue ? (isForward ? -12 : 12) : 0, filter: "blur(4px)" }
          }
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className={cn(className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
