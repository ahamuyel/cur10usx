"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import AnnouncementForm from "@/components/forms/AnnouncementForm"

export default function NewAnnouncementPage() {
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
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Novo Comunicado</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Crie e envie um novo comunicado</p>
          </div>
        </div>
        <AnnouncementForm
          mode="create"
          onSuccess={() => router.push("/list/announcements")}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  )
}
