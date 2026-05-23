"use client"

import { type ReactNode, useRef } from "react"
import { motion, useInView } from "framer-motion"

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  duration?: number
  once?: boolean
  distance?: number
}

const springEasing = [0.16, 1, 0.3, 1] as const

const directionVariants = {
  up: (distance: number) => ({ y: distance }),
  down: (distance: number) => ({ y: -distance }),
  left: (distance: number) => ({ x: distance }),
  right: (distance: number) => ({ x: -distance }),
}

export default function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.6,
  once = true,
  distance = 24,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: "-80px" })

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{
          opacity: 0,
          ...directionVariants[direction](distance),
        }}
        animate={
          isInView
            ? { opacity: 1, x: 0, y: 0 }
            : { opacity: 0, ...directionVariants[direction](distance) }
        }
        transition={{
          duration,
          delay: delay / 1000,
          ease: springEasing,
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export function StaggerContainer({
  children,
  className = "",
  delay = 0,
  staggerDelay = 0.05,
}: {
  children: ReactNode
  className?: string
  delay?: number
  staggerDelay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: { staggerChildren: staggerDelay, delayChildren: delay },
        },
        hidden: {},
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = "",
  direction = "up",
  distance = 24,
}: {
  children: ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right"
  distance?: number
}) {
  const dirVariants = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, ...dirVariants[direction] },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
