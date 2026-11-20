"use client"

import React from "react"
import {
  motion,
  useInView,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react"

type TimelineAnimationProps<T extends keyof HTMLElementTagNameMap = "div"> = {
  children?: React.ReactNode
  animationNum: number
  className?: string
  timelineRef: React.RefObject<HTMLElement | null>
  as?: T
  customVariants?: Variants
  once?: boolean
} & Omit<HTMLMotionProps<T>, "children" | "className" | "variants">

/**
 * Adapted from UI Layouts `timeline-animation` (https://www.ui-layouts.com/components/timeline-animation).
 * Sequential blur-to-sharp entrance triggered by a shared section ref.
 */
export function TimelineAnimation<T extends keyof HTMLElementTagNameMap = "div">({
  children,
  animationNum,
  timelineRef,
  className,
  as,
  customVariants,
  once = true,
  ...props
}: TimelineAnimationProps<T>) {
  const prefersReducedMotion = useReducedMotion()
  const isInView = useInView(timelineRef, { once, amount: 0.12 })

  const defaultVariants: Variants = {
    visible: (i: number) => ({
      filter: "blur(0px)",
      y: 0,
      opacity: 1,
      transition: {
        delay: Math.min(i * 0.11, 0.55),
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: 16,
      opacity: 0,
    },
  }

  const Tag = (as || "div") as keyof typeof motion
  const MotionComponent = motion[Tag] as React.ElementType

  if (prefersReducedMotion) {
    const PlainTag = (as || "div") as React.ElementType
    return <PlainTag className={className}>{children}</PlainTag>
  }

  return (
    <MotionComponent
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={animationNum}
      variants={customVariants || defaultVariants}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}
