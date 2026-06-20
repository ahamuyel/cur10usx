"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Clock, MapPin, User, BookOpen, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { X } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  subjectName: string;
  date: string; // Vai receber "Segunda", "Terça", etc. vindos do mapeamento
  startTime: string;
  endTime: string;
  room?: string;
  teacher?: string;
};

interface Props {
  exams: { id: string; title: string; subjectName: string; date: string }[];
  assignments: { id: string; title: string; subjectName: string; dueDate: string }[];
}

const DAYS_OF_WEEK = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

export default function StudentAcademicAgenda({ exams, assignments }: Props) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Ingestão dinâmica de dados da API de Lições do Cur10usX
  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/lessons?limit=200");
      if (!res.ok) {
        setError(true);
        return;
      }
      
      const json = await res.json();

      // Mapeamento idêntico ao contrato da API que usavas no BigCalendar
      const mapped: Lesson[] = (json.data || []).map((lesson: any) => ({
        id: lesson.id || Math.random().toString(),
        title: lesson.subject?.name || "Aula",
        subjectName: lesson.subject?.name || "Aula",
        date: lesson.day, // Garante que bate com "Segunda", "Terça", etc.
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        room: lesson.room,
        teacher: lesson.teacher?.name,
      }));

      setLessons(mapped);
    } catch (err) {
      console.error("Erro ao carregar a agenda letiva:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return (
    <div className="w-full flex flex-col gap-4">
      
      {/* HEADER DO CONTROLADOR DO CALENDÁRIO */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Horário Semanal
          </h3>
          <span className="text-[10px] bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            SaaS Grid
          </span>
        </div>
        
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/40 rounded-xl p-0.5 border border-zinc-200/40 dark:border-zinc-700/40">
          <button className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-500 transition">
            <ChevronLeft size={14} />
          </button>
          <span className="px-2 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">Esta Semana</span>
          <button className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-500 transition">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* CONTAINER BENTO GRID NATIVO */}
      <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-5 shadow-xs overflow-x-auto">
        <div className="min-w-[700px] space-y-4">
          
          {/* Linha dos Dias da Semana */}
          <div className="grid grid-cols-5 gap-4 text-center border-b border-zinc-100 dark:border-zinc-800/40 pb-2">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wide">
                {day}
              </div>
            ))}
          </div>

          {/* Estado de Carregamento Assíncrono */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 min-h-[280px]">
              <Loader2 size={16} className="animate-spin text-violet-600 dark:text-violet-400" />
              <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Sincronizando aulas...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 min-h-[280px]">
              <p className="text-xs font-semibold text-rose-500 dark:text-rose-400">Não foi possível carregar a agenda letiva.</p>
            </div>
          ) : (
            /* O Canvas Flutuante das Aulas REAIS */
            <div className="grid grid-cols-5 gap-4 items-start min-h-[280px]">
              {DAYS_OF_WEEK.map((day) => {
                const dayLessons = lessons.filter((l) => l.date === day);

                return (
                  <div key={day} className="space-y-3 h-full min-h-[100px] rounded-2xl bg-zinc-50/30 dark:bg-zinc-900/20 p-1">
                    {dayLessons.length > 0 ? (
                      dayLessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className="w-full text-left p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 shadow-2xs hover:border-violet-500/30 dark:hover:border-violet-400/30 transition-all duration-200 group active:scale-[0.98]"
                        >
                          <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 tabular-nums">
                            {lesson.startTime} – {lesson.endTime}
                          </span>
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight mt-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
                            {lesson.title}
                          </h4>
                          
                          {lesson.room && (
                            <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mt-3">
                              <MapPin size={10} />
                              <span className="truncate">{lesson.room.split("·")[0]}</span>
                            </div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center py-8">
                        <span className="text-[10px] font-medium text-zinc-300 dark:text-zinc-700 italic">Sem aulas</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* DETALHES DA AULA */}
      <Sheet open={!!selectedLesson} onOpenChange={(open) => !open && setSelectedLesson(null)}>
        <SheetContent className="w-full sm:max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-100 dark:border-zinc-800 p-0 overflow-hidden">
          {selectedLesson && (
            <div className="flex flex-col h-full">
              <div className="h-20 w-full bg-linear-to-r from-violet-500/5 to-transparent border-b border-zinc-100 dark:border-zinc-800/60 relative">
                <SheetClose className="absolute top-5 right-5 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X size={14} />
                </SheetClose>
              </div>

              <div className="px-6 -mt-4">
                <SheetHeader className="text-left">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 mb-2">
                      Disciplina Ativa
                    </span>
                    <SheetTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                      {selectedLesson.title}
                    </SheetTitle>
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-400 border border-zinc-100 dark:border-zinc-800">
                        <Clock size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase">Horário</p>
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {selectedLesson.startTime} – {selectedLesson.endTime} ({selectedLesson.date})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-400 border border-zinc-100 dark:border-zinc-800">
                        <MapPin size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase">Sala / Local</p>
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{selectedLesson.room || "Não definida"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-400 border border-zinc-100 dark:border-zinc-800">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase">Professor</p>
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{selectedLesson.teacher || "Não atribuído"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Conteúdos Curriculares</h4>
                  <div className="p-6 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center">
                    <BookOpen size={20} className="text-zinc-300 dark:text-zinc-700 mb-2" />
                    <p className="text-[11px] font-medium text-zinc-400">Sem sumário ou planos anexados para esta aula.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
}