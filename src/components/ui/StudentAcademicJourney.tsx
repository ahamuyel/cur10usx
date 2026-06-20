"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { cn } from "@/lib/utils";

// ... [Interfaces mantidas] ...

export default function StudentAcademicJourney({ trimesters }: StudentAcademicJourneyProps) {
  const trend = useMemo(() => {
    if (!trimesters?.length) return { status: "empty", diff: 0, text: "" };
    const first = trimesters[0].generalAverage;
    const last = trimesters[trimesters.length - 1].generalAverage;
    const diff = last - first;

    if (diff > 0.5) return { status: "improving", diff, text: "Progresso consistente. Estás a subir a média!" };
    if (Math.abs(diff) <= 0.5) return { status: "stable", diff, text: "Desempenho linear. Mantém a consistência." };
    return { status: "dropping", diff, text: "Atenção: A média sofreu uma queda recente." };
  }, [trimesters]);

  const chartData = useMemo(() => trimesters.map(t => ({
    ...t,
    shortLabel: t.label.replace(/º\s*Trimestre/i, "ºT"),
  })), [trimesters]);

  const getBarColor = (val: number) => val >= 14 ? "#10b981" : val >= 10 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="bg-card backdrop-blur-xl border border-border rounded-card p-6 shadow-card flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-bold text-foreground">Jornada Académica</h3>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-0.5">Evolução do rendimento</p>
        </div>
        <div className={cn("px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1", 
          trend.status === "improving" ? "text-emerald-600 bg-emerald-50" : "text-muted-foreground bg-accent")}>
          {trend.status === "improving" ? <TrendingUp size={10} /> : <Minus size={10} />}
          {trend.status.toUpperCase()}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="shortLabel" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
            <YAxis domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
            <Tooltip 
              cursor={{ fill: "rgba(161, 161, 170, 0.1)" }}
              contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
            />
            <Bar dataKey="generalAverage" radius={[6, 6, 0, 0]} barSize={32}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.generalAverage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed italic">
          {trend.text}
        </p>
      </div>
    </div>
  );
}