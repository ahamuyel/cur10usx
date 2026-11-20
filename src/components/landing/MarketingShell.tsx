import type { ReactNode } from "react"
import LandingNavbar from "@/components/landing/LandingNavbar"
import Footer from "@/components/landing/Footer"
import type { PlatformBranding } from "@/types/landing"

export default function MarketingShell({
  branding,
  children,
}: {
  branding: PlatformBranding
  children: ReactNode
}) {
  return (
    <div className="landing-root min-h-screen flex flex-col bg-[var(--landing-bg)] text-[var(--landing-text-primary)] selection:bg-[var(--landing-accent-subtle)] landing-scrollbar">
      <LandingNavbar branding={branding} />
      <main className="flex-1">{children}</main>
      <Footer branding={branding} />
    </div>
  )
}
