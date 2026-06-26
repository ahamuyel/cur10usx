"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Building2,
  School,
  ArrowRight,
  UserPlus,
  ClipboardList,
  Sparkles,
  Send,
  ShieldCheck,
  User,
  Calendar,
  ExternalLink,
  BookOpen,
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  Loader2,
  X,
  ChevronDown,
  Zap,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmActionModal from "@/components/ui/ConfirmActionModal";
import AppAvatar from "@/components/ui/AppAvatar";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import HeroBackgroundPaths from "@/components/ui/HeroBackgroundPaths";

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const roleLabels: Record<string, string> = {
  school_admin: "Administrador",
  teacher: "Professor",
  student: "Aluno",
  parent: "Encarregado",
};

const roleIcons: Record<string, React.ElementType> = {
  school_admin: ShieldCheck,
  teacher: BookOpen,
  student: User,
  parent: Users,
};

const roleColors: Record<string, string> = {
  school_admin: "text-violet-600 dark:text-violet-400",
  teacher: "text-blue-600 dark:text-blue-400",
  student: "text-emerald-600 dark:text-emerald-400",
  parent: "text-amber-600 dark:text-amber-400",
};

const ROLES_DISPONIVEIS = [
  { id: "student", label: "Aluno", desc: "Solicitar matrícula como aluno" },
  {
    id: "teacher",
    label: "Professor",
    desc: "Solicitar contratação como docente",
  },
  {
    id: "parent",
    label: "Encarregado",
    desc: "Solicitar como encarregado de educação",
  },
];

type Application = {
  id: string;
  status: string;
  role: string;
  rejectReason: string | null;
  createdAt: string;
  school: { id: string; name: string; city: string };
};

type PublicSchool = {
  id: string;
  name: string;
  slug: string;
  city?: string;
};

type UserSchool = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  logo: string | null;
  roles: string[];
  status: string;
};

