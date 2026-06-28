"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { TheInfiniteGrid } from "@/components/ui/the-infinite-grid";
import { School, Users } from "lucide-react";
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
    <TheInfiniteGrid className="min-h-screen pt-24 md:pt-32 pb-20 md:pb-28 overflow-hidden relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/12 dark:bg-primary/18 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-6">
              {t("landing.hero.label")}
            </span>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-zinc-900 dark:text-zinc-50">
              {t("landing.hero.headline").split('\n').map((part, i, arr) => (
                <span key={i} className={`font-black ${i === 0 ? 'block' : 'block mt-2'} ${i === arr.length - 1 ? 'text-primary' : ''}`}>
                  {part}
                </span>
              ))}
            </h1>

            <p className="mt-8 max-w-2xl text-lg md:text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t("landing.hero.subheadline")}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push("/registar-escola")}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                {t("landing.hero.cta")}
              </button>

              <button
                onClick={() => router.push("/signup")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
              >
                {t("landing.hero.explore")}
              </button>
            </div>

            <div className="mt-12 inline-flex flex-wrap justify-center items-center gap-0 divide-x divide-zinc-200 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
              {[
                { icon: School, value: stats.schools, label: t("landing.hero.stats_schools") },
                { icon: Users, value: stats.students, label: t("landing.hero.stats_students") },
              ].map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-5 py-3 text-sm"
                >
                  <Icon size={13} className="text-primary shrink-0" />
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {value}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TheInfiniteGrid>
  );
}
