import React from "react"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { DashboardCard } from "./DashboardCard"
import { MetricCardProps } from "./types"
import { cn } from "@/lib/utils"

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  variant = "info",
  icon,
  badge,
  trend,
  href,
  className,
}) => {
  const TrendIcon = () => {
    if (!trend) return null
    switch (trend.type) {
      case "up":
        return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
      case "down":
        return <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
      default:
        return <Minus className="w-3.5 h-3.5 text-zinc-400" />
    }
  }

  const trendColorClass = () => {
    if (!trend) return ""
    switch (trend.type) {
      case "up":
        return "text-emerald-600 dark:text-emerald-400"
      case "down":
        return "text-rose-600 dark:text-rose-400"
      default:
        return "text-zinc-500 dark:text-zinc-400"
    }
  }

  return (
    <DashboardCard
      title={title}
      description={description}
      variant={variant}
      icon={icon}
      badge={badge}
      href={href}
      className={className}
    >
      <div className="flex flex-col gap-1 w-full">
        <span className="text-3xl font-black tracking-tight font-sans text-zinc-900 dark:text-white">
          {value}
        </span>
        {trend && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            <TrendIcon />
            <span className={cn("font-semibold", trendColorClass())}>
              {trend.value}%
            </span>
            <span className="text-zinc-400 dark:text-zinc-500">
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </DashboardCard>
  )
}
export default MetricCard
