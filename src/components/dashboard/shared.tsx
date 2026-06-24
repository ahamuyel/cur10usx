"use client"

import { ReactNode, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight,
  AlertTriangle, CheckCircle, XCircle, Info, Sparkles,
} from "lucide-react"

export interface TabDefinition {
  id: string
  label: string
  icon: ReactNode
  content: ReactNode
  badge?: string | number
}

export function DashboardTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: {
  tabs: { id: string; label: string; icon: ReactNode; badge?: string | number }[]
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/40 p-1 rounded-xl w-fit flex-wrap", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
            activeTab === tab.id
              ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && (
            <span className={cn(
              "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
              activeTab === tab.id
                ? "bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                : "bg-zinc-200/40 dark:bg-zinc-800/40 text-zinc-500"
            )}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export function DashboardTabContent({ id, activeTab, children }: { id: string; activeTab: string; children: ReactNode }) {
  if (id !== activeTab) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

export function MetricCardGrid({ children, cols = 4 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  }
  return (
    <div className={cn("grid gap-3", gridCols[cols])}>
      {children}
    </div>
  )
}

export function MetricCard({
  icon, label, value, subtitle, trend, trendUp, color, onClick, href,
}: {
  icon: ReactNode
  label: string
  value: string
  subtitle?: string
  trend?: number
  trendUp?: boolean
  color: "emerald" | "amber" | "rose" | "blue" | "violet"
  onClick?: () => void
  href?: string
}) {
  const colors = {
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-900/20", icon: "text-emerald-600 dark:text-emerald-400", badge: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10", value: "text-emerald-700 dark:text-emerald-300" },
    amber: { bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-900/20", icon: "text-amber-600 dark:text-amber-400", badge: "text-amber-700 dark:text-amber-400 bg-amber-500/10", value: "text-amber-700 dark:text-amber-300" },
    rose: { bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-100 dark:border-rose-900/20", icon: "text-rose-600 dark:text-rose-400", badge: "text-rose-700 dark:text-rose-400 bg-rose-500/10", value: "text-rose-700 dark:text-rose-300" },
    blue: { bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-900/20", icon: "text-blue-600 dark:text-blue-400", badge: "text-blue-700 dark:text-blue-400 bg-blue-500/10", value: "text-blue-700 dark:text-blue-300" },
    violet: { bg: "bg-violet-50 dark:bg-violet-500/10", border: "border-violet-100 dark:border-violet-900/20", icon: "text-violet-600 dark:text-violet-400", badge: "text-violet-700 dark:text-violet-400 bg-violet-500/10", value: "text-violet-700 dark:text-violet-300" },
  }
  const c = colors[color]
  const isClickable = onClick || href
  const Container = isClickable ? "button" : "div"

  return (
    <motion.div whileHover={isClickable ? { scale: 1.02 } : undefined} whileTap={isClickable ? { scale: 0.98 } : undefined}>
      <Container
        onClick={onClick}
        className={cn("flex flex-col p-4 rounded-2xl border text-left w-full transition-all", c.bg, c.border, isClickable && "cursor-pointer")}
      >
        <div className="flex items-center justify-between mb-2">
          <div className={cn("p-1.5 bg-white dark:bg-zinc-950/50 rounded-lg border shadow-sm", c.icon)}>
            {icon}
          </div>
          {trend !== undefined && trendUp !== undefined && (
            <span className={cn("flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md", c.badge)}>
              {trendUp ? <TrendingUp size={9} className="mr-0.5" /> : <TrendingDown size={9} className="mr-0.5" />}
              {Math.abs(trend).toFixed(1)}
            </span>
          )}
        </div>
        <div className={cn("text-xl font-black tabular-nums", c.value)}>{value}</div>
        <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{label}</div>
        {subtitle && <div className="text-[8px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5 truncate">{subtitle}</div>}
      </Container>
    </motion.div>
  )
}

export function InsightCard({
  type, icon, title, description,
}: {
  type: "critical" | "warning" | "success" | "info"
  icon?: ReactNode
  title: string
  description: string
}) {
  const colors = {
    critical: { bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-200 dark:border-rose-900/20", icon: "text-rose-500", title: "text-rose-800 dark:text-rose-300", desc: "text-rose-600/80 dark:text-rose-400/80" },
    warning: { bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-900/20", icon: "text-amber-500", title: "text-amber-800 dark:text-amber-300", desc: "text-amber-600/80 dark:text-amber-400/80" },
    success: { bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-900/20", icon: "text-emerald-500", title: "text-emerald-800 dark:text-emerald-300", desc: "text-emerald-600/80 dark:text-emerald-400/80" },
    info: { bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-900/20", icon: "text-blue-500", title: "text-blue-800 dark:text-blue-300", desc: "text-blue-600/80 dark:text-blue-400/80" },
  }
  const c = colors[type]
  const DefaultIcon = type === "critical" ? XCircle : type === "warning" ? AlertTriangle : type === "success" ? CheckCircle : Info

  return (
    <div className={cn("flex items-start gap-3 p-3.5 rounded-2xl border", c.bg, c.border)}>
      {icon || <DefaultIcon size={16} className={cn("mt-0.5 shrink-0", c.icon)} />}
      <div className="min-w-0">
        <p className={cn("text-xs font-bold", c.title)}>{title}</p>
        <p className={cn("text-[11px] font-medium", c.desc)}>{description}</p>
      </div>
    </div>
  )
}

export function SectionCard({
  title, subtitle, icon, children, className, action,
}: {
  title: string
  subtitle?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <div className={cn("bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6", className)}>
      {(title || icon) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0">
            {icon && (
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700/50 shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{title}</h3>
              {subtitle && <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

export function SubjectRow({
  subjectName, average, count, trend,
}: {
  subjectName: string
  average: number
  count?: number
  trend?: number
}) {
  const color = average >= 14 ? "emerald" : average >= 10 ? "amber" : "rose"
  const colors = {
    emerald: { text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
    amber: { text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
    rose: { text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
  }
  const c = colors[color]

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30">
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", c.dot)} />
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{subjectName}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {count !== undefined && <span className="text-[9px] text-zinc-400">{count} aval.</span>}
        <span className={cn("text-xs font-bold tabular-nums", c.text)}>{average.toFixed(1)}</span>
        {trend !== undefined && (
          trend > 1 ? (
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
              <ArrowUpRight size={9} />+{trend.toFixed(1)}
            </span>
          ) : trend < -1 ? (
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded-md">
              <ArrowDownRight size={9} />{trend.toFixed(1)}
            </span>
          ) : null
        )}
      </div>
    </div>
  )
}

export function SummaryBadge({ label, value, color }: { label: string; value: string; color: "emerald" | "amber" | "rose" | "blue" | "violet" }) {
  const colors = {
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/20",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/20",
    rose: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/20",
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/20",
    violet: "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200/50 dark:border-violet-900/20",
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border", colors[color])}>
      <span className="tabular-nums">{value}</span>
      <span className="font-normal opacity-70">{label}</span>
    </span>
  )
}
