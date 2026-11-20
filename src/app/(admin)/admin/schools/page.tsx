"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Loader2, Plus, Search } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import SchoolForm from "@/components/forms/SchoolForm";
import Pagination from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

interface School {
  id: string;
  name: string;
  slug: string;
  email: string;
  city: string;
  provincia: string;
  status: string;
  _count: { teachers: number; students: number; parents: number };
}

const PROVINCIAS = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", "Cuanza Norte",
  "Cuanza Sul", "Cunene", "Huambo", "Huíla", "Icolo e Bengo", "Luanda",
  "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Namibe", "Uíge", "Zaire",
];

const statusFilters = [
  { value: "", label: "Todas" },
  { value: "pendente", label: "Pendentes" },
  { value: "aprovada", label: "Aprovadas" },
  { value: "ativa", label: "Ativas" },
  { value: "suspensa", label: "Suspensas" },
  { value: "rejeitada", label: "Rejeitadas" },
];

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [provinciaFilter, setProvinciaFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (provinciaFilter) params.set("provincia", provinciaFilter);

      const res = await fetch(`/api/admin/schools?${params}`);
      const data = await res.json();
      setSchools(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Erro ao carregar escolas", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, provinciaFilter]);

  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  async function handleCreateSchool(data: Record<string, string>) {
    const res = await fetch("/api/admin/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao criar escola");
    setShowForm(false);
    fetchSchools();
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Escolas</h1>
          <p className="text-sm text-zinc-500">{total} escola(s) encontrada(s)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nova escola
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 w-full sm:max-w-xs">
            <Search size={16} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Pesquisar escola..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-sm w-full text-zinc-700 dark:text-zinc-200"
            />
          </div>
          <select
            value={provinciaFilter}
            onChange={(e) => { setProvinciaFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-200 outline-none w-full sm:w-auto"
          >
            <option value="">Todas províncias</option>
            {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={cn("px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border",
                statusFilter === f.value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left px-6 py-4 text-zinc-500 font-semibold">Nome</th>
                  <th className="text-left px-4 py-4 text-zinc-500 font-semibold hidden sm:table-cell">Localização</th>
                  <th className="text-left px-4 py-4 text-zinc-500 font-semibold">Status</th>
                  <th className="text-right px-6 py-4 text-zinc-500 font-semibold hidden md:table-cell">Comunidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/admin/schools/${school.id}`}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{school.name}</p>
                      <p className="text-xs text-zinc-500">{school.email}</p>
                    </td>
                    <td className="px-4 py-4 text-zinc-600 dark:text-zinc-400 hidden sm:table-cell">{school.city}, {school.provincia}</td>
                    <td className="px-4 py-4"><StatusBadge status={school.status} /></td>
                    <td className="px-6 py-4 text-right hidden md:table-cell text-zinc-500 font-medium">
                      {school._count.teachers + school._count.students + school._count.parents} total
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-6 text-zinc-900 dark:text-zinc-100">Registar Nova Escola</h2>
            <SchoolForm onSubmit={handleCreateSchool} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}