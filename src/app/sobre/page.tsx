import type { Metadata } from "next"
import { getLandingBranding } from "@/lib/landing-branding"
import MarketingShell from "@/components/landing/MarketingShell"
import AboutPageContent from "@/components/landing/AboutPageContent"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sobre — Cur10usX",
  description:
    "Conheça a missão do Cur10usX: tornar a gestão escolar mais simples e acompanhar a evolução de cada aluno.",
}

export default async function SobrePage() {
  const branding = await getLandingBranding()

  return (
    <MarketingShell branding={branding}>
      <AboutPageContent />
    </MarketingShell>
  )
}
