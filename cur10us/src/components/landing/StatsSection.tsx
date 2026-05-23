"use client"

import { useEffect, useRef, useState } from "react"
import { School, Users, GraduationCap, BookOpen } from "lucide-react"
import AnimateOnScroll from "./AnimateOnScroll"

type Props = {
  schools: number
  students: number
  teachers: number
  classes: number
}

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count}</span>
}

const statItems = [
  {
    key: "schools" as const,
    icon: School,
    label: "Escolas registadas",
    bg: "bg-warm-600",
    cardBg: "bg-warm-100 dark:bg-warm-900/20",
    ring: "ring-warm-200 dark:ring-warm-800/20",
  },
  {
    key: "students" as const,
    icon: Users,
    label: "Alunos na plataforma",
    bg: "bg-warm-500",
    cardBg: "bg-warm-100 dark:bg-warm-900/20",
    ring: "ring-warm-200 dark:ring-warm-800/20",
  },
  {
    key: "teachers" as const,
    icon: GraduationCap,
    label: "Professores activos",
    bg: "bg-warm-600",
    cardBg: "bg-warm-100 dark:bg-warm-900/20",
    ring: "ring-warm-200 dark:ring-warm-800/20",
  },
  {
    key: "classes" as const,
    icon: BookOpen,
    label: "Turmas criadas",
    bg: "bg-warm-500",
    cardBg: "bg-warm-100 dark:bg-warm-900/20",
    ring: "ring-warm-200 dark:ring-warm-800/20",
  },
]

export default function StatsSection(props: Props) {
  return (
    <section className="section-padding px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {statItems.map((stat) => {
            const Icon = stat.icon
            const value = props[stat.key]
            return (
              <AnimateOnScroll key={stat.key}>
                <div
                  className={`relative flex flex-col items-center py-8 px-4 rounded-2xl ${stat.cardBg} ring-1 ${stat.ring} transition-all duration-300 hover:shadow-lg hover:scale-[1.02] card-base border-0`}
                >
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 shadow-md`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-bold text-warm-900 dark:text-warm-100 tabular-nums">
                    <AnimatedCounter target={value} />
                    {value > 0 && <span className="text-xl text-warm-600">+</span>}
                  </span>
                  <span className="text-xs sm:text-sm text-warm-500 dark:text-warm-400 mt-1.5 text-center font-medium">
                    {stat.label}
                  </span>
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
