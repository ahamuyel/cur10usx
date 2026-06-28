import { prisma } from "@/lib/prisma"
import LandingNavbar from "@/components/landing/LandingNavbar"
import HeroSection from "@/components/landing/HeroSection"
import HowItWorksSection from "@/components/landing/HowItWorksSection"
import SchoolFeaturesSection from "@/components/landing/SchoolFeaturesSection"
import StudentVisionSection from "@/components/landing/StudentVisionSection"
import OriginSection from "@/components/landing/OriginSection"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/landing/Footer"
import AnimateOnScroll from "@/components/landing/AnimateOnScroll"
import type { PlatformBranding, LandingStats, SchoolLogo } from "@/types/landing"

export const dynamic = "force-dynamic"

async function getData(): Promise<{ stats: LandingStats; branding: PlatformBranding; schools: SchoolLogo[] }> {
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
}

export default async function Home() {
  const { stats, branding, schools } = await getData()

  return (
    <div className="min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text-primary)] selection:bg-primary/20 landing-scrollbar pt-16">
      <LandingNavbar branding={branding} />
      <HeroSection branding={branding} schools={schools} stats={stats} />
      <AnimateOnScroll>
        <HowItWorksSection />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <SchoolFeaturesSection />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <StudentVisionSection />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <OriginSection />
      </AnimateOnScroll>
      <CTASection />
      <Footer />
    </div>
  )
}