export default function MinhaAreaPage() {
  const { tUI, locale } = useTranslation();
  const { data: session, status: sessionStatus } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [schools, setSchools] = useState<PublicSchool[]>([]);
  const [userSchools, setUserSchools] = useState<UserSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<
    "school" | "role" | "form" | "success"
  >("school");
  const [selSchool, setSelSchool] = useState("");
  const [selRole, setSelRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [docType, setDocType] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [desiredGrade, setDesiredGrade] = useState("");
  const [teachingArea, setTeachingArea] = useState("");
  const [relationship, setRelationship] = useState("");

  // School registration
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [schoolSlug, setSchoolSlug] = useState("");
  const [schoolEmailVal, setSchoolEmailVal] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolCity, setSchoolCity] = useState("");
  const [schoolProvincia, setSchoolProvincia] = useState("");
  const [schoolNif, setSchoolNif] = useState("");
  const [schoolSubmitting, setSchoolSubmitting] = useState(false);
  const [schoolError, setSchoolError] = useState("");
  const [schoolSuccess, setSchoolSuccess] = useState(false);
  const [showSlugInput, setShowSlugInput] = useState(false);

  function handleSchoolNameChange(value: string) {
    setSchoolName(value);
    setSchoolSlug(toSlug(value));
  }

  const PROVINCIAS = [
    "Bengo",
    "Benguela",
    "Bié",
    "Cabinda",
    "Cuando Cubango",
    "Cuanza Norte",
    "Cuanza Sul",
    "Cunene",
    "Huambo",
    "Huíla",
    "Luanda",
    "Lunda Norte",
    "Lunda Sul",
    "Malanje",
    "Moxico",
    "Namibe",
    "Uíge",
    "Zaire",
  ];

  const classes = Array.from({ length: 12 }, (_, i) => {
    const val = i + 1;
    const label =
      locale === "en"
        ? `${val}th Grade`
        : locale === "fr"
          ? `${val}e classe`
          : `${val}ª classe`;
    return { value: val, label };
  });

  const loadData = useCallback(async () => {
    if (sessionStatus !== "authenticated") return;
    try {
      const [apps, schs, userSchs] = await Promise.all([
        fetch("/api/applications/mine").then((r) => r.json()),
        fetch("/api/schools/public").then((r) => r.json()),
        fetch("/api/user/schools").then((r) => r.json()),
      ]);
      setApplications(Array.isArray(apps) ? apps : []);
      setSchools(Array.isArray(schs) ? schs : []);
      setUserSchools(Array.isArray(userSchs) ? userSchs : []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [sessionStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (sessionStatus === "loading" || loading) return <SkeletonLoader />;

  const user = session?.user;
  const hasActiveSchools = userSchools.length > 0;
  const appliedSchoolIds = new Set(applications.map((a) => a.school.id));
  const blockedSchoolIds = new Set([
    ...appliedSchoolIds,
    ...userSchools.map((s) => s.id),
  ]);
  const escolasDisponiveis = schools.filter((s) => !blockedSchoolIds.has(s.id));
  const pendingCount = applications.filter(
    (a) => a.status === "pendente" || a.status === "em_analise",
  ).length;

  const openModal = () => {
    setModalStep("school");
    setSelSchool("");
    setSelRole("");
    setPhone("");
    setGender("");
    setDocType("");
    setDocNumber("");
    setDateOfBirth("");
    setDesiredGrade("");
    setTeachingArea("");
    setRelationship("");
    setSubmitError("");
    setShowModal(true);
  };

  const handleNextStep = () => {
    if (modalStep === "school" && selSchool) setModalStep("role");
    else if (modalStep === "role" && selRole) setModalStep("form");
  };

  const handleSubmit = async () => {
    setSubmitError("");
    if (selRole === "student" && !desiredGrade) {
      setSubmitError(tUI("Seleccione a classe pretendida"));
      return;
    }
    if (selRole === "student" && !gender) {
      setSubmitError(tUI("Seleccione o género"));
      return;
    }
    if (selRole === "teacher" && !teachingArea.trim()) {
      setSubmitError(tUI("Indique a área de ensino"));
      return;
    }
    if (selRole === "parent" && !relationship.trim()) {
      setSubmitError(tUI("Indique o parentesco"));
      return;
    }
    if (!phone.trim()) {
      setSubmitError(tUI("Telefone é obrigatório"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name || "",
          email: user?.email || "",
          phone,
          role: selRole,
          schoolId: selSchool,
          message: `Solicitação via Minha Área — ${roleLabels[selRole] || selRole}`,
          ...(selRole === "student"
            ? {
                gender,
                documentType: docType || undefined,
                documentNumber: docNumber || undefined,
                dateOfBirth: dateOfBirth || undefined,
                desiredGrade: desiredGrade ? parseInt(desiredGrade) : undefined,
              }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ? tUI(data.error) : tUI("Erro ao enviar"));
        return;
      }

      setModalStep("success");
      const [apps, userSchs] = await Promise.all([
        fetch("/api/applications/mine").then((r) => r.json()),
        fetch("/api/user/schools").then((r) => r.json()),
      ]);
      setApplications(Array.isArray(apps) ? apps : []);
      setUserSchools(Array.isArray(userSchs) ? userSchs : []);
    } catch {
      setSubmitError(tUI("Erro de conexão. Tente novamente."));
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalStep("school");
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      const res = await fetch(`/api/applications/${cancelTarget}/cancel`, {
        method: "POST",
      });
      if (res.ok)
        setApplications((prev) => prev.filter((a) => a.id !== cancelTarget));
    } finally {
      setCancelTarget(null);
    }
  };

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolError("");
    if (!schoolName.trim()) {
      setSchoolError(tUI("O nome da escola é obrigatório"));
      return;
    }
    if (!schoolEmailVal.trim()) {
      setSchoolError(tUI("O e-mail da escola é obrigatório"));
      return;
    }
    if (!schoolPhone.trim()) {
      setSchoolError(tUI("O telefone é obrigatório"));
      return;
    }

    setSchoolSubmitting(true);
    try {
      const res = await fetch("/api/school-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: schoolName.trim(),
          email: schoolEmailVal.trim(),
          phone: schoolPhone.trim(),
          address: schoolAddress.trim(),
          city: schoolCity.trim(),
          provincia: schoolProvincia,
          nif: schoolNif.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSchoolError(data.error || tUI("Erro ao registar escola"));
        return;
      }

      setSchoolSuccess(true);
      const userSchs = await fetch("/api/user/schools").then((r) => r.json());
      setUserSchools(Array.isArray(userSchs) ? userSchs : []);
    } catch {
      setSchoolError(tUI("Erro de conexão. Tente novamente."));
    } finally {
      setSchoolSubmitting(false);
    }
  };

  const firstName = user?.name?.split(" ")[0] || tUI("Utilizador");
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? tUI("Bom dia")
      : hour < 18
        ? tUI("Boa tarde")
        : tUI("Boa noite");
  const rawActions = getQuickActions(userSchools);
  const quickActions = rawActions.map((action) => ({
    ...action,
    label: tUI(action.label),
    desc: tUI(action.desc),
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4 sm:p-6">
      <section className="relative overflow-hidden rounded-2xl bg-zinc-950 p-5 sm:p-7 min-h-[280px] flex items-center">
        {/* Background Animado */}
        {/* <ShaderBackground /> */}
        <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-700 ease-in-out">
          {/* Ajuste de opacidade e blend mode para diferentes temas */}
          <div className="opacity-15 dark:opacity-30 mix-blend-multiply dark:mix-blend-overlay">
            <HeroBackgroundPaths />
          </div>
        </div>

        {/* Conteúdo (Z-index superior) */}
        <div className="relative z-10 w-full flex items-center gap-4">
          <AppAvatar
            src={user?.image}
            name={user?.name}
            className="w-14 h-14 sm:w-16 sm:h-16 !rounded-full border-2 border-white/20 shrink-0"
            fallbackClassName="text-base"
          />

          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/60 font-medium">{greeting}!</p>
            <h1 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
              {firstName}
            </h1>
            <p className="text-xs text-white/50 mt-0.5 truncate">
              {user?.email}
            </p>

            <div className="flex flex-wrap gap-2 mt-2.5">
              {hasActiveSchools ? (
                [...new Set(userSchools.flatMap((s) => s.roles))]
                  .slice(0, 3)
                  .map((role) => {
                    const Icon = roleIcons[role] || User;
                    return (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-medium border border-white/5"
                      >
                        <Icon size={11} /> {tUI(roleLabels[role] || role)}
                      </span>
                    );
                  })
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-white/70 text-xs font-medium border border-white/5">
                  <AlertTriangle size={11} /> {tUI("Sem escola vinculada")}
                </span>
              )}
            </div>

            {hasActiveSchools && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition backdrop-blur-sm border border-white/10"
              >
                {tUI("Ir para o painel")} <ExternalLink size={12} />
              </Link>
            )}
          </div>

          {/* Stats pills */}
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/5">
              <div>
                <p className="text-lg font-semibold text-white leading-none">
                  {userSchools.length}
                </p>
                <p className="text-[11px] text-white/55 mt-0.5">
                  {tUI("Escolas")}
                </p>
              </div>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                <div>
                  <p className="text-lg font-semibold text-white leading-none">
                    {pendingCount}
                  </p>
                  <p className="text-[11px] text-white/55 mt-0.5">
                    {tUI("Pendente")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── ESCOLAS ACTIVAS ── */}
      {hasActiveSchools && (
        <section className="space-y-3">
          <SectionHeader icon={School} title={tUI("As minhas escolas")} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {userSchools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        </section>
      )}

      {/* ── SOLICITAR ── */}
      {!hasActiveSchools && escolasDisponiveis.length > 0 && (
        <section className="space-y-3">
          <SectionHeader icon={UserPlus} title={tUI("Solicitar vinculação")} />
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {tUI("Ainda não está vinculado a nenhuma escola")}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {tUI(
                  "Escolha uma escola e o role pretendido para solicitar acesso.",
                )}
              </p>
            </div>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-700 text-white text-sm font-medium transition shadow-sm shadow-primary/20 shrink-0"
            >
              <UserPlus size={14} /> {tUI("Nova solicitação")}
            </button>
          </div>
        </section>
      )}

      {/* ── HISTÓRICO ── */}
      {applications.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            icon={ClipboardList}
            title={tUI("Histórico de solicitações")}
            count={`${applications.length} ${applications.length === 1 ? tUI("solicitação") : tUI("solicitações")}`}
          />
          <div className="space-y-2">
            {applications.map((app) => {
              const isPending =
                app.status === "pendente" || app.status === "em_analise";
              return (
                <div
                  key={app.id}
                  className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5"
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0 mt-0.5",
                      app.status === "aprovado"
                        ? "bg-emerald-500"
                        : app.status === "rejeitado"
                          ? "bg-red-500"
                          : "bg-amber-400",
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {app.school.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {tUI(roleLabels[app.role] || app.role)}
                      {app.school.city && ` · ${app.school.city}`}
                      {` · ${new Date(app.createdAt).toLocaleDateString(locale)}`}
                    </p>
                    {app.rejectReason && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 bg-red-50 dark:bg-red-950/30 rounded-lg px-2.5 py-1 inline-block">
                        {tUI("Motivo:")} {app.rejectReason}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={app.status} />
                  {isPending && (
                    <button
                      onClick={() => setCancelTarget(app.id)}
                      className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 transition shrink-0"
                    >
                      {tUI("Cancelar")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── ACÇÕES RÁPIDAS ── */}
      {quickActions.length > 0 && (
        <section className="space-y-3">
          <SectionHeader icon={Zap} title={tUI("Acções rápidas")} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="group flex flex-col items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/8 dark:bg-primary/10 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
                  <action.icon
                    size={17}
                    className="text-primary dark:text-primary-400"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {action.label}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {action.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── COMO FUNCIONA (só sem escolas E sem solicitações pendentes) ── */}
      {!hasActiveSchools && pendingCount === 0 && (
        <section className="space-y-3">
          <SectionHeader icon={Sparkles} title={tUI("Como funciona")} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: UserPlus,
                label: tUI("Criar conta"),
                desc: tUI("Registe-se na plataforma"),
              },
              {
                icon: Send,
                label: tUI("Escolher escola"),
                desc: tUI("Seleccione escola e role"),
              },
              {
                icon: Clock,
                label: tUI("Aguardar aprovação"),
                desc: tUI("A escola analisa o pedido"),
              },
              {
                icon: ShieldCheck,
                label: tUI("Aceder"),
                desc: tUI("Acesso ao painel da escola"),
              },
            ].map((step, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center"
              >
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <step.icon
                    size={17}
                    className="text-zinc-400 dark:text-zinc-500"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {step.label}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── REGISTAR NOVA ESCOLA ── */}
      {!hasActiveSchools && (
        <section className="space-y-3">
          <SectionHeader icon={Building2} title={tUI("Registar Nova Escola")} />
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {tUI("A sua escola ainda não está registada?")}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {tUI(
                    "Registe a sua escola na plataforma Cur10usX. Após análise, receberá acesso ao painel de administração.",
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSchoolModal(true);
                  setSchoolSuccess(false);
                  setSchoolError("");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-700 text-white text-sm font-medium transition shadow-sm shadow-primary/20 shrink-0"
              >
                <Building2 size={14} /> {tUI("Registar escola")}
              </button>
            </div>
          </div>
        </section>
      )}

      <hr className="border-zinc-100 dark:border-zinc-800" />

      {/* ── A MINHA CONTA ── */}
      <section className="space-y-3">
        <SectionHeader icon={Settings} title={tUI("A minha conta")} />
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <AppAvatar
              src={user?.image}
              name={user?.name}
              className="w-10 h-10 !rounded-full shrink-0"
              fallbackClassName="text-xs"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {user?.email}
              </p>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg shrink-0">
              Email
            </span>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {tUI("Registado em")}{" "}
              {session?.expires
                ? new Date(session.expires).toLocaleDateString(locale)
                : "—"}
            </p>
            <Link
              href="/change-password"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary dark:text-primary-400 hover:underline"
            >
              {tUI("Alterar palavra-passe")} <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONFIRM CANCEL ── */}
      <ConfirmActionModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title={tUI("Cancelar solicitação")}
        message={tUI(
          "Tem a certeza que deseja cancelar esta solicitação? Esta acção não pode ser desfeita.",
        )}
        confirmLabel={tUI("Cancelar solicitação")}
        confirmColor="red"
      />

      {/* ══════════════════════════════════════
          MODAL DE SOLICITAÇÃO
         ══════════════════════════════════════ */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
          onClick={(e) =>
            e.target === e.currentTarget && !submitting && closeModal()
          }
        >
          <div className="w-full sm:max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {modalStep === "school" && tUI("Escolha a escola")}
                {modalStep === "role" && tUI("Escolha o role")}
                {modalStep === "form" &&
                  `${tUI("Dados")} — ${tUI(roleLabels[selRole] || selRole)}`}
                {modalStep === "success" && tUI("Solicitação enviada")}
              </h2>
              <button
                onClick={closeModal}
                disabled={submitting}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X size={16} className="text-zinc-400" />
              </button>
            </div>

            <div className="p-5">
              {/* Step 1: Escola */}
              {modalStep === "school" && (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {tUI(
                      "Seleccione a escola onde deseja solicitar vinculação",
                    )}
                  </p>
                  <div className="relative">
                    <select
                      value={selSchool}
                      onChange={(e) => setSelSchool(e.target.value)}
                      className="w-full h-10 px-3 pr-8 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    >
                      <option value="">
                        {tUI("Seleccione uma escola...")}
                      </option>
                      {escolasDisponiveis.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                          {s.city ? ` — ${s.city}` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>
                  <button
                    onClick={handleNextStep}
                    disabled={!selSchool}
                    className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-700 text-white text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {tUI("Continuar")} <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Step 2: Role */}
              {modalStep === "role" && (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {tUI("Seleccione o role que pretende nesta escola")}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES_DISPONIVEIS.map(({ id, label }) => {
                      const Icon = roleIcons[id] || User;
                      return (
                        <button
                          key={id}
                          onClick={() => setSelRole(id)}
                          className={cn(
                            "p-3 rounded-xl border text-center transition-all",
                            selRole === id
                              ? "border-primary bg-primary-50 dark:bg-primary-950/30 dark:border-primary-700"
                              : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:border-primary-300 dark:hover:border-primary-600",
                          )}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center",
                              selRole === id
                                ? "bg-primary-100 dark:bg-primary-950"
                                : "bg-zinc-100 dark:bg-zinc-700",
                            )}
                          >
                            <Icon
                              size={14}
                              className={
                                selRole === id
                                  ? "text-primary dark:text-primary-400"
                                  : "text-zinc-400 dark:text-zinc-500"
                              }
                            />
                          </div>
                          <p
                            className={cn(
                              "text-xs font-medium",
                              selRole === id
                                ? "text-primary-700 dark:text-primary-300"
                                : "text-zinc-600 dark:text-zinc-400",
                            )}
                          >
                            {tUI(label)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModalStep("school")}
                      className="flex-1 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                    >
                      {tUI("Voltar")}
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={!selRole}
                      className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-700 text-white text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {tUI("Continuar")} <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Form */}
              {modalStep === "form" && (
                <div className="space-y-4">
                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                      {submitError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {tUI("Telefone *")}
                    </label>
                    <input
                      type="tel"
                      placeholder="+244 900 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    />
                  </div>

                  {selRole === "student" && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                          {tUI("Género *")}
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition appearance-none"
                        >
                          <option value="">{tUI("Seleccione...")}</option>
                          <option value="masculino">{tUI("Masculino")}</option>
                          <option value="feminino">{tUI("Feminino")}</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                            {tUI("Tipo de documento")}
                          </label>
                          <select
                            value={docType}
                            onChange={(e) => setDocType(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition appearance-none"
                          >
                            <option value="">{tUI("Seleccione...")}</option>
                            <option value="BI">{tUI("BI")}</option>
                            <option value="Passaporte">
                              {tUI("Passaporte")}
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                            {tUI("Nº do documento")}
                          </label>
                          <input
                            type="text"
                            value={docNumber}
                            onChange={(e) => setDocNumber(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                          {tUI("Data de nascimento")}
                        </label>
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                          {tUI("Classe pretendida *")}
                        </label>
                        <select
                          value={desiredGrade}
                          onChange={(e) => setDesiredGrade(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition appearance-none"
                        >
                          <option value="">
                            {tUI("Seleccione a classe...")}
                          </option>
                          {classes.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {selRole === "teacher" && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {tUI("Área de ensino *")}
                      </label>
                      <input
                        type="text"
                        placeholder={tUI("Ex: Matemática, Física, Português")}
                        value={teachingArea}
                        onChange={(e) => setTeachingArea(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                      />
                    </div>
                  )}

                  {selRole === "parent" && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {tUI("Parentesco *")}
                      </label>
                      <select
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition appearance-none"
                      >
                        <option value="">{tUI("Seleccione...")}</option>
                        <option value="pai">{tUI("Pai")}</option>
                        <option value="mae">{tUI("Mãe")}</option>
                        <option value="tutor">{tUI("Tutor / Outro")}</option>
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setModalStep("role")}
                      className="flex-1 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                    >
                      {tUI("Voltar")}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-700 text-white text-sm font-medium transition shadow-sm shadow-primary/20 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />{" "}
                          {tUI("Enviando...")}
                        </>
                      ) : (
                        <>
                          <Send size={14} /> {tUI("Enviar solicitação")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {modalStep === "success" && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle
                      size={28}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    {tUI("Solicitação enviada!")}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                    {tUI(
                      "A sua solicitação foi enviada à escola. Aguarda aprovação.",
                    )}
                  </p>
                  <button
                    onClick={closeModal}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-700 text-white text-sm font-medium transition"
                  >
                    {tUI("Fechar")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          MODAL DE REGISTO DE ESCOLA
         ══════════════════════════════════════ */}
      {showSchoolModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
          onClick={(e) =>
            e.target === e.currentTarget &&
            !schoolSubmitting &&
            setShowSchoolModal(false)
          }
        >
          <div className="w-full sm:max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {schoolSuccess
                  ? tUI("Escola registada!")
                  : tUI("Registar Nova Escola")}
              </h2>
              <button
                onClick={() => setShowSchoolModal(false)}
                disabled={schoolSubmitting}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X size={16} className="text-zinc-400" />
              </button>
            </div>

            <div className="p-5">
              {schoolSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle
                      size={28}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    {tUI("Escola registada com sucesso!")}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                    {tUI(
                      "A sua escola foi registada e está pendente de análise. Receberá um e-mail quando for aprovada.",
                    )}
                  </p>
                  <button
                    onClick={() => setShowSchoolModal(false)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-700 text-white text-sm font-medium transition"
                  >
                    {tUI("Fechar")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSchoolSubmit} className="space-y-4">
                  {schoolError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                      {schoolError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {tUI("Nome da escola *")}
                    </label>
                    <input
                      type="text"
                      placeholder={tUI("Colégio Exemplo")}
                      value={schoolName}
                      onChange={(e) => handleSchoolNameChange(e.target.value)}
                      disabled={schoolSubmitting}
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                      autoFocus
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {tUI("Slug (identificador único)")}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSlugInput(!showSlugInput)}
                        className="text-[10px] text-primary hover:underline font-medium"
                      >
                        {showSlugInput ? tUI("Auto") : tUI("Editar")}
                      </button>
                    </div>
                    {showSlugInput ? (
                      <input
                        type="text"
                        placeholder="colegio-exemplo"
                        value={schoolSlug}
                        onChange={(e) => setSchoolSlug(e.target.value)}
                        disabled={schoolSubmitting}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                      />
                    ) : (
                      <div className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/60 text-sm text-zinc-500 dark:text-zinc-400 flex items-center">
                        {schoolSlug || "—"}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {tUI("E-mail da escola *")}
                      </label>
                      <input
                        type="email"
                        placeholder="escola@exemplo.ao"
                        value={schoolEmailVal}
                        onChange={(e) => setSchoolEmailVal(e.target.value)}
                        disabled={schoolSubmitting}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {tUI("Telefone *")}
                      </label>
                      <input
                        type="tel"
                        placeholder="+244 900 000 000"
                        value={schoolPhone}
                        onChange={(e) => setSchoolPhone(e.target.value)}
                        disabled={schoolSubmitting}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {tUI("Endereço")}
                    </label>
                    <input
                      type="text"
                      placeholder={tUI("Rua, número, bairro")}
                      value={schoolAddress}
                      onChange={(e) => setSchoolAddress(e.target.value)}
                      disabled={schoolSubmitting}
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {tUI("Cidade")}
                      </label>
                      <input
                        type="text"
                        placeholder="Luanda"
                        value={schoolCity}
                        onChange={(e) => setSchoolCity(e.target.value)}
                        disabled={schoolSubmitting}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {tUI("Província")}
                      </label>
                      <select
                        value={schoolProvincia}
                        onChange={(e) => setSchoolProvincia(e.target.value)}
                        disabled={schoolSubmitting}
                        className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition appearance-none"
                      >
                        <option value="">{tUI("Seleccione...")}</option>
                        {PROVINCIAS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {tUI("NIF")}{" "}
                      <span className="text-zinc-400">{tUI("(opcional)")}</span>
                    </label>
                    <input
                      type="text"
                      placeholder="000000000"
                      value={schoolNif}
                      onChange={(e) => setSchoolNif(e.target.value)}
                      disabled={schoolSubmitting}
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSchoolModal(false)}
                      disabled={schoolSubmitting}
                      className="flex-1 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                    >
                      {tUI("Cancelar")}
                    </button>
                    <button
                      type="submit"
                      disabled={schoolSubmitting}
                      className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-700 text-white text-sm font-medium transition shadow-sm shadow-primary/20 disabled:opacity-50"
                    >
                      {schoolSubmitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />{" "}
                          {tUI("A registar...")}
                        </>
                      ) : (
                        <>
                          <Building2 size={14} /> {tUI("Registar escola")}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-componentes ── */

function SectionHeader({
  icon: Icon,
  title,
  count,
}: {
  icon: React.ElementType;
  title: string;
  count?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <Icon
          size={15}
          className="text-primary dark:text-primary-400 shrink-0"
        />
        {title}
      </h2>
      {count && (
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {count}
        </span>
      )}
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4 sm:p-6 animate-pulse">
      <div className="rounded-2xl bg-zinc-200 dark:bg-zinc-800 h-36" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-28"
          />
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-16"
          />
        ))}
      </div>
    </div>
  );
}

function SchoolCard({ school }: { school: UserSchool }) {
  const { tUI } = useTranslation();
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow">
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start gap-3">
          {school.logo ? (
            <img
              src={school.logo}
              alt={school.name}
              className="w-9 h-9 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center shrink-0">
              <School
                size={16}
                className="text-primary dark:text-primary-400"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {school.name}
            </p>
            {school.city && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {school.city}
              </p>
            )}
          </div>
          <StatusBadge status={school.status} />
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[...new Set(school.roles)].map((role) => {
            const Icon = roleIcons[role] || User;
            return (
              <span
                key={role}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800",
                  roleColors[role] || "text-zinc-600",
                )}
              >
                <Icon size={10} /> {tUI(roleLabels[role] || role)}
              </span>
            );
          })}
        </div>
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-700 text-white text-xs font-medium transition"
        >
          {tUI("Aceder ao painel")} <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
      <Icon size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function getQuickActions(userSchools: UserSchool[]) {
  const actions: Array<{
    icon: React.ElementType;
    label: string;
    desc: string;
    href: string;
  }> = [];
  const allRoles = new Set(userSchools.flatMap((s) => s.roles));
  const dashboardHref = "/dashboard";

  if (allRoles.has("student")) {
    actions.push({
      icon: BarChart3,
      label: "Ver notas",
      desc: "Consultar resultados",
      href: dashboardHref,
    });
    actions.push({
      icon: Calendar,
      label: "Ver horário",
      desc: "Horário de aulas",
      href: dashboardHref,
    });
    actions.push({
      icon: ClipboardList,
      label: "Ver tarefas",
      desc: "Trabalhos pendentes",
      href: dashboardHref,
    });
  }
  if (allRoles.has("teacher")) {
    actions.push({
      icon: Users,
      label: "Ver turmas",
      desc: "Turmas atribuídas",
      href: dashboardHref,
    });
    actions.push({
      icon: BarChart3,
      label: "Lançar notas",
      desc: "Registar avaliações",
      href: dashboardHref,
    });
    actions.push({
      icon: Calendar,
      label: "Ver horário",
      desc: "Horário de aulas",
      href: dashboardHref,
    });
  }
  if (allRoles.has("parent")) {
    actions.push({
      icon: Users,
      label: "Ver filhos",
      desc: "Educandos",
      href: dashboardHref,
    });
    actions.push({
      icon: BarChart3,
      label: "Ver notas",
      desc: "Resultados dos filhos",
      href: dashboardHref,
    });
    actions.push({
      icon: MessageSquare,
      label: "Comunicados",
      desc: "Mensagens da escola",
      href: dashboardHref,
    });
  }
  if (allRoles.has("school_admin")) {
    actions.push({
      icon: Settings,
      label: "Painel de gestão",
      desc: "Administração da escola",
      href: dashboardHref,
    });
  }

  return actions.slice(0, 4);
}
