"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface TrimesterData {
  label: string;
  generalAverage: number;
}

interface StudentAcademicJourneyProps {
  trimesters: TrimesterData[];
}

export default function StudentAcademicJourney({ trimesters }: StudentAcademicJourneyProps) {
  // Análise de tendências de evolução
  const trend = useMemo(() => {
    if (!trimesters || trimesters.length === 0) return { status: "empty", diff: 0, text: "" };

    const first = trimesters[0].generalAverage;
    const last = trimesters[trimesters.length - 1].generalAverage;
    const diff = last - first;

    if (diff > 1.0) return { status: "improving", diff, text: "Estás a progredir de forma consistente. Continua assim!" };
    if (Math.abs(diff) <= 1.0) {
      const values = trimesters.map((t) => t.generalAverage)
      const isLinear = values.every((v) => Math.abs(v - values[0]) <= 0.5)
      if (isLinear) return { status: "stable", diff, text: "Média estável sem oscilações significativas. Consistência é a chave." }
      return { status: "stable", diff, text: "A tua média mantém-se estável neste ciclo letivo." }
    }
    return { status: "dropping", diff, text: "Quebra na média geral. Identifica as disciplinas com maior descida e ajusta o teu método de estudo." };
  }, [trimesters]);

  // Abreviação limpa dos labels para mobile
  const chartData = useMemo(() => {
    return trimesters.map((t) => ({
      ...t,
      shortLabel: t.label.replace(/º\s*Trimestre/i, "º Trim"),
    }));
  }, [trimesters]);

  if (trimesters.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Jornada Académica</h3>
        <p className="text-xs text-zinc-400 mb-8">Evolução da Média</p>
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 text-center py-12 italic">
          Nenhum registo de avaliação disponível.
        </p>
      </div>
    );
  }

  // Função para determinar a cor da barra dinamicamente com base na nota (Angola: >= 14 Verde, >= 10 Laranja, < 10 Vermelho)
  const getBarColor = (value: number) => {
    if (value >= 14) return "#10b981"; // Emerald-500
    if (value >= 10) return "#f59e0b"; // Amber-500
    return "#f43f5e"; // Rose-500
  };

  return (
    <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6 shadow-2xs flex flex-col justify-between h-full">
      <div>
        {/* HEADER E BADGE */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Jornada Académica
            </h3>
            <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              Evolução da Média Geral
            </p>
          </div>

          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wide uppercase",
            trend.status === "improving" && "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
            trend.status === "stable" && "text-zinc-500 bg-zinc-100 dark:bg-zinc-800/60",
            trend.status === "dropping" && "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10"
          )}>
            {trend.status === "improving" ? (
              <TrendingUp size={12} />
            ) : trend.status === "stable" ? (
              <Minus size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {trend.status === "improving" ? "Progresso" : trend.status === "stable" ? "Estável" : "Aviso"}
          </div>
        </div>
      </div>

      {/* ÁREA DO BARCHART MODERNIZADO */}
      <div className="w-full h-44 mt-6 mb-2 -ml-6 sm:-ml-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={40}>
            <XAxis 
              dataKey="shortLabel" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: 500 }}
              dy={10}
            />
            
            <YAxis 
              domain={[0, 20]} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 10, className: "tabular-nums font-medium" }}
              dx={-5}
            />

            <Tooltip 
              cursor={{ fill: "transparent" }} // Remove o background retangular cinzento ao passar o rato
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const val = Number(payload[0].value);
                  return (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 shadow-xl">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                        {payload[0].payload.label}
                      </p>
                      <p className="text-sm font-black text-white tabular-nums mt-0.5">
                        {val.toFixed(2)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Configuração das Barras com Cantos Arredondados Inteligentes ([top-left, top-right, bottom-right, bottom-left]) */}
            <Bar 
              dataKey="generalAverage" 
              radius={[10, 10, 0, 0]}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.generalAverage)} 
                  className="transition-all duration-300 hover:opacity-85"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/40 text-center">
        <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto balance leading-relaxed">
          {trend.text}
        </p>
      </div>
    </div>
  );
}