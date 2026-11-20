import type { Metadata } from "next"
import { getLandingBranding } from "@/lib/landing-branding"
import MarketingShell from "@/components/landing/MarketingShell"
import StudentsPageContent from "@/components/landing/StudentsPageContent"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Para Estudantes e Famílias — Cur10usX",
  description:
    "Acompanhe horários, notas, tarefas, exercícios guiados e o Perfil Evolutivo do estudante num só lugar.",
}

export default async function ParaEstudantesPage() {
  const branding = await getLandingBranding()

  return (
    <MarketingShell branding={branding}>
      <StudentsPageContent />
    </MarketingShell>
  )
}
