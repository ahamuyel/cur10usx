"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import ClassForm from "@/components/forms/ClassForm"

export default function NewClassPage() {
  const router = useRouter()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft size={16} className="text-zinc-500" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Nova Turma</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Preencha os dados da nova turma</p>
          </div>
        </div>
        <ClassForm
          mode="create"
          onSuccess={() => router.push("/list/classes")}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  )
}
