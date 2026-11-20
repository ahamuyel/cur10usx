"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type FC,
  type ReactNode,
} from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

interface ProgressSliderContextType {
  active: string
  progress: number
  handleButtonClick: (value: string) => void
  vertical: boolean
}

const ProgressSliderContext = createContext<ProgressSliderContextType | undefined>(
  undefined
)

export const useProgressSliderContext = (): ProgressSliderContextType => {
  const context = useContext(ProgressSliderContext)
  if (!context) {
    throw new Error("useProgressSliderContext must be used within ProgressSlider")
  }
  return context
}

interface ProgressSliderProps {
  children: ReactNode
  duration?: number
  fastDuration?: number
  vertical?: boolean
  activeSlider: string
  sliderOrder: string[]
  className?: string
}

/**
 * Adapted from UI Layouts `progressive-carousel` (https://www.ui-layouts.com/components/progressive-carousel).
 * Interactive auto-advancing showcase with animated progress indicator and pause-on-hover.
 */
export const ProgressSlider: FC<ProgressSliderProps> = ({
  children,
  duration = 6000,
  fastDuration = 350,
  vertical = false,
  activeSlider,
  sliderOrder,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion()
  const [active, setActive] = useState<string>(activeSlider)
  const [progress, setProgress] = useState<number>(0)
  const [paused, setPaused] = useState(false)
  const [isFastForward, setIsFastForward] = useState(false)

  const frameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const targetRef = useRef<string | null>(null)
  const progressRef = useRef<number>(0)

  useEffect(() => {
    if (prefersReducedMotion || (paused && !isFastForward) || sliderOrder.length === 0) return

    startTimeRef.current = performance.now()

    const tick = (now: number) => {
      const currentDuration = isFastForward ? fastDuration : duration
      const elapsed = now - startTimeRef.current
      const fraction = elapsed / currentDuration

      if (fraction <= 1) {
        const nextProgress = isFastForward
          ? progressRef.current + (100 - progressRef.current) * fraction
          : fraction * 100
        setProgress(nextProgress)
        frameRef.current = requestAnimationFrame(tick)
      } else {
        if (isFastForward) {
          setIsFastForward(false)
          if (targetRef.current) {
            setActive(targetRef.current)
            targetRef.current = null
          }
        } else if (sliderOrder.length > 1) {
          const idx = sliderOrder.indexOf(active)
          const next = sliderOrder[(idx + 1) % sliderOrder.length]
          setActive(next)
        }
        progressRef.current = 0
        setProgress(0)
        startTimeRef.current = performance.now()
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [prefersReducedMotion, paused, sliderOrder, active, duration, fastDuration, isFastForward])

  const handleButtonClick = useCallback(
    (value: string) => {
      if (value === active) return
      if (prefersReducedMotion) {
        setActive(value)
        setProgress(100)
        return
      }
      progressRef.current = progress
      targetRef.current = value
      setIsFastForward(true)
      startTimeRef.current = performance.now()
    },
    [active, prefersReducedMotion, progress]
  )

  return (
    <ProgressSliderContext.Provider
      value={{ active, progress: prefersReducedMotion ? 100 : progress, handleButtonClick, vertical }}
    >
      <div
        className={cn("relative", className)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {children}
      </div>
    </ProgressSliderContext.Provider>
  )
}

export const SliderContent: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn("relative", className)}>{children}</div>

export const SliderWrapper: FC<{
  children: ReactNode
  value: string
  className?: string
}> = ({ children, value, className }) => {
  const { active } = useProgressSliderContext()
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      {active === value && (
        <motion.div
          key={value}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8, scale: 0.99 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={cn(className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const SliderBtnGroup: FC<
  React.HTMLAttributes<HTMLDivElement> & { children: ReactNode }
> = ({ children, className, role = "tablist", ...props }) => (
  <div role={role} className={cn(className)} {...props}>
    {children}
  </div>
)

export const SliderBtn: FC<{
  children: ReactNode
  value: string
  className?: string
  progressBarClass?: string
}> = ({ children, value, className, progressBarClass }) => {
  const { active, progress, handleButtonClick, vertical } = useProgressSliderContext()
  const isActive = active === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => handleButtonClick(value)}
      className={cn(
        "relative text-left transition-all duration-200 cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]",
        isActive ? "opacity-100" : "opacity-65 hover:opacity-90",
        className
      )}
    >
      <div className="relative z-10">{children}</div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-[var(--landing-border-subtle)] overflow-hidden"
      >
        <span
          className={cn(
            "block h-full bg-[var(--landing-accent)] transition-[width] duration-75 ease-linear",
            progressBarClass
          )}
          style={{
            [vertical ? "height" : "width"]: isActive ? `${progress}%` : "0%",
          }}
        />
      </div>
    </button>
  )
}
