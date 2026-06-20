import { BookOpen, Users, Bell, CalendarCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

type Props = {
  data: NonNullable<TeacherDashboardData>
}

export default function TeacherHero({ data }: Props) {
  const greeting = new Date().getHours() < 12 ? "Bom dia" : "Boa tarde"
  
  const items = [
    { label: "Aulas", value: data.upcomingLessons?.length ?? 0, icon: BookOpen, color: "text-violet-600" },
    { label: "Por Corrigir", value: data.summary.totalExamsToGrade, icon: Bell, color: "text-amber-600" },
    { label: "Atenção", value: data.summary.totalStudentsAttention, icon: Users, color: "text-rose-600" },
    { label: "Reuniões", value: data.summary.totalMeetings, icon: CalendarCheck, color: "text-emerald-600" },
  ]

  return (
    // Adicionamos classes de animação nativas do Tailwind/TailwindCSS Animate
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="animate-in fade-in slide-in-from-left-4 duration-1000 delay-200">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {greeting}, Prof. {data.teacher.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Gestão de {data.summary.totalStudents} alunos em {data.summary.totalClasses} turmas.
          </p>
          
          <div className={cn(
            "mt-4 inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full",
            data.summary.studentsAtRisk > 0 
              ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300" 
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          )}>
            {data.summary.studentsAtRisk > 0 
              ? `${data.summary.studentsAtRisk} alunos precisam de atenção` 
              : "Rendimento estável"}
          </div>
        </div>

        {/* Grid animado com delay */}
        <div className="grid grid-cols-2 gap-3 animate-in fade-in zoom-in-95 duration-700 delay-300">
          {items.map((item) => (
            <div key={item.label} className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-2 mb-2 text-zinc-400">
                <item.icon size={16} className={item.color} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              </div>
              <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}