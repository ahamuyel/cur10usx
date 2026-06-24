"use client"

import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Users } from "lucide-react"

import StudentDashboard from "@/components/ui/StudentDashboard"
import ParentDashboard from "@/components/ui/ParentDashboard"
import SchoolAdminDashboard from "@/components/ui/SchoolAdminDashboard"
import SuperAdminDashboard from "@/components/ui/SuperAdminDashboard"
import TeacherDashboard from "@/components/ui/TeacherDashboard"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [studentId, setStudentId] = useState<string | null>(null)
  const [childrenList, setChildrenList] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return
    const role = session.user.role

    if (role === "student") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((d) => { if (d.student?.id) setStudentId(d.student.id) })
        .catch(() => {})
    } else if (role === "parent") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((d) => {
          if (d.parent?.students?.length > 0) {
            setChildrenList(d.parent.students.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })))
            setStudentId(d.parent.students[0].id)
          }
        })
        .catch(() => {})
    }
  }, [status, session])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
        <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
      </div>
    )
  }

  const role = session?.user?.role

  // ========== SCHOOL ADMIN DASHBOARD ==========
  if (role === "school_admin") {
    return (
      <div className="min-w-0 w-full animate-in fade-in duration-300">
        <SchoolAdminDashboard />
      </div>
    )
  }

  // ========== SUPER ADMIN DASHBOARD ==========
  if (role === "super_admin") {
    return (
      <div className="min-w-0 w-full animate-in fade-in duration-300">
        <SuperAdminDashboard />
      </div>
    )
  }

  // ========== STUDENT & PARENT DASHBOARD ==========
  if (role === "student" || role === "parent") {
    return (
      <div className="flex flex-col gap-5 w-full animate-in fade-in duration-300">
        {/* Seletor Custom Glassmorphic para Encarregados de Educação */}
        {role === "parent" && childrenList.length > 1 && (
          <div className="flex items-center gap-3 bg-white/30 dark:bg-zinc-900/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-zinc-100 dark:border-zinc-800/40 self-start">
            <Users size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
            <div className="flex flex-col">
              <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Educando Ativo
              </label>
              <select
                value={studentId || ""}
                onChange={(e) => setStudentId(e.target.value)}
                className="bg-transparent text-xs font-bold text-zinc-700 dark:text-zinc-200 outline-none pr-6 cursor-pointer appearance-none relative"
                style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"292.4\" height=\"292.4\" fill=\"%2371717a\"><path d=\"M287 69.4a17.6 17.6 0 0 0-13-5.4H18.4c-5 0-9.3 1.8-12.9 5.4A17.6 17.6 0 0 0 0 82.2c0 5 1.8 9.3 5.4 12.9l128 127.9c3.6 3.6 7.8 5.4 12.8 5.4s9.2-1.8 12.8-5.4L287 95c3.5-3.5 5.4-7.8 5.4-12.8 0-5-1.9-9.2-5.5-12.8z\"/></svg>')", backgroundSize: "8px", backgroundPosition: "right center", backgroundRepeat: "no-repeat" }}
              >
                {childrenList.map((child) => (
                  <option key={child.id} value={child.id} className="dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
                    {child.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {studentId ? (
          role === "parent" ? (
            <ParentDashboard studentId={studentId} />
          ) : (
            <StudentDashboard studentId={studentId} />
          )
        ) : (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
          </div>
        )}
      </div>
    )
  }

  // ========== TEACHER DASHBOARD ==========
  if (role === "teacher") {
    return (
      <div className="w-full animate-in fade-in duration-300">
        <TeacherDashboard />
      </div>
    )
  }

  // Fallback genérico de segurança caso a role não bata certo
  return (
    <div className="w-full animate-in fade-in duration-300">
      <TeacherDashboard />
    </div>
  )
}