"use client"

import { useEffect, useState, useMemo } from "react"
import { Calendar, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import moment from "moment"

moment.locale("pt")

interface CalendarEvent {
  id: string
  className: string
  subjectName: string
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
          .map((l: { id: string; subject: { name: string }; class: { name: string }; startTime: string; endTime: string; room?: string; day: string }) => ({
            id: `lesson-${l.id}`,
            className: l.class?.name || "Sem Turma",
            subjectName: l.subject?.name || "Sem Disciplina",
            type: "aula" as const,
            date: getNextDateForDay(l.day).toISOString(),
            time: `${l.startTime} — ${l.endTime}`,
            location: l.room,
          }))

        const examEvents: CalendarEvent[] = (examsJson.data || [])
          .map((e: { id: string; title?: string; subject: { name: string }; class?: { name: string }; date: string }) => ({
            id: `exam-${e.id}`,
            className: e.class?.name || "Sem Turma",
            subjectName: e.title || e.subject?.name || "Avaliação",
            type: "avaliação" as const,
            date: e.date,
            description: e.subject?.name || "",
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
      <div className="bg-card border border-border p-4 sm:p-5 rounded-card shadow-card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border p-4 sm:p-5 rounded-card shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Calendário
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
            className="w-6 h-6 rounded-lg bg-muted border border-border text-muted-foreground hover:bg-accent transition-colors flex items-center justify-center text-[10px] font-bold cursor-pointer"
          >
            ←
          </button>
          <span className="text-[10px] font-bold text-muted-foreground capitalize px-1 min-w-[80px] text-center">
            {monthYear}
          </span>
          <button
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
            className="w-6 h-6 rounded-lg bg-muted border border-border text-muted-foreground hover:bg-accent transition-colors flex items-center justify-center text-[10px] font-bold cursor-pointer"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider text-center py-1">
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
                "relative aspect-square rounded-xl text-[10px] font-semibold transition-all flex flex-col items-center justify-center cursor-pointer",
                isSelected && "bg-primary text-primary-foreground shadow-card",
                !isSelected && isToday && "border border-border text-foreground",
                !isSelected && !isToday && "text-muted-foreground hover:bg-accent",
              )}
            >
              {day.getDate()}
              {dayEventCount > 0 && (
                <span className={cn(
                  "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full",
                  isSelected ? "bg-background" : "bg-rose"
                )} />
              )}
            </button>
          )
        })}
      </div>

      {dayEvents.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border space-y-2">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
            {selectedDate.toLocaleDateString("pt-PT", { day: "numeric", month: "long" })}
          </p>
          {dayEvents.slice(0, 4).map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-2.5 p-2.5 rounded-card border border-border bg-card shadow-card"
            >
              <div className={cn(
                "w-1 h-7 rounded-full shrink-0",
                event.type === "aula" && "bg-primary",
                event.type === "avaliação" && "bg-amber",
                event.type === "reunião" && "bg-emerald",
                event.type === "evento" && "bg-cyan",
              )} />
              
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-card-foreground truncate">
                  {event.className}
                </p>
                <p className="text-[9px] text-muted-foreground font-medium">
                  {event.subjectName}
                </p>
              </div>
              
              <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                {event.time && (
                  <span className="text-[10px] font-semibold text-foreground font-mono tabular-nums">
                    {event.time}
                  </span>
                )}
                {event.location && (
                  <span className="text-[9px] text-muted-foreground truncate max-w-[80px]">
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          ))}
          {dayEvents.length > 4 && (
            <button className="w-full text-[9px] font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 py-1 uppercase tracking-wider transition-colors cursor-pointer">
              +{dayEvents.length - 4} mais <ChevronRight size={10} />
            </button>
          )}
        </div>
      )}

      {dayEvents.length === 0 && (
        <div className="mt-4 pt-3 border-t border-border text-center py-4">
          <p className="text-[10px] text-muted-foreground">Nenhum evento neste dia</p>
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
