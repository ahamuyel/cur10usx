"use client"

import { useEffect, useState } from "react"
import { Loader2, Save, Check, Settings2, ShieldAlert, Globe, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlatformConfig {
  name: string
  logo: string | null
  contactEmail: string | null
  contactPhone: string | null
  description: string | null
  maintenanceMode: boolean
  allowRegistration: boolean
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<PlatformConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setError("Erro ao carregar configurações"))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!config) return
    setSaving(true)
    setError("")
    setSaved(false)

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erro ao salvar")
        return
      }
      const data = await res.json()
      setConfig(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError("Erro de conexão")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"

  return (
    <div className="max-w-3xl p-4 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Definições do Sistema</h1>
        <p className="text-sm text-zinc-500">Configurações globais da plataforma e comportamento do sistema.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <Check size={16} /> Configurações guardadas com sucesso!
        </div>
      )}

      {config && (
        <form onSubmit={handleSave} className="space-y-8">
          {/* Gerais */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold mb-4">
              <Globe size={18} className="text-indigo-600" /> Informações Gerais
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Nome da plataforma</label>
              <input className={inputClass} value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Descrição</label>
              <textarea className={cn(inputClass, "resize-none")} rows={3} value={config.description || ""} onChange={(e) => setConfig({ ...config, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">URL do logo</label>
              <input className={inputClass} type="url" value={config.logo || ""} onChange={(e) => setConfig({ ...config, logo: e.target.value })} placeholder="https://..." />
            </div>
          </section>

          {/* Contactos */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold mb-4">
              <Info size={18} className="text-indigo-600" /> Contactos
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">E-mail de contacto</label>
                <input className={inputClass} type="email" value={config.contactEmail || ""} onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Telefone de contacto</label>
                <input className={inputClass} value={config.contactPhone || ""} onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })} />
              </div>
            </div>
          </section>

          {/* Comportamento */}
          <section className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-8">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold mb-4">
              <Settings2 size={18} className="text-indigo-600" /> Comportamento
            </div>
            <label className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 cursor-pointer">
              <input type="checkbox" checked={config.allowRegistration} onChange={(e) => setConfig({ ...config, allowRegistration: e.target.checked })} className="mt-1 w-4 h-4 rounded text-indigo-600" />
              <div>
                <span className="text-sm font-bold block">Permitir novas solicitações</span>
                <p className="text-xs text-zinc-500">Escolas e utilizadores podem registar-se ou submeter pedidos.</p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 cursor-pointer">
              <input type="checkbox" checked={config.maintenanceMode} onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })} className="mt-1 w-4 h-4 rounded text-red-600" />
              <div>
                <span className="text-sm font-bold block text-red-600">Modo de manutenção</span>
                <p className="text-xs text-zinc-500">A plataforma ficará indisponível para utilizadores comuns.</p>
              </div>
            </label>
          </section>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? "A guardar..." : "Guardar alterações"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}