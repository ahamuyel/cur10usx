"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { ChevronLeft, ChevronRight } from "lucide-react"
import 'react-calendar/dist/Calendar.css'
import { CalendarProps } from "react-calendar"

const CalendarDynamic = dynamic(() => import("react-calendar"), { ssr: false })

export default function EventCalendar() {
    const [value, setValue] = useState<Date | null>(new Date())
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!mounted) {
        return (
            <div className="w-full h-[340px] sm:h-[390px] animate-pulse bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 p-5 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-6 w-32 rounded bg-zinc-100 dark:bg-zinc-800" />
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                        <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2 pt-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="h-4 rounded bg-zinc-100 dark:bg-zinc-800/60" />
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2 flex-1">
                    {Array.from({ length: 28 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-xl bg-zinc-50 dark:bg-zinc-800/30" />
                    ))}
                </div>
            </div>
        )
    }

    const handleChange: CalendarProps["onChange"] = (val) => {
        if (val instanceof Date) setValue(val)
        else if (Array.isArray(val)) setValue(val[0] ?? null)
        else setValue(null)
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 w-full transition-all border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
            {/* CSS Global Injectado de forma segura e encapsulada */}
            <style dangerouslySetInnerHTML={{ __html: `
                .react-calendar-custom {
                    width: 100% !important;
                    border: none !important;
                    background: transparent !important;
                    font-family: inherit !important;
                }
                .react-calendar__navigation {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    margin-bottom: 1.25rem !important;
                    height: auto !important;
                }
                .react-calendar__navigation button {
                    background: none !important;
                    border: none !important;
                    min-width: 32px !important;
                    height: 32px !important;
                    padding: 0 !important;
                    border-radius: 0.75rem !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                }
                .react-calendar__navigation button:enabled:hover,
                .react-calendar__navigation button:enabled:focus {
                    background-color: var(--hover-bg) !important;
                }
                .react-calendar__month-view__weekdays {
                    text-align: center !important;
                    text-transform: uppercase !important;
                    font-weight: 700 !important;
                    font-size: 10px !important;
                    letter-spacing: 0.05em !important;
                    color: #a1a1aa !important;
                    padding-bottom: 0.5rem !important;
                }
                .dark .react-calendar__month-view__weekdays {
                    color: #71717a !important;
                }
                .react-calendar__month-view__weekdays__weekday abbr {
                    text-decoration: none !important;
                    border: none !important;
                }
                .react-calendar__month-view__days {
                    display: grid !important;
                    grid-template-columns: repeat(7, 1fr) !important;
                    gap: 4px !important;
                }
                .react-calendar__tile {
                    padding: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: none !important;
                    border: none !important;
                    outline: none !important;
                }
                .react-calendar__tile--active, 
                .react-calendar__tile--hasActive {
                    background: transparent !important;
                }
                .react-calendar__month-view__days__day--neighboringMonth {
                    opacity: 0.25 !important;
                }
            `}} />

            <CalendarDynamic
                onChange={handleChange}
                value={value}
                className="react-calendar-custom"
                next2Label={null}
                prev2Label={null}
                nextLabel={
                    <div className="w-8 h-8 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 flex items-center justify-center text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-2xs">
                        <ChevronRight size={15} strokeWidth={2.5} />
                    </div>
                }
                prevLabel={
                    <div className="w-8 h-8 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 flex items-center justify-center text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-2xs">
                        <ChevronLeft size={15} strokeWidth={2.5} />
                    </div>
                }
                navigationLabel={({ date }) => (
                    <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-50 font-bold text-sm sm:text-base px-1">
                        <span className="capitalize">{date.toLocaleString('pt', { month: 'long' })}</span>
                        <span className="text-zinc-400 dark:text-zinc-500 font-medium">{date.getFullYear()}</span>
                    </div>
                )}
                formatShortWeekday={(_, date) =>
                    date.toLocaleDateString('pt', { weekday: 'short' }).replace('.', '').substring(0, 3)
                }
                tileClassName={({ date: tileDate, view }) => {
                    if (view !== "month") return ""

                    const today = new Date()
                    const isToday = tileDate.toDateString() === today.toDateString()
                    const isSelected = value instanceof Date && tileDate.toDateString() === value.toDateString()

                    return `
                        relative flex items-center justify-center transition-all duration-200 cursor-pointer
                        aspect-square w-full rounded-xl text-xs sm:text-sm font-semibold outline-none
                        ${isToday ? 'border border-primary/40 text-primary dark:text-primary-400 bg-primary/5 dark:bg-primary/10' : ''}
                        ${isSelected
                            ? '!bg-primary !text-primary-foreground shadow-xs shadow-primary/10 scale-95 font-bold'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}
                    `
                }}
            />
        </div>
    )
}