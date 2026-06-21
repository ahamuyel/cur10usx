"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppAvatar from "@/components/ui/AppAvatar";
import { Loader2, GraduationCap, BarChart3, Clock, FileText } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function StudentPortfolioPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
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
      <div className="m-4 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-zinc-500">{error || "Portfólio não disponível"}</p>
      </div>
    );
  }

  const { student, results, attendance, averages } = data;
  const generalAvg = averages.length > 0
    ? Math.round((averages.reduce((acc: number, a: any) => acc + a.average, 0) / averages.length) * 10) / 10
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <AppAvatar 
            src={student.foto} 
            name={student.name} 
            className="w-32 h-32 rounded-3xl border-4 border-zinc-100 dark:border-zinc-800 shadow-md" 
          />
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">{student.name}</h1>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
              <Badge>{student.class.name}</Badge>
              <Badge variant="secondary">{student.gender}</Badge>
              <span className="text-sm text-zinc-500 self-center">
                {new Date(student.dateOfBirth).toLocaleDateString("pt")}
              </span>
            </div>
          </div>

          <Link
            href={`/list/students/${id}/certificate`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all active:scale-95"
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

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ResultsTable averages={averages} results={results} />
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
    ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400";
  return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles}`}>{children}</span>;
}

function SummaryCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-950/50"
  };
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="text-sm text-zinc-500 font-medium">{label}</p>
    </div>
  );
}

function ResultsTable({ averages, results }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
      <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Notas por Disciplina</h2>
      <div className="space-y-4">
        {averages.map((a: any) => (
          <div key={a.subjectId} className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{a.subjectName}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.average >= 10 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{a.average}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendanceSection({ attendance }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
      <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Assiduidade</h2>
      <div className="text-center mb-6">
        <span className="text-4xl font-black text-zinc-900 dark:text-zinc-50">{attendance.percent}%</span>
      </div>
      <div className="space-y-3">
        <AttendanceRow label="Presente" count={attendance.presente} total={attendance.total} color="bg-emerald-500" />
        <AttendanceRow label="Atrasado" count={attendance.atrasado} total={attendance.total} color="bg-amber-500" />
        <AttendanceRow label="Ausente" count={attendance.ausente} total={attendance.total} color="bg-rose-500" />
      </div>
    </div>
  );
}

function AttendanceRow({ label, count, total, color }: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      </div>
      <span className="font-bold">{count}</span>
    </div>
  );
}