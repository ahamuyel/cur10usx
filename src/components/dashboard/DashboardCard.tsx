import React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BaseCardProps } from "./types"

interface DashboardCardProps extends BaseCardProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  interactive?: boolean
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  variant = "info",
  icon,
  badge,
  className,
  children,
  href,
  onClick,
  interactive = false,
}) => {
  const isClickable = !!href || !!onClick || interactive

  const variantStyles = {
    info: "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50",
    action: "border-violet-200 dark:border-violet-950 bg-violet-50/40 dark:bg-violet-950/20",
    warning: "border-amber-200 dark:border-amber-950 bg-amber-50/40 dark:bg-amber-950/20",
    success: "border-emerald-200 dark:border-emerald-950 bg-emerald-50/40 dark:bg-emerald-950/20",
  }

  const baseClasses = cn(
    "relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 ease-out text-zinc-900 dark:text-zinc-100",
    variantStyles[variant],
    isClickable && [
      "cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.99] focus-within:ring-2 focus-within:ring-violet-500 focus-within:outline-none",
      "hover:border-violet-300 dark:hover:border-violet-850"
    ],
    className
  )

  const CardContent = () => (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold leading-none tracking-tight text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-zinc-400 dark:text-zinc-500">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        {children}
      </div>

      {badge && (
        <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-700/10 dark:bg-violet-950/40 dark:text-violet-400 dark:ring-violet-400/20">
          {badge}
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        <CardContent />
      </Link>
    )
  }

  return (
    <div
      onClick={onClick}
      className={baseClasses}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <CardContent />
    </div>
  )
}
export default DashboardCard
