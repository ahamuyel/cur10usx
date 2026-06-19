"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Mail, Phone, MapPin, BookOpen, Users, GraduationCap, Loader2, Pencil, Check, X, Camera, Shield, Info, User } from "lucide-react"

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  school_admin: "Administrador",
  teacher: "Professor",
  student: "Aluno",
  parent: "Encarregado",
}

const ProfilePage = () => {
  const { data: session, update: updateSession } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "", gender: "", dateOfBirth: "" })

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data)
        const entity = data.teacher || data.student || data.parent
        setEditForm({
          name: data.user?.name || "",
          phone: entity?.phone || "",
          address: entity?.address || "",
          gender: data.student?.gender || "",
          dateOfBirth: data.student?.dateOfBirth ? data.student.dateOfBirth.slice(0, 10) : "",
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      setEditing(false)
      if (editForm.name !== session?.user?.name) await updateSession({ name: editForm.name })
    }
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="animate-spin text-zinc-400" /></div>
  
  const { user } = profile
  const entity = profile.teacher || profile.student || profile.parent

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* CARD DE CABEÇALHO */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center gap-6">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <img src={user.image || "/avatar.png"} className="w-24 h-24 rounded-full object-cover border border-zinc-200 dark:border-zinc-800" />
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white" size={20} />
          </div>
          <input ref={fileInputRef} type="file" className="hidden" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{user.name}</h1>
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
            {roleLabels[user.role]}
          </span>
        </div>

        <button onClick={() => setEditing(!editing)} className="h-9 px-4 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-2">
          <Pencil size={12} /> {editing ? "Cancelar" : "Editar Perfil"}
        </button>
      </div>

      {/* GRID DE INFORMAÇÕES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: DETALHES */}
        <div className="lg:col-span-2 space-y-6">
          {editing ? (
             <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
               <h3 className="text-sm font-semibold mb-4">Dados de Conta</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ... inputs de edição mantendo o estilo do formulário de solicitações ... */}
                  <button onClick={handleSave} className="col-span-full h-9 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700">Guardar Alterações</button>
               </div>
             </div>
          ) : (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
              <h2 className="text-sm font-semibold mb-6 flex items-center gap-2"><Info size={16} className="text-zinc-400"/> Detalhes Pessoais</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div><label className="text-[10px] uppercase text-zinc-400 font-bold">Email</label><p className="text-sm text-zinc-900 dark:text-zinc-50">{user.email}</p></div>
                <div><label className="text-[10px] uppercase text-zinc-400 font-bold">Telefone</label><p className="text-sm text-zinc-900 dark:text-zinc-50">{entity?.phone || "—"}</p></div>
                <div className="sm:col-span-2"><label className="text-[10px] uppercase text-zinc-400 font-bold">Morada</label><p className="text-sm text-zinc-900 dark:text-zinc-50">{entity?.address || "—"}</p></div>
              </div>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: RESUMO */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs h-fit">
          <h2 className="text-sm font-semibold mb-6 flex items-center gap-2"><Shield size={16} className="text-zinc-400"/> Resumo da Conta</h2>
          <div className="space-y-4">
            <SummaryItem icon={BookOpen} color="emerald" value={12} label="Aulas Totais" />
            <SummaryItem icon={Users} color="amber" value={3} label="Grupos" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryItem({ icon: Icon, color, value, label }: { icon: any, color: string, value: number, label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{value}</div>
        <div className="text-[10px] text-zinc-500 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  )
}

export default ProfilePage