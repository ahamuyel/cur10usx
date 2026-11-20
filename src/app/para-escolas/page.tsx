import type { Metadata } from "next"
import { getLandingBranding } from "@/lib/landing-branding"
import MarketingShell from "@/components/landing/MarketingShell"
import SchoolsPageContent from "@/components/landing/SchoolsPageContent"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Para Escolas — Cur10usX",
  description:
    "Organize matrículas, turmas, horários, pautas e comunicação com famílias num único espaço simples e seguro.",
}

export default async function ParaEscolasPage() {
  const branding = await getLandingBranding()

  return (
    <MarketingShell branding={branding}>
      <SchoolsPageContent />
    </MarketingShell>
  )
}
