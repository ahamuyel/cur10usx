"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { TheInfiniteGrid } from "@/components/ui/the-infinite-grid";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { Play } from "lucide-react";
import type {
  PlatformBranding,
  SchoolLogo,
  LandingStats,
} from "@/types/landing";

type Props = {
  branding?: PlatformBranding;
  schools?: SchoolLogo[];
  stats: LandingStats;
};

export default function HeroSection({
  schools: rawSchools = [],
  stats,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation();

  const schools = Array.isArray(rawSchools) ? rawSchools : [];

  return (
    <TheInfiniteGrid className="min-h-[90dvh] md:min-h-screen pt-20 md:pt-28 pb-16 md:pb-24 overflow-hidden relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[300px] md:h-[400px] bg-primary/8 dark:bg-primary/12 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center w-full">

            <h1 className="text-[clamp(2.25rem,8vw,5rem)] md:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-zinc-900 dark:text-zinc-50 font-black max-w-4xl">
              {t("landing.hero.headline").split('\n').map((part, i, arr) => (
                <span key={i} className={`block ${i > 0 ? 'mt-1 md:mt-2' : ''} ${i === arr.length - 1 ? 'text-primary' : ''}`}>
                  {part}
                </span>
              ))}
            </h1>

            <p className="mt-5 md:mt-6 max-w-xl md:max-w-2xl text-base md:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed px-2">
              {t("landing.hero.subheadline")}
            </p>

            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto px-4 sm:px-0">
              <button
                onClick={() => router.push("/registar-escola")}
                className="group inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm md:text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg min-h-[48px]"
              >
                {t("landing.hero.cta")}
              </button>

              <button
                onClick={() => router.push("/signup")}
                className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold text-sm md:text-base hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all min-h-[48px]"
              >
                <Play size={14} className="fill-current shrink-0" />
                {t("landing.hero.explore")}
              </button>
            </div>

            {/* Dashboard preview */}
            {schools.length > 0 && (
              <div className="mt-12 md:mt-16 w-full max-w-5xl mx-auto px-0">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-2xl blur-xl" />
                  <div className="relative border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] rounded-xl overflow-hidden shadow-lg">
                    <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--landing-border)] bg-[var(--landing-bg-secondary)]">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="ml-3 text-[10px] text-[var(--landing-text-dim)] font-mono">cur10usx.com/dashboard</span>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-[var(--landing-border)]">
                      {[
                        { label: "Alunos", value: stats.students, change: "+12%" },
                        { label: "Professores", value: stats.teachers, change: "+5%" },
                        { label: "Turmas", value: stats.classes, change: "+8%" },
                        { label: "Presenças", value: "94%", change: "+2%" },
                        { label: "Média", value: "14.2", change: "+0.4" },
                        { label: "Notificações", value: stats.applications || "0", change: "+3" },
                      ].map((item) => (
                        <div key={item.label} className="bg-[var(--landing-bg)] p-3 md:p-4">
                          <p className="text-[10px] md:text-xs text-[var(--landing-text-dim)] mb-1 truncate">{item.label}</p>
                          <p className="text-base md:text-lg font-bold text-[var(--landing-text-primary)]">{item.value.toLocaleString()}</p>
                          <p className="text-[10px] text-emerald-500">{item.change}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TheInfiniteGrid>
  );
}
