"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"

import { useTeacherDashboard } from "@/hooks/useTeacherDashboard"
import TeacherHero from "./TeacherHero"
import TeacherAttentionCenter from "./TeacherAttentionCenter"
import TeacherClassPerformance from "./TeacherClassPerformance"
import TeacherUpcomingLessons from "./TeacherUpcomingLessons"
import TeacherAssessmentCenter from "./TeacherAssessmentCenter"
import TeacherStudentInsights from "./TeacherStudentInsights"
import TeacherCalendarExperience from "./TeacherCalendarExperience"
import TeacherAnnouncements from "./TeacherAnnouncements"
import TeacherQuickActions from "./TeacherQuickActions"
import TeacherAnalyticsSnapshot from "./TeacherAnalyticsSnapshot"

export default function TeacherDashboard() {
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const { data, error } = useTeacherDashboard(teacherId)

  useEffect(() => {
    async function loadTeacher() {
      try {
        const res = await fetch("/api/profile")
        const json = await res.json()
        if (json.teacher?.id) {
          setTeacherId(json.teacher.id)
        }
      } catch {
        // silently fail
      }
    }
    loadTeacher()
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center py-24 min-h-[60vh]">
        <div className="flex items-center gap-3 text-rose-500 bg-rose-50/40 dark:bg-rose-950/10 px-6 py-4 rounded-3xl border border-rose-100 dark:border-rose-900/30 shadow-2xs backdrop-blur-md">
          <AlertCircle size={18} className="shrink-0" />
          <span className="text-xs font-semibold tracking-tight">{error}</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] gap-4">
        <div className="relative flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
          <div className="absolute w-12 h-12 rounded-full border border-violet-500/10 animate-ping opacity-25" />
        </div>
        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">
          Cur10usX · Teacher Engine
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 animate-fade-in pb-16 px-1 max-w-[1600px] mx-auto">
      {/* HERO */}
      <section>
        <TeacherHero data={data} />
      </section>

      {/* SNAPSHOT + QUICK ACTIONS */}
      <section className="space-y-6">
        <TeacherAnalyticsSnapshot data={data} />
        <TeacherQuickActions />
      </section>

      {/* ATTENTION CENTER + CLASS PERFORMANCE */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            <TeacherAttentionCenter data={data} />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <TeacherClassPerformance data={data} />
          </div>
        </div>
      </section>

      {/* LESSONS + ASSESSMENTS */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            <TeacherUpcomingLessons data={data} />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <TeacherAssessmentCenter data={data} />
          </div>
        </div>
      </section>

      {/* STUDENT INSIGHTS */}
      <section>
        <TeacherStudentInsights data={data} />
      </section>

      {/* CALENDAR + ANNOUNCEMENTS */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            <TeacherCalendarExperience />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="flex flex-col gap-6">
              <TeacherAnnouncements data={data} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
