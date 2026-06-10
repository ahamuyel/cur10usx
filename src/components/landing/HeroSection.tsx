"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n";
import { TheInfiniteGrid } from "@/components/ui/the-infinite-grid";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { School, Users, BarChart3, Play } from "lucide-react";
import type {
  PlatformBranding,
  SchoolLogo,
  LandingStats,
} from "@/types/landing";

type Props = {
  branding?: PlatformBranding;
  schools?: SchoolLogo[];
  stats: LandingStats;
  locale?: string;
};

export default function HeroSection({
  schools: rawSchools = [],
  stats,
  locale = "pt",
}: Props) {
  const router = useRouter();
  const { t } = useTranslation(locale);

  const schools = Array.isArray(rawSchools) ? rawSchools : [];

  return (
    <TheInfiniteGrid className="min-h-screen pt-24 md:pt-32 pb-20 md:pb-28 overflow-hidden relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/12 dark:bg-primary/18 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-xs text-zinc-500 dark:text-zinc-400 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {stats.schools}
              </span>
              <span>escolas angolanas já utilizam</span>
            </div> */}

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-zinc-900 dark:text-zinc-50">
              <span className="font-black block">O Sistema Operacional</span>

              <span className="font-black text-primary block mt-2">
                da Sua Escola
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg md:text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Substitua planilhas, cadernetas e grupos de WhatsApp por uma
              plataforma única. Alunos, professores, avaliações e relatórios —
              tudo centralizado num só lugar.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push("/registar-escola")}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                Solicitar Demonstração
              </button>

              <button
                onClick={() => router.push("/signup")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
              >
                <Play size={14} className="fill-current" />
                Ver Produto em 60s
              </button>
            </div>

            <div className="mt-12 inline-flex flex-wrap justify-center items-center gap-0 divide-x divide-zinc-200 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
              {[
                { icon: School, value: stats.schools, label: "escolas" },
                { icon: Users, value: stats.students, label: "alunos" },
                { icon: BarChart3, value: stats.results, label: "avaliações" },
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

        {/* ── Logo carousel ───────────────────────────────────────────────── */}
        {schools.length > 0 && (
          <div className="mt-20 md:mt-28">
            <p className="text-center text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600 mb-6">
              {t("landing.hero.trusted_by")}
            </p>

            <div className="relative h-[50px] overflow-hidden">
              <InfiniteSlider duration={35} gap={56}>
                {schools.map((school, i) => (
                  <div
                    key={i}
                    className="flex h-[50px] w-36 items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                  >
                    {school.logo ? (
                      <img
                        src={school.logo}
                        alt={school.name || "School Logo"}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs font-medium text-zinc-400">
                        {school.name}
                      </span>
                    )}
                  </div>
                ))}
              </InfiniteSlider>

              <ProgressiveBlur
                className="absolute left-0 top-0 h-full w-24 z-20 pointer-events-none"
                direction="left"
                blurIntensity={1}
              />
              <ProgressiveBlur
                className="absolute right-0 top-0 h-full w-24 z-20 pointer-events-none"
                direction="right"
                blurIntensity={1}
              />
            </div>
          </div>
        )}
      </div>
    </TheInfiniteGrid>
  );
}
