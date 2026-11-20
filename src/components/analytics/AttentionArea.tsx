"use client";

import { useEffect, useState, useMemo } from "react";
import { AlertTriangle, Inbox, Bell, CheckCircle2, Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- Interfaces ---
interface Briefing {
  risk?: {
    summary: { [key: string]: number };
  };
  classes?: {
    totalUnderMonitoring?: number;
    criticalCount?: number;
    atRiskCount?: number;
  };
  operational?: {
    pendingApplications?: number;
  };
}

// --- Lógica de Insight ---
function computeInsight(briefing?: Briefing): string {
  if (!briefing) return "Aguardando dados...";
  const parts: string[] = [];

  const critical = briefing.risk?.summary?.["Crítico"] ?? 0;
  const altoRisco = briefing.risk?.summary?.["Alto Risco"] ?? 0;
  const monitoring = briefing.classes?.totalUnderMonitoring ?? 0;

  if (critical > 0) parts.push(`${critical} aluno${critical > 1 ? "s" : ""} em risco crítico.`);
  if (altoRisco > 0) parts.push(`${altoRisco} aluno${altoRisco > 1 ? "s" : ""} em alto risco.`);
  if (monitoring > 0) parts.push(`${monitoring} turma${monitoring > 1 ? "s" : ""} em monitorização.`);
  
  return parts.length > 0 ? parts.join(" ") : "Nenhuma pendência prioritária identificada.";
}

export default function AttentionArea({ briefing }: { briefing?: Briefing }) {
  const [loading, setLoading] = useState(true);
  const insightText = useMemo(() => computeInsight(briefing), [briefing]);

  useEffect(() => {
    // Simula um tempo de carregamento para animação suave
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 rounded-3xl bg-zinc-100 dark:bg-zinc-800 animate-pulse border border-zinc-200 dark:border-zinc-700" />
    );
  }

  const sections = [
    {
      title: "Intervenção Imediata",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-100 dark:bg-rose-950/50",
      icon: AlertTriangle,
      items: [
        briefing?.risk?.summary["Crítico"] && { label: "Alunos em Risco Crítico", value: briefing.risk.summary["Crítico"], href: "/list/students?risk=critico" },
        briefing?.classes?.criticalCount && { label: "Turmas em Aproveitamento Crítico", value: briefing.classes.criticalCount, href: "/list/classes" }
      ].filter(Boolean)
    },
    {
      title: "Atenção Pedagógica",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-950/50",
      icon: Bell,
      items: [
        briefing?.risk?.summary["Alto Risco"] && { label: "Alunos em Alto Risco", value: briefing.risk.summary["Alto Risco"], href: "/list/students?risk=alto" },
        briefing?.classes?.atRiskCount && { label: "Turmas em Observação", value: briefing.classes.atRiskCount, href: "/list/classes" }
      ].filter(Boolean)
    },
    {
      title: "Operação e Secretaria",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-950/50",
      icon: Inbox,
      items: [
        briefing?.operational?.pendingApplications && { label: "Candidaturas Pendentes", value: briefing.operational.pendingApplications, href: "/list/applications" }
      ].filter(Boolean)
    }
  ].filter(s => s.items.length > 0);

  const isEmpty = sections.length === 0;

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-8 transition-colors duration-300">
      
      {/* Banner de Insight */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-700/50 flex gap-4">
        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
          <Lightbulb size={20} />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Destaque do Dia</h4>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{insightText}</p>
        </div>
      </div>

      {/* Grid de Ações */}
      {isEmpty ? (
        <div className="text-center py-12 text-emerald-600 dark:text-emerald-500 flex flex-col items-center gap-3">
          <CheckCircle2 size={40} />
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">Tudo em conformidade!</p>
          <p className="text-sm text-zinc-500">Nenhuma ação prioritária pendente no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <section.icon size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider">{section.title}</h3>
              </div>
              
              <div className="space-y-3">
                {section.items.map((item: any, i) => (
                  <Link 
                    key={i} 
                    href={item.href} 
                    className="group flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all hover:border-zinc-200 dark:hover:border-zinc-600"
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg", section.bg, section.color)}>
                      {item.value}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{item.label}</p>
                    </div>
                    <ArrowRight size={16} className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}