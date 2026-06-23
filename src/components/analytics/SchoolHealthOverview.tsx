"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, AlertTriangle, ShieldAlert, UserCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatsProps {
  aproveitamento: string;
  assiduidade: string;
  risco: number;
  turmasAlerta: number;
}

export default function SchoolHealthOverview({ stats }: { stats: StatsProps | null }) {
  const ap = parseInt(stats?.aproveitamento || "0");
  const as = parseInt(stats?.assiduidade || "0");
  const risco = stats?.risco ?? 0;
  const turmasAlerta = stats?.turmasAlerta ?? 0;

  const [docenteAssiduidade, setDocenteAssiduidade] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTeacherAttendance() {
      try {
        const res = await fetch("/api/analytics/teacher-attendance");
        if (res.ok) {
          const list = await res.json();
          if (list.length > 0) {
            const sum = list.reduce((acc: number, t: any) => acc + t.attendanceRate, 0);
            const avg = sum / list.length;
            setDocenteAssiduidade(Math.round(avg * 10) / 10);
          } else {
            setDocenteAssiduidade(100);
          }
        }
      } catch (err) {
        console.error("Erro ao obter assiduidade docente:", err);
      }
    }
    fetchTeacherAttendance();
  }, []);

  const teacherAttendanceVal = docenteAssiduidade ?? 100;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* Aproveitamento — ring animado */}
      <div className="flex flex-col items-center justify-center p-5 rounded-3xl border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-lg">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.915" fill="none" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray={`${ap}, 100`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp size={20} className="text-blue-500" />
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-2xl font-black text-zinc-950 dark:text-white tabular-nums">{stats?.aproveitamento}</p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mt-0.5">Aproveitamento</p>
        </div>
      </div>

      {/* Assiduidade — ring animado */}
      <div className="flex flex-col items-center justify-center p-5 rounded-3xl border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-lg">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.915" fill="none" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${as}, 100`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Users size={20} className="text-emerald-500" />
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-2xl font-black text-zinc-950 dark:text-white tabular-nums">{stats?.assiduidade}</p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mt-0.5">Assiduidade</p>
        </div>
      </div>

      {/* Alunos em Risco — card de alerta */}
      <Link
        href="/list/students?risk=alto"
        className="flex flex-col items-center justify-center p-5 rounded-3xl border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-lg group"
      >
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            risco > 0 ? "bg-rose-50 dark:bg-rose-950/30" : "bg-emerald-50 dark:bg-emerald-950/30"
          )}>
            <AlertTriangle size={24} className={risco > 0 ? "text-rose-500" : "text-emerald-500"} />
          </div>
        </div>
        <div className="mt-3 text-center flex flex-col items-center gap-2">
          <p className="text-3xl font-bold text-zinc-950 dark:text-white tabular-nums">{risco}</p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mt-0.5">Alunos em Risco</p>
          <Badge variant={risco > 0 ? "destructive" : "success"}>
            {risco > 0 ? `${risco} aluno${risco > 1 ? "s" : ""} em risco` : "Tudo bem"}
          </Badge>
        </div>
      </Link>

      {/* Turmas em Alerta — card de alerta */}
      <Link
        href="/list/classes?alert=true"
        className="flex flex-col items-center justify-center p-5 rounded-3xl border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-lg group"
      >
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            turmasAlerta > 0 ? "bg-amber-50 dark:bg-amber-950/30" : "bg-emerald-50 dark:bg-emerald-950/30"
          )}>
            <ShieldAlert size={24} className={turmasAlerta > 0 ? "text-amber-500" : "text-emerald-500"} />
          </div>
        </div>
        <div className="mt-3 text-center flex flex-col items-center gap-2">
          <p className="text-3xl font-bold text-zinc-950 dark:text-white tabular-nums">{turmasAlerta}</p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mt-0.5">Turmas em Alerta</p>
          <Badge variant={turmasAlerta > 0 ? "warning" : "success"}>
            {turmasAlerta > 0 ? `${turmasAlerta} turma${turmasAlerta > 1 ? "s" : ""} em alerta` : "Tudo bem"}
          </Badge>
        </div>
      </Link>

      {/* Assiduidade Docente — card de alerta */}
      <Link
        href="/analytics/teacher-attendance"
        className="flex flex-col items-center justify-center p-5 rounded-3xl border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-lg group"
      >
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            teacherAttendanceVal >= 90
              ? "bg-emerald-50 dark:bg-emerald-950/30"
              : teacherAttendanceVal >= 75
              ? "bg-amber-50 dark:bg-amber-950/30"
              : "bg-rose-50 dark:bg-rose-950/30"
          )}>
            <UserCheck size={24} className={cn(
              teacherAttendanceVal >= 90
                ? "text-emerald-500"
                : teacherAttendanceVal >= 75
                ? "text-amber-500"
                : "text-rose-500"
            )} />
          </div>
        </div>
        <div className="mt-3 text-center flex flex-col items-center gap-2">
          <p className="text-2xl font-black text-zinc-950 dark:text-white tabular-nums">
            {docenteAssiduidade !== null ? `${docenteAssiduidade}%` : "100%"}
          </p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mt-0.5">Assiduidade Docente</p>
          <Badge variant={
            teacherAttendanceVal >= 90
              ? "success"
              : teacherAttendanceVal >= 75
              ? "warning"
              : "destructive"
          }>
            {teacherAttendanceVal >= 90 ? "Excelente" : teacherAttendanceVal >= 75 ? "Atenção" : "Crítico"}
          </Badge>
        </div>
      </Link>
    </div>
  );
}
