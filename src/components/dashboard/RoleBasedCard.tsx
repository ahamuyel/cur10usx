import React from "react"
import { MetricCard } from "./MetricCard"
import { ActionCard } from "./ActionCard"
import { RoleBasedCardProps, MetricCardProps, ActionCardProps } from "./types"

export const RoleBasedCard: React.FC<RoleBasedCardProps> = ({
  role,
  title,
  description,
  variant,
  icon,
  badge,
  className,
  studentProps,
  teacherProps,
  schoolAdminProps,
  superAdminProps,
}) => {
  // Retorna os metadados específicos para o papel atual
  const getPropsForRole = () => {
    switch (role) {
      case "student":
        return studentProps
      case "teacher":
        return teacherProps
      case "school_admin":
        return schoolAdminProps
      case "super_admin":
        return superAdminProps
      default:
        return undefined
    }
  }

  const roleProps = getPropsForRole()

  if (!roleProps) {
    return null // Se não há propriedades configuradas para este papel, oculta o card
  }

  // Combina as propriedades comuns com as propriedades específicas do papel
  const combinedProps = {
    title,
    description: roleProps.description || description,
    variant: roleProps.variant || variant,
    icon: roleProps.icon || icon,
    badge: roleProps.badge || badge,
    className,
    ...roleProps,
  }

  // Decide se renderiza um MetricCard ou um ActionCard com base no formato das propriedades do papel
  if ("value" in combinedProps) {
    return <MetricCard {...(combinedProps as MetricCardProps)} />
  }

  if ("onClick" in combinedProps && "actionLabel" in combinedProps) {
    return <ActionCard {...(combinedProps as ActionCardProps)} />
  }

  return null
}
export default RoleBasedCard
