"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  User,
  BookOpen,
  Calendar as CalendarIcon,
  ChevronRight,
  LayoutGrid,
  Target,
  Loader2,
  Trophy,
  ClipboardList,
} from "lucide-react";
import moment from "moment";
// import "moment/locale/pt-br"

// Importação do nosso novo calendário nativo focado em Bento Grid
import StudentAcademicAgenda from "./StudentAcademicAgenda";

moment.locale("pt-br");

interface Lesson {
  id: string;
  subject: { name: string };
  teacher: { name: string };
  room: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface DashboardData {
  student: {
    id: string;
    name: string;
    class: { name: string; grade: number } | null;
  };
  upcomingExams: {
    id: string;
    title: string;
    subjectName: string;
    date: string;
  }[];
  upcomingAssignments: {
    id: string;
    title: string;
    subjectName: string;
    dueDate: string;
  }[];
}

export default function StudentCalendarExperience() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(new Date());

  // Atualiza o relógio interno a cada minuto para o cálculo da aula ativa/seguinte
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(false);
        const [lessonsRes, profileRes] = await Promise.all([
          fetch("/api/lessons?limit=200"),
          fetch("/api/profile"),
        ]);

        if (!lessonsRes.ok || !profileRes.ok) {
          setError(true);
          return;
        }

        const lessonsJson = await lessonsRes.json();
        const profileJson = await profileRes.json();

        setLessons(lessonsJson.data || []);

        if (profileJson.student?.id) {
          const dashRes = await fetch(
            `/api/students/${profileJson.student.id}/dashboard`,
          );
          if (!dashRes.ok) {
            setError(true);
            return;
          }
          const dashJson = await dashRes.json();
          setDashboardData(dashJson);
        }
      } catch (err) {
        console.error("Error fetching calendar experience data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Motor analítico do painel: descobre o estado atual e o que vem a seguir
  const currentAndNext = useMemo(() => {
    if (lessons.length === 0) return { current: null, next: null };

    const daysMap: Record<number, string> = {
      1: "Segunda",
      2: "Terça",
      3: "Quarta",
      4: "Quinta",
      5: "Sexta",
      6: "Sábado",
      0: "Domingo",
    };

    const currentDay = daysMap[now.getDay()];
    const currentTime = moment(now).format("HH:mm");

    const todayLessons = lessons
      .filter((l) => l.day === currentDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const current = todayLessons.find(
      (l) => currentTime >= l.startTime && currentTime <= l.endTime,
    );

    const next = todayLessons.find((l) => l.startTime > currentTime);

    return { current, next };
  }, [lessons, now]);

  // Totalizador dinâmico de aulas baseado no dia atual real do sistema
  const totalLessonsToday = useMemo(() => {
    const daysMap: Record<number, string> = {
      1: "Segunda",
      2: "Terça",
      3: "Quarta",
      4: "Quinta",
      5: "Sexta",
      6: "Sábado",
      0: "Domingo",
    };
    const currentDay = daysMap[now.getDay()];
    return lessons.filter((l) => l.day === currentDay).length;
  }, [lessons, now]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Sincronizando Centro de Comando...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] text-center">
        <p className="text-xs font-semibold text-rose-500">
          Não foi possível carregar a agenda letiva.
        </p>
      </div>
    );
  }

  const { current, next } = currentAndNext;

  const daysMap: Record<number, string> = {
    1: "Segunda",
    2: "Terça",
    3: "Quarta",
    4: "Quinta",
    5: "Sexta",
    6: "Sábado",
    0: "Domingo",
  };
  const currentDay = daysMap[now.getDay()];
  const currentTime = moment(now).format("HH:mm");
  const todayLessons = lessons
    .filter((l) => l.day === currentDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const nextLessonToday = todayLessons.find((l) => l.startTime > currentTime);

  return (
    <div className="w-full space-y-8 animate-fade-in pb-20">
      {/* 1. SEÇÃO AGORA (CONTEXTO IMEDIATO) */}

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Agenda de Avaliações: Ocupa 4 colunas no desktop */}
        <aside className="lg:col-span-4 w-full">
          <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-[2rem] p-6 border border-zinc-100 dark:border-zinc-800/60 shadow-xs h-full">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6">
              Agenda de Avaliações
            </h3>

            <div className="space-y-6">
              {/* EXAMS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    Provas
                  </span>
                  <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md tabular-nums">
                    {dashboardData?.upcomingExams.length || 0}
                  </span>
                </div>
                {dashboardData?.upcomingExams &&
                dashboardData.upcomingExams.length > 0 ? (
                  dashboardData.upcomingExams.slice(0, 3).map((exam) => (
                    <div
                      key={exam.id}
                      className="group relative bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-2xs hover:border-rose-500/30 dark:hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-1">
                        {exam.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                        <span>{exam.subjectName}</span>
                        <span className="tabular-nums">
                          {moment(exam.date).format("DD MMM")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-zinc-400 italic pl-1">
                    Sem exames marcados.
                  </p>
                )}
              </div>

              {/* ASSIGNMENTS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    Tarefas
                  </span>
                  <span className="text-[10px] font-black text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-md tabular-nums">
                    {dashboardData?.upcomingAssignments.length || 0}
                  </span>
                </div>
                {dashboardData?.upcomingAssignments &&
                dashboardData.upcomingAssignments.length > 0 ? (
                  dashboardData.upcomingAssignments.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="group relative bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-2xs hover:border-violet-500/30 dark:hover:border-violet-500/20 transition-all duration-200 cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-1">
                        {task.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                        <span>{task.subjectName}</span>
                        <span className="tabular-nums">
                          {moment(task.dueDate).format("DD MMM")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-zinc-400 italic pl-1">
                    Sem tarefas pendentes.
                  </p>
                )}
              </div>
            </div>

            <button className="w-full mt-8 py-3.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-widest hover:opacity-95 transition-all flex items-center justify-center gap-2">
              Ver Agenda Completa
              <ChevronRight size={14} />
            </button>
          </div>
        </aside>
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div
                key="current"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative overflow-hidden bg-zinc-950 dark:bg-white rounded-[2rem] p-6 sm:p-8 text-white dark:text-zinc-950 shadow-2xl"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Clock size={120} strokeWidth={1} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                        Aula em Curso
                      </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none">
                      {current.subject.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold opacity-80">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {current.room}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={14} />
                        {current.teacher.name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {current.startTime} – {current.endTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                      Tempo Restante
                    </span>
                    <div className="text-4xl font-black tabular-nums tracking-tighter">
                      {moment(current.endTime, "HH:mm").diff(
                        moment(now),
                        "minutes",
                      )}{" "}
                      min
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : next ? (
              <motion.div
                key="next"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative overflow-hidden bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 rounded-[2rem] p-6 sm:p-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                      <CalendarIcon size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                        Próxima Aula
                      </span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none">
                      {next.subject.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {next.room}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        Começa às {next.startTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                      Inicia em
                    </span>
                    <div className="text-4xl font-black tabular-nums tracking-tighter text-zinc-900 dark:text-white">
                      {moment(next.startTime, "HH:mm").diff(
                        moment(now),
                        "minutes",
                      )}{" "}
                      min
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] px-6 py-3 flex items-center justify-center gap-4 min-h-[80px]"
              >
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex-shrink-0">
                  <Target size={16} />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Sem mais aulas hoje
                  </h2>
                  {nextLessonToday && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Próxima: {nextLessonToday.subject.name},{" "}
                      {moment(nextLessonToday.startTime, "HH:mm").format(
                        "ddd DD MMM",
                      )}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
