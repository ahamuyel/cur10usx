"use client"

import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Users } from "lucide-react"

import StudentDashboard from "@/components/ui/StudentDashboard"
import ExecutiveDashboard from "@/components/analytics/ExecutiveDashboard"
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

  if (role === "school_admin") {
    return (
      <div className="min-w-0 w-full animate-in fade-in duration-300">
        <ExecutiveDashboard />
      </div>
    )
  }

  if (role === "student" || role === "parent") {
    return (
      <div className="flex flex-col gap-5 w-full animate-in fade-in duration-300">
        {role === "parent" && childrenList.length > 1 && (
          <div className="flex items-center gap-3 bg-card/30 backdrop-blur-md px-4 py-2.5 rounded-card border border-border/40 self-start">
            <Users size={14} className="text-muted-foreground shrink-0" />
            <div className="flex flex-col">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                Educando Ativo
              </label>
              <select
                value={studentId || ""}
                onChange={(e) => setStudentId(e.target.value)}
                className="bg-transparent text-xs font-bold text-foreground outline-none pr-6 cursor-pointer appearance-none relative"
                style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"292.4\" height=\"292.4\" fill=\"%2371717a\"><path d=\"M287 69.4a17.6 17.6 0 0 0-13-5.4H18.4c-5 0-9.3 1.8-12.9 5.4A17.6 17.6 0 0 0 0 82.2c0 5 1.8 9.3 5.4 12.9l128 127.9c3.6 3.6 7.8 5.4 12.8 5.4s9.2-1.8 12.8-5.4L287 95c3.5-3.5 5.4-7.8 5.4-12.8 0-5-1.9-9.2-5.5-12.8z\"/></svg>')", backgroundSize: "8px", backgroundPosition: "right center", backgroundRepeat: "no-repeat" }}
              >
                {childrenList.map((child) => (
                  <option key={child.id} value={child.id} className="bg-card text-foreground">
                    {child.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {studentId ? (
          <StudentDashboard studentId={studentId} />
        ) : (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
          </div>
        )}
      </div>
    )
  }

  if (role === "teacher") {
    return (
      <div className="w-full animate-in fade-in duration-300">
        <TeacherDashboard />
      </div>
    )
  }

  return (
    <div className="w-full animate-in fade-in duration-300">
      <TeacherDashboard />
    </div>
  )
}
