import { ReactNode } from "react"

export type UserRole = "student" | "teacher" | "school_admin" | "super_admin"
export type CardVariant = "info" | "action" | "warning" | "success"

export interface BaseCardProps {
  title: string
  description?: string
  variant?: CardVariant
  icon?: ReactNode
  badge?: string
  className?: string
}

export interface MetricCardProps extends BaseCardProps {
  value: string | number
  trend?: {
    value: number
    label: string
    type: "up" | "down" | "neutral"
  }
  href?: string
}

export interface ActionCardProps extends BaseCardProps {
  actionLabel: string
  onClick: () => void
  isLoading?: boolean
}

export interface RoleBasedCardProps extends BaseCardProps {
  role: UserRole
  studentProps?: Partial<MetricCardProps | ActionCardProps>
  teacherProps?: Partial<MetricCardProps | ActionCardProps>
  schoolAdminProps?: Partial<MetricCardProps | ActionCardProps>
  superAdminProps?: Partial<MetricCardProps | ActionCardProps>
}
