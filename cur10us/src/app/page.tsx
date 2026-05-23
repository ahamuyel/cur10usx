import { prisma } from "@/lib/prisma";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import StatsSection from "@/components/landing/StatsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StudentExperienceSection from "@/components/landing/StudentExperienceSection";
import TeacherParentSection from "@/components/landing/TeacherParentSection";
import PartnersSection from "@/components/landing/PartnersSection";
import VisionSection from "@/components/landing/VisionSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { PlatformBranding } from "@/types/landing";

export const dynamic = "force-dynamic";

async function getData() {
  const [schoolsCount, students, teachers, classes, config, topSchools] =
    await Promise.all([
      prisma.school.count({ where: { status: "ativa" } }),
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.platformConfig.findUnique({
        where: { id: "singleton" },
      }),
      prisma.school.findMany({
        where: { status: "ativa" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { name: true },
      }),
    ]);

  const branding: PlatformBranding = {
    name: config?.name || "Cur10usX",
    description: config?.description || null,
    logo: config?.logo || null,
    contactEmail: config?.contactEmail || "suporte@cur10usx.com",
    contactPhone: config?.contactPhone || null,
  };

  return {
    stats: { schools: schoolsCount, students, teachers, classes },
    branding,
    topSchools,
  };
}

export default async function Home() {
  const { stats, branding, topSchools } = await getData();

  return (
    <main className="min-h-screen text-warm-900 dark:text-warm-100 scroll-smooth">
      <LandingNavbar branding={branding} />
      <HeroSection branding={branding} schools={topSchools} />
      <ProblemSection />
      <StatsSection {...stats} />
      <FeaturesSection />
      <StudentExperienceSection />
      <TeacherParentSection />
      <PartnersSection />
      <VisionSection />
      <CTASection />
      <Footer branding={branding} />
    </main>
  );
}
