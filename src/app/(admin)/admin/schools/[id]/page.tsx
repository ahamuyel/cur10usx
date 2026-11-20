"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Loader2, ArrowLeft, CheckCircle2, XCircle, Zap, RotateCcw, 
  Ban, Trash2, Copy, Check, Pencil, Building2, Users, 
  GraduationCap, BookOpen, FileText, Settings2 
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmActionModal from "@/components/ui/ConfirmActionModal";
import SchoolForm from "@/components/forms/SchoolForm";
import SchoolFeaturesManager from "@/components/admin/SchoolFeaturesManager";
import { cn } from "@/lib/utils";

interface SchoolDetail {
  id: string;
  name: string;
  slug: string;
  nif?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  provincia: string;
  status: string;
  features?: Record<string, boolean> | null;
  rejectReason?: string;
  createdAt: string;
  _count: { users: number; teachers: number; students: number; parents: number; applications: number };
}

const REVERT_TARGET: Record<string, string> = {
  ativa: "aprovada",
  aprovada: "pendente",
  rejeitada: "pendente",
  suspensa: "ativa",
};

export default function SchoolDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [school, setSchool] = useState<SchoolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"revert" | "suspend" | "delete" | null>(null);
  const [activatedCreds, setActivatedCreds] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  async function fetchSchool() {
    try {
      const res = await fetch(`/api/admin/schools/${id}`);
      if (!res.ok) { router.replace("/admin/schools"); return; }
      setSchool(await res.json());
    } catch {
      router.replace("/admin/schools");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSchool(); }, [id]);

  async function handleAction(action: "approve" | "reject" | "activate") {
    setActionLoading(action);
    try {
      const body = action === "reject" ? { reason: rejectReason } : undefined;
      const res = await fetch(`/api/admin/schools/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (!res.ok) { const data = await res.json(); alert(data.error || "Erro"); return; }
      const data = await res.json();
      if (action === "activate" && data.adminCreated) setActivatedCreds({ email: data.adminEmail, password: "(enviada por e-mail)" });
      setShowReject(false);
      setRejectReason("");
      fetchSchool();
    } catch { alert("Erro de conexão"); } finally { setActionLoading(""); }
  }

  async function handleRevert() { await fetch(`/api/admin/schools/${id}/revert`, { method: "POST" }); setConfirmAction(null); fetchSchool(); }
  async function handleSuspend() { await fetch(`/api/admin/schools/${id}/suspend`, { method: "POST" }); setConfirmAction(null); fetchSchool(); }
  async function handleDelete() { await fetch(`/api/admin/schools/${id}`, { method: "DELETE" }); router.replace("/admin/schools"); }

  async function handleEditSchool(data: Record<string, string>) {
    const res = await fetch(`/api/admin/schools/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao actualizar");
    setShowEdit(false);
    fetchSchool();
  }

  if (loading || !school) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  const canApprove = school.status === "pendente";
  const canActivate = school.status === "aprovada";
  const canReject = school.status === "pendente" || school.status === "aprovada";
  const canRevert = !!REVERT_TARGET[school.status];
  const canSuspend = school.status === "ativa";
  const revertTarget = REVERT_TARGET[school.status];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <button onClick={() => router.push("/admin/schools")} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition">
        <ArrowLeft size={16} /> Voltar para lista
      </button>

      <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{school.name}</h1>
              <p className="text-sm text-zinc-500 font-mono mt-1">{school.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEdit(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
              <Pencil size={14} /> Editar
            </button>
            <StatusBadge status={school.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
          {[
            { label: "E-mail", value: school.email },
            { label: "Telefone", value: school.phone },
            { label: "Endereço", value: school.address },
            { label: "Localização", value: `${school.city} / ${school.provincia}` },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">{item.label}</p>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Users", value: school._count.users, icon: Users },
            { label: "Professores", value: school._count.teachers, icon: GraduationCap },
            { label: "Alunos", value: school._count.students, icon: BookOpen },
            { label: "Pais", value: school._count.parents, icon: Users },
            { label: "Pedidos", value: school._count.applications, icon: FileText },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 text-center">
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{s.value}</div>
              <div className="text-[10px] font-bold uppercase text-zinc-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {school.status === "ativa" && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="text-indigo-600 dark:text-indigo-400" size={20} />
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Funcionalidades</h3>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
              <SchoolFeaturesManager schoolId={school.id} initialFeatures={school.features ?? null} onUpdate={fetchSchool} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-6 border-t border-zinc-100 dark:border-zinc-800">
           {canApprove && <button onClick={() => handleAction("approve")} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">Aprovar</button>}
           {canActivate && <button onClick={() => handleAction("activate")} className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">Ativar</button>}
           {canSuspend && <button onClick={() => setConfirmAction("suspend")} className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700">Suspender</button>}
           <button onClick={() => setConfirmAction("delete")} className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 dark:border-red-900 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950">Eliminar</button>
        </div>
      </div>

      <ConfirmActionModal open={confirmAction === "suspend"} onClose={() => setConfirmAction(null)} onConfirm={handleSuspend} title="Suspender" message="Tem certeza?" confirmLabel="Suspender" confirmColor="red" />
      <ConfirmActionModal open={confirmAction === "delete"} onClose={() => setConfirmAction(null)} onConfirm={handleDelete} title="Eliminar" message="Tem certeza?" confirmLabel="Eliminar" confirmColor="red" />
    </div>
  );
}