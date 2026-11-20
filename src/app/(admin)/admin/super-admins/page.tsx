"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  Plus,
  ShieldCheck,
  Copy,
  Check,
  User,
  List,
  Grid3X3,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import ConfirmActionModal from "@/components/ui/ConfirmActionModal";
import { cn } from "@/lib/utils";

interface SuperAdmin {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export default function SuperAdminsPage() {
  const [admins, setAdmins] = useState<SuperAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "grid">("list");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<SuperAdmin | null>(null);
  const { data: session } = useSession();

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/super-admins");
      const data = await res.json();
      setAdmins(data.data || []);
    } catch {
      console.error("Erro ao carregar super admins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/super-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Erro ao criar");
        return;
      }
      setCreatedCreds({ email: data.email, password: form.password });
      setShowForm(false);
      setForm({ name: "", email: "", password: "" });
      fetchAdmins();
    } catch {
      setFormError("Erro de conexão");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!toggleTarget) return;
    const res = await fetch(
      `/api/admin/super-admins/${toggleTarget.id}/toggle-active`,
      { method: "POST" },
    );
    if (res.ok) {
      setToggleTarget(null);
      fetchAdmins();
    }
  };

  const activityData = admins
    .slice(-5)
    .map((admin) => {
      const diff = new Date().getTime() - new Date(admin.createdAt).getTime();
      const daysAgo = Math.max(0, 100 - diff / (1000 * 60 * 60 * 24));
      return Math.min(100, Math.max(20, daysAgo));
    });

  const inputClass =
    "w-full px-4 py-3 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Super Admins
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {admins.length} administradores registados |{" "}
              {admins.filter((a) => a.isActive).length} activos
            </p>
          </div>

          <div className="w-px h-10 bg-zinc-100 dark:bg-zinc-800" />

          <div className="flex items-end gap-1.5 h-10 w-28">
            {activityData.length > 0 ? (
              activityData.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-t-sm relative"
                >
                  <div
                    style={{ height: `${h}%` }}
                    className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm transition-all duration-700"
                  />
                </div>
              ))
            ) : (
              <span className="text-[10px] text-zinc-400">Sem dados</span>
            )}
          </div>

          <div className="w-px h-10 bg-zinc-100 dark:bg-zinc-800" />

          <div className="flex items-end gap-1.5 h-10 w-28">
            {[40, 70, 45, 90, 60].map((h, i) => (
              <div
                key={i}
                className="group flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-t-sm relative cursor-pointer"
                title={`Valor: ${h}%`}
              >
                <div
                  style={{ height: `${h}%` }}
                  className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-sm transition-all duration-700 ease-out group-hover:from-indigo-600 group-hover:to-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-2.5 rounded-lg transition-all",
              view === "list"
                ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600"
                : "text-zinc-500",
            )}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-2.5 rounded-lg transition-all",
              view === "grid"
                ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600"
                : "text-zinc-500",
            )}
          >
            <Grid3X3 size={18} />
          </button>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} /> Novo Admin
        </button>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-500 flex flex-col items-center">
          <AlertCircle className="mb-2 opacity-50" /> Nenhum administrador
          encontrado.
        </div>
      ) : view === "list" ? (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-[11px] uppercase font-bold text-zinc-500 tracking-wider">
                <tr>
                  <th className="py-5 px-6">Administrador</th>
                  <th className="py-5 px-6">E-mail</th>
                  <th className="py-5 px-6">Estado</th>
                  <th className="py-5 px-6 text-right">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
                  >
                    <td className="py-4 px-6 flex items-center gap-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-zinc-900 flex items-center justify-center">
                        <User size={16} className="text-indigo-600" />
                      </div>
                      {admin.name}
                    </td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400 text-sm">
                      {admin.email}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                          admin.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-zinc-100 text-zinc-600",
                        )}
                      >
                        {admin.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {session?.user?.id !== admin.id && (
                        <button
                          onClick={() => setToggleTarget(admin)}
                          className="text-indigo-600 hover:text-indigo-700 font-bold text-xs bg-indigo-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg transition"
                        >
                          Gerir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-zinc-900 flex items-center justify-center mb-5">
                <ShieldCheck className="text-indigo-600" size={24} />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                {admin.name}
              </h3>
              <p className="text-sm text-zinc-500 mb-6 truncate">
                {admin.email}
              </p>
              <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                    admin.isActive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-zinc-100 text-zinc-600",
                  )}
                >
                  {admin.isActive ? "Activo" : "Inactivo"}
                </span>
                {session?.user?.id !== admin.id && (
                  <button
                    onClick={() => setToggleTarget(admin)}
                    className="text-sm font-bold text-indigo-600 hover:underline"
                  >
                    Alterar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm border border-zinc-800 shadow-2xl">
            <h2 className="text-lg font-bold mb-4">Novo Super Admin</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input placeholder="Nome" className={inputClass} value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
              <input placeholder="E-mail" type="email" className={inputClass} value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
              <input placeholder="Password" type="text" className={inputClass} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl text-sm bg-zinc-100 font-bold">Cancelar</button>
                <button type="submit" disabled={formLoading} className="flex-1 py-2 rounded-xl text-sm bg-indigo-600 text-white font-bold">
                  {formLoading ? <Loader2 className="animate-spin mx-auto" size={16}/> : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmActionModal
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggleActive}
        title="Alterar Estado"
        message={`Deseja realmente ${toggleTarget?.isActive ? "desactivar" : "activar"} ${toggleTarget?.name}?`}
        confirmLabel="Confirmar"
      />
    </div>
  );
}