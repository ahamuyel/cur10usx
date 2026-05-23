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
    bg: "bg-growth-100 dark:bg-growth-900/30",
    iconColor: "text-growth-600 dark:text-growth-400",
  },
  {
    key: "students" as const,
    icon: Users,
    label: "Alunos na plataforma",
    bg: "bg-sun-100 dark:bg-sun-900/30",
    iconColor: "text-sun-600 dark:text-sun-400",
  },
  {
    key: "teachers" as const,
    icon: GraduationCap,
    label: "Professores activos",
    bg: "bg-growth-100 dark:bg-growth-900/30",
    iconColor: "text-growth-600 dark:text-growth-400",
  },
  {
    key: "classes" as const,
    icon: BookOpen,
    label: "Turmas criadas",
    bg: "bg-sun-100 dark:bg-sun-900/30",
    iconColor: "text-sun-600 dark:text-sun-400",
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
                <div className="card-base flex flex-col items-center py-8 px-4">
                  <div className={`w-10 h-10 ${stat.bg} border border-brand-200 dark:border-brand-700 flex items-center justify-center mb-3`}>
                    <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                  <span className="text-3xl sm:text-4xl font-bold text-warm-900 dark:text-warm-100 tabular-nums">
                    <AnimatedCounter target={value} />
                    {value > 0 && <span className="text-xl text-growth-500">+</span>}
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
