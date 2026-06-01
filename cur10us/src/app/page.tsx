import LandingNavbar from "@/components/landing/LandingNavbar"
import HeroSection from "@/components/landing/HeroSection"
import ProblemSection from "@/components/landing/ProblemSection"
import SolutionSection from "@/components/landing/SolutionSection"
import ImpactSection from "@/components/landing/ImpactSection"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/landing/Footer"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-bg-brand text-fg-brand overflow-x-hidden selection:bg-primary-brand/20 selection:text-primary-brand">
      <LandingNavbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <ImpactSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
