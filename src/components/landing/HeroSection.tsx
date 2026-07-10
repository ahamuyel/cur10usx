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
    <TheInfiniteGrid className="min-h-[80vh] md:min-h-screen pt-20 md:pt-32 pb-16 md:pb-28 overflow-hidden relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[700px] h-[300px] md:h-[400px] bg-primary/10 dark:bg-primary/15 blur-[80px] md:blur-[120px] rounded-full pointer-events-none motion-reduce:hidden" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] md:text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-4 md:mb-6">
              {t("landing.hero.label")}
            </span>

            <h1 className="text-[2.5rem] leading-[1] sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-zinc-900 dark:text-zinc-50 max-w-[90vw] sm:max-w-none">
              {t("landing.hero.headline").split('\n').map((part, i, arr) => (
                <span key={i} className={`font-black ${i === 0 ? 'block' : 'block mt-1 md:mt-2'} ${i === arr.length - 1 ? 'highlight-underline text-primary' : ''}`}>
                  {part}
                </span>
              ))}
            </h1>

            <p className="mt-6 md:mt-8 max-w-xl md:max-w-2xl text-base md:text-lg lg:text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t("landing.hero.subheadline")}
            </p>

            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto px-4 sm:px-0">
              <button
                onClick={() => router.push("/registar-escola")}
                className="group inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg w-full sm:w-auto text-sm md:text-base"
              >
                {t("landing.hero.cta")}
              </button>

              <button
                onClick={() => router.push("/signup")}
                className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all w-full sm:w-auto text-sm md:text-base"
              >
                {t("landing.hero.explore")}
              </button>
            </div>

            {/* <div className="mt-8 md:mt-12 inline-flex flex-wrap justify-center items-center gap-0 divide-x divide-zinc-200 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
              {[
                { icon: School, value: stats.schools, label: t("landing.hero.stats_schools") },
                { icon: Users, value: stats.students, label: t("landing.hero.stats_students") },
              ].map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3 text-xs md:text-sm"
                >
                  <Icon size={12} className="text-primary shrink-0 md:size-[13px]" />
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {value}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {label}
                  </span>
                </div>
              ))}
            </div> */}
          </div>
        </div>
      </div>
    </TheInfiniteGrid>
  );
}
