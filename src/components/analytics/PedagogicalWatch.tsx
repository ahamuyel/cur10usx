"use client";

import { useState, useMemo } from "react";
import {
  MessageSquare, AlertCircle, ChevronRight, Loader2, Send, History, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

type RiskStudent = {
  id: string;
  name: string;
  reason: string;
  level?: string;
};

type Priority = 1 | 2 | 3;

function getPriority(s: RiskStudent): Priority {
  const r = (s.reason || "").toLowerCase();
  const l = (s.level || "").toLowerCase();
  if (l === "crítico" || l === "critico" || r.includes("absentismo")) return 1;
  if (r.includes("trabalho") || r.includes("entrega")) return 2;
  return 3;
}

const priorityConfig: Record<Priority, { dot: string; label: string; ring: string }> = {
  1: { dot: "bg-rose-500", label: "Prioridade 1 — Intervenção imediata", ring: "ring-rose-200 dark:ring-rose-900" },
  2: { dot: "bg-amber-400", label: "Prioridade 2 — Atenção pedagógica", ring: "ring-amber-200 dark:ring-amber-900" },
  3: { dot: "bg-zinc-300 dark:bg-zinc-600", label: "Prioridade 3 — Acompanhamento geral", ring: "ring-zinc-200 dark:ring-zinc-800" },
};

export default function PedagogicalWatch({ students = [] }: { students: any[] }) {
  const [selectedStudent, setSelectedStudent] = useState<RiskStudent | null>(null);
  const [convocationNote, setConvocationNote] = useState("");
  const [sending, setSending] = useState(false);
  const [accompanying, setAccompanying] = useState<Set<string>>(new Set());
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [studentHistory, setStudentHistory] = useState<any>(null);
  const [sheetError, setSheetError] = useState("");

  const sorted = useMemo(() => {
    if (!students || students.length === 0) return [];
    return [...students]
      .map((s) => ({ ...s, priority: getPriority(s) } as RiskStudent & { priority: Priority }))
      .sort((a, b) => a.priority - b.priority);
  }, [students]);

  const openSheet = async (student: RiskStudent) => {
    setSelectedStudent(student);
    setConvocationNote("");
    setSheetError("");
    setStudentHistory(null);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/students/${student.id}/history`);
      if (res.ok) {
        const data = await res.json();
        setStudentHistory(data);
      }
    } catch {
      // silent
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendConvocation = async () => {
    if (!selectedStudent || !convocationNote.trim()) return;
    setSending(true);
    setSheetError("");
    try {
      const res = await fetch(`/api/students/${selectedStudent.id}/convocation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: convocationNote.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSheetError(data.error || "Erro ao enviar convocatória");
        return;
      }
      setAccompanying((prev) => new Set(prev).add(selectedStudent.id));
      setSelectedStudent(null);
      setConvocationNote("");
    } catch {
      setSheetError("Erro de conexão");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-500" />
            Atenção Pedagógica
          </h3>
          <span className="text-[10px] font-bold uppercase text-zinc-400">
            {students.length} Pendentes
          </span>
        </div>

        <div className="space-y-3">
          {sorted.length > 0 ? (
            sorted.map((student) => {
              const isAccompanying = accompanying.has(student.id);
              return (
                <div
                  key={student.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                    isAccompanying
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/20"
                      : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-700/50 hover:border-zinc-200 dark:hover:border-zinc-600"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-2 transition-colors",
                            isAccompanying
                              ? "bg-emerald-100 dark:bg-emerald-950/50 ring-emerald-200 dark:ring-emerald-900"
                              : `bg-zinc-100 dark:bg-zinc-800 ${priorityConfig[student.priority ?? 3].ring}`
                          )}>
                            {isAccompanying ? (
                              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <span className={cn(
                                "w-2 h-2 rounded-full",
                                priorityConfig[student.priority ?? 3].dot
                              )} />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[11px]">
                          {isAccompanying ? "Em acompanhamento" : priorityConfig[student.priority ?? 3].label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-100 truncate">
                          {student.name}
                        </p>
                        {isAccompanying && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
                            Acompanhamento
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{student.reason}</p>
                    </div>
                  </div>

                  {!isAccompanying && (
                    <button
                      onClick={() => openSheet(student)}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 px-3 py-1.5 rounded-lg transition-colors shrink-0 ml-2"
                    >
                      <MessageSquare size={12} />
                      <span className="hidden sm:inline">Convocar</span>
                      <ChevronRight size={12} className="sm:hidden" />
                    </button>
                  )}

                  {isAccompanying && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium shrink-0 ml-2">
                      Acompanhado
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle size={20} className="text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Tudo sob controlo.</p>
              <p className="text-[11px] text-zinc-400">Nenhum aluno requer atenção imediata.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sheet de Convocatória */}
      <Sheet open={!!selectedStudent} onOpenChange={(open) => { if (!open) { setSelectedStudent(null); setConvocationNote(""); setSheetError(""); } }}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {selectedStudent?.name?.charAt(0) ?? "?"}
                  </span>
                </div>
                <div className="min-w-0">
                  <SheetTitle className="text-base truncate">{selectedStudent?.name}</SheetTitle>
                  <SheetDescription className="text-[11px] truncate">
                    {selectedStudent?.reason}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Histórico resumido */}
              <div>
                <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <History size={12} />
                  Histórico de ocorrências
                </h4>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 size={16} className="animate-spin text-zinc-400" />
                  </div>
                ) : studentHistory ? (
                  <div className="space-y-2">
                    {studentHistory.recentResults?.slice(0, 3).map((r: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{r.subject?.name}</span>
                        <span className={cn(
                          "text-xs font-bold tabular-nums",
                          r.score >= 10 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                          {r.score} / 20
                        </span>
                      </div>
                    ))}
                    {(!studentHistory.recentResults || studentHistory.recentResults.length === 0) && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">Nenhum resultado recente.</p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <AlertCircle size={12} />
                      Faltas: {studentHistory.attendance?.ausente ?? 0} | 
                      Presenças: {studentHistory.attendance?.presente ?? 0}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Erro ao carregar histórico.</p>
                )}
              </div>

              {/* Campo de texto para nota da convocatória */}
              <div>
                <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Nota da convocatória
                </h4>
                <textarea
                  value={convocationNote}
                  onChange={(e) => setConvocationNote(e.target.value)}
                  placeholder="Descreva o motivo da convocatória..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary transition resize-none"
                />
                {sheetError && (
                  <p className="text-xs text-rose-500 mt-1">{sheetError}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleSendConvocation}
                disabled={sending || !convocationNote.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-700 transition disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {sending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {sending ? "A enviar..." : "Enviar convocatória"}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
