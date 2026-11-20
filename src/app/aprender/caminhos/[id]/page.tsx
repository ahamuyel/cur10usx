"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Play, Check, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

type LessonNode = {
  id: string;
  title: string;
  contentType: string;
  order: number;
  progress: "not_started" | "in_progress" | "completed";
  completedAt: string | null;
  exerciseCount: number;
};

type TopicNode = {
  id: string;
  title: string;
  order: number;
  mastery: number | null;
  masteryCategory: string | null;
  lessons: LessonNode[];
};

type UnitNode = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  topics: TopicNode[];
};

type PathDetail = {
  id: string;
  name: string;
  grade: string;
  subjectName: string | null;
  progress: number;
  continueLessonId: string | null;
  units: UnitNode[];
};

function masteryColor(category: string | null): string {
  if (category === "Mastered") return "bg-emerald-500 text-emerald-50";
  if (category === "Proficient") return "bg-lime-500 text-lime-50";
  if (category === "Developing") return "bg-amber-500 text-amber-50";
  return "bg-zinc-300 text-zinc-700";
}

export default function PathPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<PathDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openUnits, setOpenUnits] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/learning/paths/${params.id}`);
      if (!res.ok) throw new Error("Percurso não encontrado");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center text-zinc-500">
        <p>{error ?? "Percurso não encontrado"}</p>
        <Link href="/aprender" className="mt-4 inline-block text-sm text-primary">
          Voltar
        </Link>
      </div>
    );
  }

  const toggleUnit = (id: string) => {
    setOpenUnits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-zinc-400">Percurso de aprendizagem</p>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{data.subjectName ?? data.name}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500">
          <span>{data.grade}</span>
          <span className="font-semibold text-primary">{data.progress}% concluído</span>
        </div>
      </div>

      <div className="space-y-3">
        {data.units.map((unit, ui) => {
          const isOpen = openUnits.has(unit.id) || (openUnits.size === 0 && ui === 0);
          return (
            <div key={unit.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <button
                onClick={() => toggleUnit(unit.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-100">{unit.title}</p>
                  {unit.description && <p className="text-xs text-zinc-400">{unit.description}</p>}
                </div>
                <ChevronDown
                  size={18}
                  className={cn("text-zinc-400 transition-transform", isOpen && "rotate-180")}
                />
              </button>

              {isOpen && (
                <div className="border-t border-zinc-100 px-4 py-2 dark:border-zinc-800">
                  {unit.topics.map((topic) => (
                    <div key={topic.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{topic.title}</p>
                        {topic.mastery !== null && (
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              masteryColor(topic.masteryCategory)
                            )}
                          >
                            {topic.masteryCategory} · {topic.mastery}%
                          </span>
                        )}
                      </div>

                      <div className="mt-2 space-y-2 pl-1">
                        {topic.lessons.map((lesson) => {
                          const isContinue = lesson.id === data.continueLessonId;
                          return (
                            <Link
                              key={lesson.id}
                              href={`/aprender/licoes/${lesson.id}`}
                              className={cn(
                                "flex items-center justify-between rounded-xl border px-3 py-2.5 transition",
                                isContinue
                                  ? "border-primary/50 bg-primary/5"
                                  : "border-zinc-100 dark:border-zinc-800 hover:border-primary/30"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {lesson.progress === "completed" ? (
                                  <Check size={18} className="shrink-0 text-emerald-500" />
                                ) : (
                                  <CircleDot size={18} className="shrink-0 text-zinc-300" />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{lesson.title}</p>
                                  <p className="text-xs text-zinc-400">
                                    {lesson.exerciseCount} exercícios
                                    {isContinue && <span className="ml-2 font-medium text-primary">Continuar</span>}
                                  </p>
                                </div>
                              </div>
                              {lesson.progress !== "completed" && (
                                <Play size={16} className="text-zinc-300" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
