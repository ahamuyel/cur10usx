"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Check, X, ArrowRight, Loader2, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Exercise = {
  id: string;
  question: string;
  type: "multiple_choice" | "fill_in_the_blank" | "true_false";
  points: number;
  options?: Array<{ key: string; text: string }> | null;
};

type Lesson = {
  id: string;
  title: string;
  contentType: string;
  curriculumTopic?: { id: string; title: string } | null;
  exercises: Exercise[];
};

type FeedBack = {
  attempt: number;
  isCorrect: boolean;
  pointsEarned: number;
  explanation: string | null;
  correctAnswer: string | null;
  lessonCompleted: boolean;
  mastery: { topic: string; score: number; category: string } | null;
};

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; feedback: FeedBack }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [typeError, setTypeError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/learning/lessons/${params.id}`);
      if (!res.ok) throw new Error("Lição não encontrada");
      const data = await res.json();
      setLesson(data);
      fetch(`/api/learning/lessons/${params.id}/start`, { method: "POST" }).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const current = lesson?.exercises[currentIndex];
  const currentFeedback = current ? answers[current.id] : undefined;
  const currentValue = currentFeedback?.value ?? "";

  const orderedOptions = useMemo(() => {
    if (!current || current.type !== "multiple_choice" || !current.options) return [];
    return current.options;
  }, [current]);

  const isAnswered = !!currentFeedback;

  const setValue = (value: string) => {
    setTypeError(null);
    setAnswers((prev) => ({ ...prev, [current!.id]: { ...(prev[current!.id] ?? { value: "" }), value } }));
  };

  const submit = async () => {
    if (!current || isAnswered) return;
    const trimmed = currentValue.trim();
    if (!trimmed) {
      setTypeError("Responde primeiro.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/learning/exercises/${current.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: trimmed }),
      });
      if (!res.ok) throw new Error("Falha ao enviar resposta");
      const feedback: FeedBack = await res.json();
      setAnswers((prev) => ({ ...prev, [current.id]: { value: trimmed, feedback } }));
    } catch (e) {
      setTypeError(e instanceof Error ? e.message : "Erro ao enviar");
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (currentIndex < (lesson?.exercises.length ?? 0) - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (error) {
    return (
      <div className="py-20 text-center text-zinc-500">
        <p>{error}</p>
        <Link href="/aprender" className="mt-4 inline-block text-sm text-primary">
          Voltar
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const allAnswered = lesson!.exercises.every((e) => !!answers[e.id]);
  const lastDone = currentIndex === (lesson?.exercises.length ?? 0) - 1 && allAnswered;

  return (
    <div className="space-y-5">
      {/* progress bar */}
      <div className="flex items-center gap-3">
        <button onClick={() => window.history.back()} className="text-sm text-zinc-400 hover:text-zinc-600">
          ←
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${lesson!.exercises.length ? ((currentIndex + 1) / lesson!.exercises.length) * 100 : 0}%` }}
          />
        </div>
        <span className="text-xs text-zinc-400">
          {currentIndex + 1}/{lesson!.exercises.length}
        </span>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-400">
          {lesson!.curriculumTopic?.title ?? "Lição"}
        </p>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{lesson!.title}</h1>
      </div>

      {lastDone ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950/30">
          <Trophy className="mx-auto text-emerald-500" size={40} />
          <p className="mt-3 text-lg font-bold text-emerald-700 dark:text-emerald-300">Lição concluída! 🎉</p>
          <Link href="/aprender" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white">
            Ver percursos <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        current && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-4 text-sm text-zinc-400">{current.points} pts</p>
            <h2 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-100">{current.question}</h2>

            <div className="mt-5 space-y-2">
              {current.type === "multiple_choice" &&
                orderedOptions.map((opt) => {
                  const chosen = currentValue === opt.key;
                  const reveal = isAnswered && chosen;
                  const correctRevealed = isAnswered && currentFeedback!.correctAnswer === opt.key && !currentFeedback!.isCorrect;
                  return (
                    <button
                      key={opt.key}
                      disabled={isAnswered}
                      onClick={() => setValue(opt.key)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition",
                        reveal
                          ? currentFeedback!.isCorrect
                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                            : "border-rose-400 bg-rose-50 dark:bg-rose-950/40"
                          : correctRevealed
                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                            : "border-zinc-200 dark:border-zinc-700 hover:border-primary/40",
                        !isAnswered && "cursor-pointer"
                      )}
                    >
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{opt.text}</span>
                      {reveal && (currentFeedback!.isCorrect ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-rose-500" />)}
                      {correctRevealed && <Check size={16} className="text-emerald-500" />}
                    </button>
                  );
                })}

              {current.type === "true_false" &&
                ["true", "false"].map((v) => {
                  const chosen = currentValue === v;
                  const reveal = isAnswered && chosen;
                  return (
                    <button
                      key={v}
                      disabled={isAnswered}
                      onClick={() => setValue(v)}
                      className={cn(
                        "w-full rounded-xl border px-4 py-3 text-sm font-medium transition",
                        reveal
                          ? currentFeedback!.isCorrect
                            ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40"
                            : "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/40"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-primary/40 text-zinc-700 dark:text-zinc-300",
                        !isAnswered && "cursor-pointer"
                      )}
                    >
                      {v === "true" ? "Verdadeiro" : "Falso"}
                    </button>
                  );
                })}

              {current.type === "fill_in_the_blank" && (
                <input
                  value={currentValue}
                  disabled={isAnswered}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Escreve a tua resposta…"
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition",
                    isAnswered
                      ? currentFeedback!.isCorrect
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                        : "border-rose-400 bg-rose-50 dark:bg-rose-950/40"
                      : "border-zinc-200 dark:border-zinc-700 focus:border-primary"
                  )}
                />
              )}
            </div>

            {typeError && <p className="mt-3 text-sm text-rose-500">{typeError}</p>}

            {isAnswered && currentFeedback && (
              <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-950/40">
                <p className={cn("font-semibold", currentFeedback.isCorrect ? "text-emerald-600" : "text-rose-500")}>
                  {currentFeedback.isCorrect ? `Correto! +${currentFeedback.pointsEarned} pts` : "Incorreto"}
                  {!currentFeedback.isCorrect && currentFeedback.correctAnswer && (
                    <span className="ml-2 font-normal text-zinc-500">· Resposta correta: {currentFeedback.correctAnswer}</span>
                  )}
                </p>
                {currentFeedback.explanation && <p className="mt-2 text-zinc-600 dark:text-zinc-400">{currentFeedback.explanation}</p>}
                {currentFeedback.mastery && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-zinc-400">
                    <Sparkles size={13} /> {currentFeedback.mastery.topic}: {currentFeedback.mastery.category} ({currentFeedback.mastery.score}%)
                  </p>
                )}
              </div>
            )}

            {!isAnswered ? (
              <button
                onClick={submit}
                disabled={submitting}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Confirmar resposta"}
              </button>
            ) : (
              currentIndex < (lesson!.exercises.length ?? 0) - 1 && (
                <button
                  onClick={next}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
                >
                  Próximo exercício <ArrowRight size={16} />
                </button>
              )
            )}
          </div>
        )
      )}
    </div>
  );
}
