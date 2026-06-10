import type { LucideIcon } from "lucide-react"
import { Building2, GraduationCap, UserRound } from "lucide-react"
import type { Role } from "@prisma/client"

export type AccountTypeId = "school_admin" | "teacher" | "student"

export interface AccountTypeConfig {
  id: AccountTypeId
  icon: LucideIcon
  titleKey: string
  descKey: string
  role: Role
  endpoint: string
  apiRole?: "school_admin" | "teacher" | "student"
}

export const ACCOUNT_TYPE_LIST: AccountTypeConfig[] = [
  {
    id: "school_admin",
    icon: Building2,
    titleKey: "Admin Escola",
    descKey: "Registe a sua instituição",
    role: "school_admin",
    endpoint: "/api/auth/register-school",
  },
  {
    id: "teacher",
    icon: UserRound,
    titleKey: "Professor",
    descKey: "Vincule-se a uma escola",
    role: "teacher",
    endpoint: "/api/auth/signup",
    apiRole: "teacher",
  },
  {
    id: "student",
    icon: GraduationCap,
    titleKey: "Estudante",
    descKey: "Solicite matrícula",
    role: "student",
    endpoint: "/api/auth/signup",
    apiRole: "student",
  },
]

export const ACCOUNT_TYPE_MAP = Object.fromEntries(
  ACCOUNT_TYPE_LIST.map((c) => [c.id, c]),
) as Record<AccountTypeId, AccountTypeConfig>
