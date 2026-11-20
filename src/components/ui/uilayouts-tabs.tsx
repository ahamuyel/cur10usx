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
 * Clean, distortion-free spring tabs adapted from UI Layouts `tabs`.
 * Uses a single shared-element layoutId spring pill (outside AnimatePresence so it never distorts)
 * and smooth directional crossfades with zero layout jumps.
 */
export function TabsProvider({
  children,
  defaultValue,
  tabsOrder,
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
      defaultValue,
      prevIndex,
      setPrevIndex,
      tabsOrder,
    }),
    [activeTab, defaultValue, prevIndex, tabsOrder]
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
  const { activeTab, setActiveTab, setPrevIndex, defaultValue, tabsOrder } =
    useUITabs()
  const prefersReducedMotion = useReducedMotion()
  const isActive = activeTab === value

  const handleClick = useCallback(() => {
    if (value === activeTab) return
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
        "relative cursor-pointer px-4 h-9 rounded-lg text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]",
        isActive
          ? "text-[var(--landing-bg)]"
          : "text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]",
        className
      )}
    >
      {isActive && (
        <motion.span
          layoutId={prefersReducedMotion ? undefined : `${defaultValue}-active-pill`}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 32,
            mass: 0.85,
          }}
          className="absolute inset-0 rounded-lg bg-[var(--landing-text-primary)] z-0"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-1.5">
        {children}
      </span>
    </button>
  )
}

/**
 * Single AnimatePresence container so exiting and entering panels never stack or distort height.
 */
export function TabsPanels({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { activeTab, tabsOrder, prevIndex } = useUITabs()
  const prefersReducedMotion = useReducedMotion()
  const isForward = tabsOrder.indexOf(activeTab) >= prevIndex

  const activeChild = React.Children.toArray(children).find(
    (child) =>
      React.isValidElement<{ value?: string }>(child) &&
      child.props.value === activeTab
  )

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {activeChild && (
          <motion.div
            key={activeTab}
            role="tabpanel"
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, x: isForward ? 10 : -10 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, x: isForward ? -10 : 10 }
            }
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeChild}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function TabsContent({
  children,
  value,
  className,
}: {
  children: ReactNode
  value: string
  className?: string
  yValue?: boolean
}) {
  const { activeTab } = useUITabs()
  if (activeTab !== value) return null
  return <div className={cn(className)}>{children}</div>
}
