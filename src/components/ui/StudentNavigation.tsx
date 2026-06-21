"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, TrendingUp, History, Calendar, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentNavigationProps {
  studentId: string
  classId?: string | null
}

const navItems = [
  { href: (id: string) => `/dashboard/${id}`, label: "Dashboard", icon: LayoutDashboard },
  { href: (id: string) => `/list/students/${id}/history`, label: "Histórico", icon: History },
]

export default function StudentNavigation({ studentId }: StudentNavigationProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/40 rounded-xl p-0.5 border border-zinc-200/40 dark:border-zinc-700/40 overflow-x-auto">
      {navItems.map((item) => {
        const href = item.href(studentId)
        const isActive = pathname === href
        const Icon = item.icon
        return (
          <Link
            key={item.label}
            href={href}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap",
              isActive
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-white/50 dark:hover:bg-zinc-700/30"
            )}
          >
            <Icon size={14} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
