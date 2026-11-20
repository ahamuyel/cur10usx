"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Play, BookOpen, Trophy, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type PathSummary = {
  id: string;
  name: string;
  grade: string;
  subjectName: string | null;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  continueLessonId: string | null;
};

type HomeData = {
  paths: PathSummary[];
  continueLessonId: string | null;
  continuePathId: string | null;
  xp: { totalXP: number; level: number };
  streak: { currentStreak: number; longestStreak: number };
};

export default function AprenderHome() {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/learning/home");
      if (!res.ok) throw new Error("Falha ao carregar a aprendizagem");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-sm">A carregar…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center text-zinc-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!data || data.paths.length === 0) {
    return (
      <div className="py-20 text-center">
        <BookOpen className="mx-auto text-zinc-300" size={48} />
        <h1 className="mt-4 text-lg font-semibold text-zinc-800 dark:text-zinc-100">Ainda sem percursos</h1>
        <p className="mt-2 text-sm text-zinc-500">Um percurso de aprendizagem ainda não foi atribuído.</p>
      </div>
    );
  }

  const continuePath = data.continuePathId ? data.paths.find((p) => p.id === data.continuePathId) : null;

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Olá! 👋</h1>
          <p className="text-sm text-zinc-500 mt-1">Vamos continuar a aprender hoje?</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-600 dark:bg-orange-500/10">
            <Flame size={15} /> {data.streak.currentStreak}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
            <Trophy size={15} /> {data.xp.totalXP} XP
          </span>
        </div>
      </section>

      {data.continueLessonId && continuePath && (
        <Link
          href={`/aprender/licoes/${data.continueLessonId}`}
          className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <span className="text-xs uppercase tracking-wide text-zinc-400">Continuar</span>
          <span className="mt-1 block text-base font-semibold text-zinc-800 dark:text-zinc-100">
            {continuePath.subjectName ?? continuePath.name}
          </span>
          <span className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white">
            <Play size={16} /> Continuar lição
          </span>
        </Link>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-600 dark:text-zinc-400">Os teus percursos</h2>
        <div className="space-y-3">
          {data.paths.map((p) => (
            <Link
              key={p.id}
              href={`/aprender/caminhos/${p.id}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-primary/40 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-100">{p.subjectName ?? p.name}</p>
                  <p className="text-xs text-zinc-400">
                    {p.completedLessons} de {p.totalLessons} lições · {p.grade}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary">{p.progress}%</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={cn("h-full rounded-full bg-primary transition-all", p.progress >= 100 && "bg-emerald-500")}
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
