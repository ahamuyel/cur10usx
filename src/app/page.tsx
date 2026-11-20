import { prisma } from "@/lib/prisma"
import LandingNavbar from "@/components/landing/LandingNavbar"
import HeroSection from "@/components/landing/HeroSection"
import TrustStatsSection from "@/components/landing/TrustStatsSection"
import ProblemTransformationSection from "@/components/landing/ProblemTransformationSection"
import EcosystemSection from "@/components/landing/EcosystemSection"
import FeaturesBentoSection from "@/components/landing/FeaturesBentoSection"
import EvolutionaryProfileSection from "@/components/landing/EvolutionaryProfileSection"
import PlatformExperienceSection from "@/components/landing/PlatformExperienceSection"
import FAQSection from "@/components/landing/FAQSection"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/landing/Footer"
import type { PlatformBranding, LandingStats, SchoolLogo } from "@/types/landing"

export const dynamic = "force-dynamic"

const EMPTY_STATS: LandingStats = {
  schools: 0,
  students: 0,
  teachers: 0,
  classes: 0,
  parents: 0,
  enrollments: 0,
  subjects: 0,
  results: 0,
  applications: 0,
}

const DEFAULT_BRANDING: PlatformBranding = {
  name: "Cur10usX",
  description: null,
  logo: null,
  contactEmail: "suporte@cur10usx.com",
  contactPhone: null,
}

async function getData(): Promise<{
  stats: LandingStats
  branding: PlatformBranding
  schools: SchoolLogo[]
}> {
  try {
    const [
      schoolsCount,
      students,
      teachers,
      classes,
      parents,
      enrollments,
      subjects,
      results,
      applications,
      config,
      schoolsWithLogos,
    ] = await Promise.all([
      prisma.school.count({ where: { status: "ativa" } }),
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.parent.count(),
      prisma.enrollment.count(),
      prisma.subject.count(),
      prisma.result.count(),
      prisma.application.count({ where: { status: "aprovada" } }),
      prisma.platformConfig.findUnique({ where: { id: "singleton" } }),
      prisma.school.findMany({
        where: { status: "ativa", logo: { not: null } },
        select: { name: true, logo: true },
      }),
    ])

    const branding: PlatformBranding = {
      name: config?.name || "Cur10usX",
      description: config?.description || null,
      logo: config?.logo || null,
      contactEmail: config?.contactEmail || "suporte@cur10usx.com",
      contactPhone: config?.contactPhone || null,
    }

    return {
      stats: {
        schools: schoolsCount,
        students,
        teachers,
        classes,
        parents,
        enrollments,
        subjects,
        results,
        applications,
      },
      branding,
      schools: schoolsWithLogos as SchoolLogo[],
    }
  } catch {
    return {
      stats: EMPTY_STATS,
      branding: DEFAULT_BRANDING,
      schools: [],
    }
  }
}

export default async function Home() {
  const { stats, branding, schools } = await getData()

  return (
    <div className="landing-root min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text-primary)] selection:bg-[var(--landing-accent-subtle)] landing-scrollbar">
      <LandingNavbar branding={branding} />
      <main>
        <HeroSection />
        <TrustStatsSection stats={stats} schools={schools} />
        <ProblemTransformationSection />
        <EcosystemSection />
        <FeaturesBentoSection />
        <EvolutionaryProfileSection />
        <PlatformExperienceSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer branding={branding} />
    </div>
  )
}
