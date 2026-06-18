"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Calendar, momentLocalizer, View, Views, ToolbarProps } from "react-big-calendar";
import moment from "moment";
import { ChevronLeft, ChevronRight, X, Loader2, MapPin, User, Clock, BookOpen, Users } from "lucide-react";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/big-calendar.css";
import "moment/locale/pt-br";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

moment.locale("pt-br");
const localizer = momentLocalizer(moment);

type CalendarEvent = {
  title?: string;
  start: Date;
  end: Date;
  type?: string;
  teacher?: string;
  room?: string;
  className?: string;
};

const COLORS = ["#8b5cf6", "#10b981", "#f43f5e", "#3b82f6", "#06b6d4", "#6366f1", "#ec4899"];

const DAY_MAP: Record<string, number> = {
  Segunda: 1, Terça: 2, Quarta: 3, Quinta: 4, Sexta: 5,
};

const views = [
  { key: Views.WORK_WEEK, label: "Semana" },
  { key: Views.DAY, label: "Dia" },
];

const CalendarHeader: React.FC<ToolbarProps<CalendarEvent, object>> = ({ date, view, onView, onNavigate }) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-4 mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 capitalize">
          {moment(date).format("MMMM YYYY")}
        </h2>
        <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl p-0.5 border border-zinc-200/40 dark:border-zinc-700/40">
          <button onClick={() => onNavigate("PREV")} className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-500 transition">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => onNavigate("TODAY")} className="px-2 py-0.5 text-[10px] font-semibold rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition">
            Hoje
          </button>
          <button onClick={() => onNavigate("NEXT")} className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-500 transition">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-0.5 border border-zinc-200/10 w-fit">
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => onView(v.key)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-150
              ${view === v.key ? "bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs font-semibold" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600"}`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const BigCalendar = () => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [calendarHeight, setCalendarHeight] = useState(600);
  const [hiddenSubjects, setHiddenSubjects] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectColors, setSubjectColors] = useState<Record<string, string>>({});

  const fetchLessons = useCallback(async () => {
    try {
      const res = await fetch("/api/lessons?limit=200");
      if (!res.ok) return;
      const json = await res.json();

      const colorMap: Record<string, string> = {};
      let colorIdx = 0;

      const mapped: CalendarEvent[] = (json.data || []).map((lesson: any) => {
        const subjectName = lesson.subject?.name || "Aula";
        if (!colorMap[subjectName]) {
          colorMap[subjectName] = COLORS[colorIdx % COLORS.length];
          colorIdx++;
        }

        const dayNum = DAY_MAP[lesson.day] || 1;
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));

        const eventDate = new Date(monday);
        eventDate.setDate(monday.getDate() + (dayNum - 1));

        const [sh, sm] = lesson.startTime.split(":").map(Number);
        const [eh, em] = lesson.endTime.split(":").map(Number);

        const start = new Date(eventDate); start.setHours(sh, sm, 0, 0);
        const end = new Date(eventDate); end.setHours(eh, em, 0, 0);

        return {
          title: subjectName, start, end, type: subjectName,
          teacher: lesson.teacher?.name, room: lesson.room, className: lesson.class?.name,
        };
      });

      setSubjectColors(colorMap);
      setEvents(mapped);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 640) { setView(Views.DAY); setCalendarHeight(480); }
      else { setCalendarHeight(580); }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const toggleSubject = (subject: string) => {
    setHiddenSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) next.delete(subject);
      else next.add(subject);
      return next;
    });
  };

  const filteredEvents = useMemo(() => events.filter((e) => !hiddenSubjects.has(e.type || "")), [hiddenSubjects, events]);
  const activeSubjects = useMemo(() => Array.from(new Set(events.map(e => e.type).filter(Boolean))).sort() as string[], [events]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const baseColor = subjectColors[event.type || ""] || "#64748b";
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    return {
      style: {
        backgroundColor: isDark ? `${baseColor}15` : `${baseColor}08`,
        borderRadius: "12px",
        border: "none",
        borderLeft: `3px solid ${baseColor}`,
        color: baseColor,
        fontSize: "0.75rem",
        padding: "6px 10px",
        fontWeight: "600",
      },
    };
  };

  const EventComponent = useCallback(({ event }: { event: CalendarEvent }) => (
    <div className="flex flex-col h-full py-0.5 leading-snug">
      <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate text-xs">
        {event.title}
      </div>
      <div className="flex items-center gap-1.5 opacity-60 mt-0.5 text-[10px] font-medium">
        {event.room && <span className="truncate">{event.room}</span>}
        {event.teacher && <span className="truncate border-l border-zinc-300 dark:border-zinc-700 pl-1.5">{event.teacher.split(' ')[0]}</span>}
      </div>
    </div>
  ), []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <Loader2 size={18} className="animate-spin text-violet-500" />
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">A carregar horários...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Filtros por Cadeira — Design Suave */}
      {activeSubjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-0.5">
          {activeSubjects.map((subject) => {
            const color = subjectColors[subject] || "#64748b";
            const isHidden = hiddenSubjects.has(subject);

            return (
              <button
                key={subject}
                onClick={() => toggleSubject(subject)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer active:scale-98 border border-transparent
                  ${isHidden ? "bg-zinc-100/60 dark:bg-zinc-800/40 text-zinc-400 dark:text-zinc-500" : ""}`}
                style={!isHidden ? { backgroundColor: `${color}10`, color: color } : undefined}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                {subject}
              </button>
            );
          })}
        </div>
      )}

      {/* Container Alinhado ao Bento Grid */}
      <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-4 shadow-xs overflow-hidden">
        <Calendar<CalendarEvent>
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          views={{ work_week: true, day: true }}
          view={view}
          onView={setView}
          min={new Date(2025, 0, 1, 7, 30)}
          max={new Date(2025, 0, 1, 18, 30)}
          formats={{
            timeGutterFormat: "HH:mm",
            eventTimeRangeFormat: ({ start, end }) => `${moment(start).format("HH:mm")} – ${moment(end).format("HH:mm")}`,
          }}
          dayLayoutAlgorithm="no-overlap"
          scrollToTime={new Date()}
          eventPropGetter={eventStyleGetter}
          slotPropGetter={(date) => ({ className: date.getMinutes() === 0 ? "rbc-slot-hour" : "rbc-slot-half" })}
          dayPropGetter={() => ({})}
          onSelectEvent={(event) => setSelectedEvent(event)}
          components={{ toolbar: CalendarHeader, event: EventComponent }}
          style={{ height: calendarHeight }}
        />
      </div>

      {/* Sheet Lateral Fluid */}
      <Sheet open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <SheetContent className="w-full sm:max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-100 dark:border-zinc-800 p-0 overflow-hidden">
          {selectedEvent && (
            <div className="flex flex-col h-full">
              <div className="h-24 w-full relative" style={{ backgroundColor: `${subjectColors[selectedEvent.type || ""] || "#64748b"}08` }}>
                <div className="absolute bottom-0 left-0 w-full h-[2px]" style={{ backgroundColor: subjectColors[selectedEvent.type || ""] || "#64748b" }} />
                <SheetClose className="absolute top-5 right-5 p-2 rounded-xl bg-white dark:bg-zinc-900 text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X size={16} />
                </SheetClose>
              </div>

              <div className="px-6 -mt-4">
                <SheetHeader className="text-left">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-xs">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider mb-2"
                      style={{ backgroundColor: `${subjectColors[selectedEvent.type || ""] || "#64748b"}10`, color: subjectColors[selectedEvent.type || ""] || "#64748b" }}>
                      {selectedEvent.type}
                    </span>
                    <SheetTitle className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                      {selectedEvent.title}
                    </SheetTitle>
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock size={16} className="text-zinc-400" />
                      <div>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase">Horário</p>
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">{moment(selectedEvent.start).format("HH:mm")} – {moment(selectedEvent.end).format("HH:mm")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <MapPin size={16} className="text-zinc-400" />
                      <div>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase">Sala / Local</p>
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedEvent.room || "Não definida"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <User size={16} className="text-zinc-400" />
                      <div>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase">Professor</p>
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedEvent.teacher || "Não atribuído"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BigCalendar;