"use client"

import { useEffect, useState, useMemo } from "react"
import { Calendar, BookOpen, FileText, Users, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import moment from "moment"

moment.locale("pt")

interface CalendarEvent {
  id: string
  title: string
  type: "aula" | "avaliação" | "reunião" | "evento"
  date: string
  time?: string
  description?: string
  location?: string
}

export default function TeacherCalendarExperience() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    async function fetchData() {
      try {
        const [lessonsRes, examsRes, profileRes] = await Promise.all([
          fetch("/api/lessons?limit=100"),
          fetch("/api/exams?limit=50"),
          fetch("/api/profile"),
        ])

        const lessonsJson = await lessonsRes.json()
        const examsJson = await examsRes.json()
        const profileJson = await profileRes.json()

        const teacherId = profileJson.teacher?.id

        const lessonEvents: CalendarEvent[] = (lessonsJson.data || [])
          .filter((l: { teacherId?: string }) => !teacherId || l.teacherId === teacherId)
          .map((l: { id: string; subject: { name: string }; startTime: string; endTime: string; room?: string; day: string }) => ({
            id: `lesson-${l.id}`,
            title: l.subject.name,
            type: "aula" as const,
            date: getNextDateForDay(l.day).toISOString(),
            time: `${l.startTime} — ${l.endTime}`,
            location: l.room,
          }))

        const examEvents: CalendarEvent[] = (examsJson.data || [])
          .map((e: { id: string; title?: string; subject: { name: string }; date: string }) => ({
            id: `exam-${e.id}`,
            title: e.title || e.subject.name,
            type: "avaliação" as const,
            date: e.date,
            description: e.subject.name,
          }))

        setEvents([...lessonEvents, ...examEvents])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const daysInMonth = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: Date[] = []

    for (let d = firstDay; d <= lastDay; d = new Date(d.getTime() + 86400000)) {
      days.push(new Date(d))
    }

    return days
  }, [selectedDate])

  const dayEvents = useMemo(() => {
    const dateStr = selectedDate.toDateString()
    return events.filter((e) => new Date(e.date).toDateString() === dateStr)
  }, [events, selectedDate])

  const monthYear = selectedDate.toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
  })

  if (loading) {
    return (
      <div className="bg-white/60 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 p-4 sm:p-5 shadow-2xs">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-zinc-100 dark:bg-zinc-800/50" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/60 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-primary" />
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Calendário
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
            className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-[10px] font-bold"
          >
            ←
          </button>
          <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 capitalize px-1 min-w-[80px] text-center">
            {monthYear}
          </span>
          <button
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
            className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-[10px] font-bold"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: daysInMonth[0]?.getDay() || 0 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map((day) => {
          const dateStr = day.toDateString()
          const selStr = selectedDate.toDateString()
          const isSelected = dateStr === selStr
          const isToday = dateStr === new Date().toDateString()
          const dayEventCount = events.filter((e) => new Date(e.date).toDateString() === dateStr).length

          return (
            <button
              key={day.getTime()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "relative aspect-square rounded-xl text-[10px] font-semibold transition-all flex flex-col items-center justify-center",
                isSelected && "bg-primary text-primary-foreground shadow-xs",
                !isSelected && isToday && "border border-primary/40 text-primary",
                !isSelected && !isToday && "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
              )}
            >
              {day.getDate()}
              {dayEventCount > 0 && (
                <span className={cn(
                  "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full",
                  isSelected ? "bg-white" : "bg-rose-500"
                )} />
              )}
            </button>
          )
        })}
      </div>

      {dayEvents.length > 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/40 space-y-2">
          <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            {selectedDate.toLocaleDateString("pt-PT", { day: "numeric", month: "long" })}
          </p>
          {dayEvents.slice(0, 4).map((event) => (
            <div
              key={event.id}
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-xl border",
                event.type === "aula" && "bg-violet-500/5 dark:bg-violet-500/10 border-violet-200/60 dark:border-violet-900/30",
                event.type === "avaliação" && "bg-amber-500/5 dark:bg-amber-500/10 border-amber-200/60 dark:border-amber-900/30",
                event.type === "reunião" && "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-900/30",
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                event.type === "aula" && "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                event.type === "avaliação" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                event.type === "reunião" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              )}>
                {event.type === "aula" ? <BookOpen size={11} /> : event.type === "avaliação" ? <FileText size={11} /> : <Users size={11} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 truncate">{event.title}</p>
                <div className="flex items-center gap-2 text-[9px] text-zinc-400 dark:text-zinc-500">
                  {event.time && <span>{event.time}</span>}
                  {event.location && <span>· {event.location}</span>}
                </div>
              </div>
            </div>
          ))}
          {dayEvents.length > 4 && (
            <button className="w-full text-[9px] font-bold text-primary dark:text-primary-400 flex items-center justify-center gap-1 py-1 uppercase tracking-wider">
              +{dayEvents.length - 4} mais <ChevronRight size={10} />
            </button>
          )}
        </div>
      )}

      {dayEvents.length === 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/40 text-center py-4">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Nenhum evento neste dia</p>
        </div>
      )}
    </div>
  )
}

function getNextDateForDay(dayName: string): Date {
  const daysMap: Record<string, number> = {
    Domingo: 0, Segunda: 1, Terça: 2, Quarta: 3, Quinta: 4, Sexta: 5, Sábado: 6,
  }
  const targetDay = daysMap[dayName]
  if (targetDay === undefined) return new Date()

  const today = new Date()
  const currentDay = today.getDay()
  let diff = targetDay - currentDay
  if (diff < 0) diff += 7

  const next = new Date(today)
  next.setDate(today.getDate() + diff)
  return next
}
