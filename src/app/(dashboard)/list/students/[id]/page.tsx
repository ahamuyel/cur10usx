
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppAvatar from "@/components/ui/AppAvatar";
import { Loader2, GraduationCap, BarChart3, Clock, FileText } from "lucide-react";

interface Student {
  name: string;
  foto?: string;
  gender: string;
  dateOfBirth: string | Date;
  class: { name: string };
}

interface SubjectAverage {
  subjectId: string;
  subjectName: string;
  average: number;
}

interface Attendance {
  percent: number;
  presente: number;
  atrasado: number;
  ausente: number;
  total: number;
}

interface PortfolioData {
  student: Student;
  averages: SubjectAverage[];
  attendance: Attendance;
  results: any; // Mantido flexível caso mude a estrutura interna
}

export default function StudentPortfolioPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/students/${id}/portfolio`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Erro ao carregar portfólio"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="m-4 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center max-w-2xl mx-auto">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {error || "Portfólio não disponível"}
        </p>
      </div>
    );
  }

  const { student, attendance, averages } = data;
  const generalAvg = averages.length > 0
    ? Math.round((averages.reduce((acc, a) => acc + a.average, 0) / averages.length) * 10) / 10
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Responsivo */}
      <header className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <AppAvatar 
            src={student.foto} 
            name={student.name} 
            className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl border-4 border-zinc-100 dark:border-zinc-800 shadow-md flex-shrink-0" 
          />
          
          <div className="flex-1 text-center md:text-left min-w-0 w-full">
            <h1 className="text-xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight truncate">
              {student.name}
            </h1>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center mt-3">
              <Badge>{student.class.name}</Badge>
              <Badge variant="secondary">{student.gender}</Badge>
              <span className="text-xs md:text-sm text-zinc-500 font-medium">
                {new Date(student.dateOfBirth).toLocaleDateString("pt")}
              </span>
            </div>
          </div>

          <Link
            href={`/list/students/${id}/certificate`}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 rounded-xl md:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all active:scale-98 mt-2 md:mt-0"
          >
            <FileText size={18} /> Certificado
          </Link>
        </div>
      </header>

      {/* Grid de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard icon={GraduationCap} label="Média Geral" value={generalAvg.toString()} color="indigo" />
        <SummaryCard icon={Clock} label="Assiduidade" value={`${attendance.percent}%`} color="emerald" />
        <SummaryCard icon={BarChart3} label="Disciplinas" value={averages.length.toString()} color="amber" />
      </div>

      {/* Conteúdo Principal Adaptável */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ResultsTable averages={averages} />
        </div>
        <div className="xl:col-span-1">
          <AttendanceSection attendance={attendance} />
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTES ---

function Badge({ children, variant = "primary" }: { children: React.ReactNode, variant?: "primary" | "secondary" }) {
  const styles = variant === "primary" 
    ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30"
    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-transparent";
  return (
    <span className={`px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${styles}`}>
      {children}
    </span>
  );
}

interface SummaryCardProps {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  value: string;
  color: "indigo" | "emerald" | "amber";
}

function SummaryCard({ icon: Icon, label, value, color }: SummaryCardProps) {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-950/50"
  };
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm flex items-center sm:block gap-4 sm:gap-0">
      <div className={`w-12 h-12 rounded-xl md:rounded-2xl flex items-center justify-center sm:mb-4 flex-shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">{value}</p>
        <p className="text-xs md:text-sm text-zinc-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ResultsTable({ averages }: { averages: SubjectAverage[] }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm">
      <h2 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-4 uppercase tracking-wider">Notas por Disciplina</h2>
      <div className="space-y-2.5">
        {averages.length === 0 ? (
          <p className="text-xs text-zinc-400 italic py-2">Nenhum registo de nota encontrado.</p>
        ) : (
          averages.map((a) => (
            <div key={a.subjectId} className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/40 gap-4">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                {a.subjectName}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 border ${
                a.average >= 10 
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" 
                  : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30"
              }`}>
                {a.average}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AttendanceSection({ attendance }: { attendance: Attendance }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm flex flex-col h-full">
      <h2 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-4 uppercase tracking-wider">Assiduidade</h2>
      <div className="text-center my-auto py-4 sm:py-6">
        <span className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          {attendance.percent}%
        </span>
      </div>
      <div className="space-y-3 mt-auto">
        <AttendanceRow label="Presente" count={attendance.presente} color="bg-emerald-500" />
        <AttendanceRow label="Atrasado" count={attendance.atrasado} color="bg-amber-500" />
        <AttendanceRow label="Ausente" count={attendance.ausente} color="bg-rose-500" />
      </div>
    </div>
  );
}

interface AttendanceRowProps {
  label: string;
  count: number;
  color: string;
}

function AttendanceRow({ label, count, color }: AttendanceRowProps) {
  return (
    <div className="flex items-center justify-between text-sm py-0.5">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-zinc-600 dark:text-zinc-400 font-medium">{label}</span>
      </div>
      <span className="font-bold text-zinc-800 dark:text-zinc-200">{count}</span>
    </div>
  );
}
