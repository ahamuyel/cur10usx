"use client"

import { useRef, useState, useEffect, type ReactNode, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  children: ReactNode[]
  className?: string
  itemWidth?: string
  showArrows?: boolean
  showDots?: boolean
  autoPlay?: boolean
  interval?: number
}

const springEasing = [0.16, 1, 0.3, 1] as const

function animateScroll(el: HTMLElement, from: number, to: number, duration: number) {
  const start = performance.now()
  return new Promise<void>((resolve) => {
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const t = 1 - Math.pow(1 - progress, 3)
      el.scrollLeft = from + (to - from) * t
      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        resolve()
      }
    }
    requestAnimationFrame(tick)
  })
}

export default function Carousel({
  children,
  className = "",
  itemWidth = "min-w-[280px] w-[85vw] sm:min-w-[320px] sm:w-[45vw] lg:min-w-[280px] lg:w-[23vw]",
  showArrows = true,
  showDots = true,
  autoPlay = false,
  interval = 6000,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const autoPlayTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isAnimating = useRef(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 16)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 16)
    const idx = Math.round(el.scrollLeft / (el.clientWidth * 0.8))
    setActiveIndex(Math.min(idx, children.length - 1))
  }, [children.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      if (isAnimating.current) return
      clearTimeout(scrollTimeout.current)
      scrollTimeout.current = setTimeout(updateScrollState, 50)
    }
    el.addEventListener("scroll", handleScroll, { passive: true })
    updateScrollState()
    return () => {
      el.removeEventListener("scroll", handleScroll)
      clearTimeout(scrollTimeout.current)
    }
  }, [updateScrollState])

  useEffect(() => {
    if (!autoPlay) return
    autoPlayTimer.current = setInterval(() => {
      const el = scrollRef.current
      if (!el || isAnimating.current) return
      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll - 16) {
        animateScrollTo(0)
      } else {
        animateScrollTo(el.scrollLeft + el.clientWidth * 0.75)
      }
    }, interval)
    return () => clearInterval(autoPlayTimer.current)
  }, [autoPlay, interval])

  async function animateScrollTo(target: number) {
    const el = scrollRef.current
    if (!el || isAnimating.current) return
    isAnimating.current = true
    const from = el.scrollLeft
    await animateScroll(el, from, target, 500)
    isAnimating.current = false
    updateScrollState()
  }

  function scrollToPage(dir: number) {
    const el = scrollRef.current
    if (!el) return
    animateScrollTo(el.scrollLeft + el.clientWidth * 0.75 * dir)
  }

  function scrollTo(index: number) {
    const el = scrollRef.current
    if (!el) return
    animateScrollTo(index * el.clientWidth * 0.8)
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto snap-x snap-proximity pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollBehavior: "auto" }}
      >
        {children.map((child, i) => (
          <div key={i} className={`snap-start shrink-0 ${itemWidth}`}>
            {child}
          </div>
        ))}
      </div>

      {showArrows && (
        <>
          {canScrollLeft && (
            <button
              onClick={() => scrollToPage(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-10 h-10 rounded-full bg-white dark:bg-brand-800 border-2 border-brand-200 dark:border-brand-600 flex items-center justify-center shadow-md hover:bg-brand-100 dark:hover:bg-brand-700 transition-all z-10"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 text-brand-600 dark:text-brand-300" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scrollToPage(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-10 h-10 rounded-full bg-white dark:bg-brand-800 border-2 border-brand-200 dark:border-brand-600 flex items-center justify-center shadow-md hover:bg-brand-100 dark:hover:bg-brand-700 transition-all z-10"
              aria-label="Seguinte"
            >
              <ChevronRight className="w-5 h-5 text-brand-600 dark:text-brand-300" />
            </button>
          )}
        </>
      )}

      {showDots && children.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {children.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`h-2 transition-all duration-300 ${
                i === activeIndex
                  ? "w-8 bg-brand-500"
                  : "w-2 bg-brand-300 dark:bg-brand-600"
              }`}
              style={{ borderRadius: "9999px" }}
              aria-label={`Ir para item ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
