import React from "react"
import { Loader2, ArrowRight } from "lucide-react"
import { DashboardCard } from "./DashboardCard"
import { ActionCardProps } from "./types"

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  variant = "action",
  icon,
  badge,
  actionLabel,
  onClick,
  isLoading = false,
  className,
}) => {
  return (
    <DashboardCard
      title={title}
      description={description}
      variant={variant}
      icon={icon}
      badge={badge}
      onClick={isLoading ? undefined : onClick}
      className={className}
      interactive={true}
    >
      <div className="flex flex-col items-start gap-4 w-full">
        {description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {description}
          </p>
        )}
        <button
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation() // Evita acionamento duplo pelo onClick do DashboardCard
            if (!isLoading) onClick()
          }}
          className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all rounded-xl disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              {actionLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </DashboardCard>
  )
}
export default ActionCard
