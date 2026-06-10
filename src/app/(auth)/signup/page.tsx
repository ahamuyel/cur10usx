"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building2,
  GraduationCap,
  UserRound,
  UserPlus,
  User,
  School,
  Eye,
  EyeOff,
  Loader2,
  Building,
  ArrowRight,
} from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { signIn as nextAuthSignIn } from "next-auth/react"
import { signUpSchema } from "@/lib/validations/auth"
import { registerSchoolSchema } from "@/lib/validations/register-school"
import { csrfPost } from "@/lib/csrf-client"
import { useTranslation } from "@/lib/i18n"
import { ACCOUNT_TYPE_LIST, type AccountTypeId } from "@/lib/account-types"
import {
  AuthCard,
  AuthHeader,
  AuthSuccess,
  FormInput,
  PasswordInput,
  SubmitButton,
  OAuthDivider,
  GoogleOAuthButton,
  TrustBadge,
  AlertBanner,
} from "@/components/auth"

const PROVINCIAS = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango",
  "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla",
  "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico",
  "Namibe", "Uíge", "Zaire",
]

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

type SchoolInfo = { id: string; name: string; city: string }

function PasswordRequirements({ password }: { password: string }) {
  const { tUI } = useTranslation()
  const checks = useMemo(
    () => [
      { label: "Mínimo 8 caracteres", met: password.length >= 8 },
      { label: "Uma letra maiúscula", met: /[A-Z]/.test(password) },
      { label: "Uma letra minúscula", met: /[a-z]/.test(password) },
      { label: "Um número", met: /[0-9]/.test(password) },
    ],
    [password],
  )

  if (!password) return null

  return (
    <div className="mt-2 space-y-1">
      {checks.map((check) => (
        <div
          key={check.label}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            check.met
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-zinc-400 dark:text-zinc-500"
          }`}
        >
          <svg
            className="w-3 h-3 shrink-0"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            {check.met ? (
              <path
                d="M3 6l2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
            )}
          </svg>
          <span>{tUI(check.label)}</span>
        </div>
      ))}
    </div>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const { tUI } = useTranslation()
  const [selectedType, setSelectedType] = useState<AccountTypeId>("student")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successEmail, setSuccessEmail] = useState("")
  const [successSchoolName, setSuccessSchoolName] = useState("")

  // School admin fields
  const [schoolName, setSchoolName] = useState("")
  const [slug, setSlug] = useState("")
  const [nif, setNif] = useState("")
  const [schoolEmail, setSchoolEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [provincia, setProvincia] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Teacher fields
  const [schools, setSchools] = useState<SchoolInfo[]>([])
  const [selectedSchoolId, setSelectedSchoolId] = useState("")
  const [teachingArea, setTeachingArea] = useState("")
  const [schoolsLoading, setSchoolsLoading] = useState(false)

  useEffect(() => {
    if (selectedType === "teacher" || selectedType === "student") {
      setSchoolsLoading(true)
      fetch("/api/schools/public")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setSchools(data)
        })
        .catch(() => {})
        .finally(() => setSchoolsLoading(false))
    }
  }, [selectedType])

  function handleSchoolNameChange(value: string) {
    setSchoolName(value)
    setSlug(toSlug(value))
  }

  function validate() {
    const e: Record<string, string> = {}

    if (selectedType === "school_admin") {
      const parsed = registerSchoolSchema.safeParse({
        adminName: name,
        adminEmail: email,
        adminPassword: password,
        schoolName,
        slug,
        nif,
        schoolEmail,
        phone,
        address,
        city,
        provincia,
      })
      if (!parsed.success) {
        parsed.error.issues.forEach((i) => {
          e[i.path[0] as string] = i.message
        })
      }
    } else {
      const parsed = signUpSchema.safeParse({ name, email, password })
      if (!parsed.success) {
        parsed.error.issues.forEach((i) => {
          e[i.path[0] as string] = i.message
        })
      }
      if (selectedType === "teacher") {
        if (!selectedSchoolId) e.selectedSchoolId = "Seleccione uma escola"
        if (!teachingArea) e.teachingArea = "Indique a área de ensino"
      }
    }

    if (!acceptedTerms) e.terms = tUI("Deve aceitar os Termos de Serviço e a Política de Privacidade")
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})

    try {
      let res: Response

      if (selectedType === "school_admin") {
        res = await csrfPost("/api/auth/register-school", {
          adminName: name,
          adminEmail: email,
          adminPassword: password,
          schoolName,
          slug,
          nif,
          schoolEmail,
          phone,
          address,
          city,
          provincia,
        })
      } else {
        res = await csrfPost("/api/auth/signup", {
          name,
          email,
          password,
          role: selectedType === "teacher" ? "teacher" : "student",
        })
      }

      const data = await res.json()
      if (!res.ok) {
        setErrors({ general: data.error || tUI("Erro ao criar conta") })
        return
      }

      setSuccess(true)
      setSuccessEmail(email)
      if (selectedType === "school_admin") setSuccessSchoolName(schoolName)
    } catch {
      setErrors({
        general: tUI("Erro de conexão. Verifique a sua internet e tente novamente."),
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    if (selectedType === "school_admin") {
      return (
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          <AuthCard>
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-6">
                <School className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                {tUI("Registo enviado!")}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                {tUI("A escola")}{" "}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {successSchoolName}
                </span>{" "}
                {tUI("foi registada com sucesso e está pendente de análise pela equipa Cur10usX.")}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                {tUI("Receberá um e-mail quando a escola for aprovada e activada. Entretanto, pode fazer login para acompanhar o estado.")}
              </p>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-sm transition"
              >
                {tUI("Ir para o login")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AuthCard>
        </div>
      )
    }

    return (
      <AuthSuccess
        icon={GraduationCap}
        title={tUI("Conta criada com sucesso!")}
        actionLabel={tUI("Ir para o login")}
        actionHref="/signin"
        secondaryAction={
          <Link
            href="/verify-email"
            className="text-xs text-primary hover:underline font-medium"
          >
            {tUI("Não recebeu o e-mail? Reenviar verificação")}
          </Link>
        }
      >
        <p>
          {tUI("Enviámos um e-mail de verificação para")}{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {successEmail}
          </span>
          .
        </p>
        <p>{tUI("Clique no link para activar a sua conta antes de fazer login.")}</p>
      </AuthSuccess>
    )
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-50"
  const labelClass =
    "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"

  return (
    <div className="w-full max-w-sm mx-auto">
      <AuthCard>
        <div className="p-6 sm:p-8">
          <AuthHeader
            icon={UserPlus}
            title={tUI("Criar conta")}
            subtitle={tUI("Junte-se à plataforma de gestão escolar Cur10usX")}
          />

          {/* Account type cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
            {ACCOUNT_TYPE_LIST.map(({ id, icon: Icon, titleKey, descKey }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedType(id)}
                className={`rounded-lg border p-3 text-center transition-all cursor-pointer ${
                  selectedType === id
                    ? "border-primary ring-2 ring-primary/20 bg-primary-50/50 dark:bg-primary-950/20"
                    : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5 transition-colors ${
                  selectedType === id
                    ? "bg-primary text-white"
                    : "bg-primary-100 dark:bg-primary-950/40 text-primary dark:text-primary-400"
                }`}>
                  <Icon size={15} />
                </div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {tUI(titleKey)}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {tUI(descKey)}
                </p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errors.general && (
              <AlertBanner variant="error">{errors.general}</AlertBanner>
            )}

            {/* ── Admin fields (shared by all types) ── */}
            {selectedType !== "school_admin" && (
              <>
                <FormInput
                  id="name"
                  label={tUI("Nome completo")}
                  type="text"
                  placeholder={tUI("O seu nome")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name || errors.adminName}
                  disabled={loading}
                  autoFocus
                />

                <FormInput
                  id="signup-email"
                  label={tUI("E-mail")}
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email || errors.adminEmail}
                  disabled={loading}
                />

                <div>
                  <PasswordInput
                    id="signup-password"
                    label={tUI("Palavra-passe")}
                    autoComplete="new-password"
                    placeholder={tUI("Mínimo 8 caracteres")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password || errors.adminPassword}
                    disabled={loading}
                  />
                  <PasswordRequirements password={password} />
                </div>
              </>
            )}

            {/* ── School Admin: admin section ── */}
            {selectedType === "school_admin" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center">
                    <User size={14} className="text-primary dark:text-primary-400" />
                  </div>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {tUI("Dados do administrador")}
                  </h2>
                </div>

                <div>
                  <label htmlFor="adminName" className={labelClass}>
                    {tUI("Nome completo")}
                  </label>
                  <input
                    id="adminName"
                    type="text"
                    placeholder={tUI("O seu nome")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                    autoFocus
                  />
                  {errors.adminName && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1.5" role="alert">{errors.adminName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="adminEmail" className={labelClass}>
                    {tUI("E-mail pessoal")}
                  </label>
                  <input
                    id="adminEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                  />
                  {errors.adminEmail && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1.5" role="alert">{errors.adminEmail}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="adminPassword" className={labelClass}>
                    {tUI("Palavra-passe")}
                  </label>
                  <div className="relative">
                    <input
                      id="adminPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={tUI("Mínimo 8 caracteres")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition p-1"
                      aria-label={showPassword ? tUI("Ocultar senha") : tUI("Mostrar senha")}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordRequirements password={password} />
                  {errors.adminPassword && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1.5" role="alert">{errors.adminPassword}</p>
                  )}
                </div>

                {/* School section */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center">
                      <Building2 size={14} className="text-primary dark:text-primary-400" />
                    </div>
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {tUI("Dados da escola")}
                    </h2>
                  </div>

                  <div>
                    <label htmlFor="schoolName" className={labelClass}>
                      {tUI("Nome da escola")}
                    </label>
                    <input
                      id="schoolName"
                      type="text"
                      placeholder={tUI("Colégio Exemplo")}
                      value={schoolName}
                      onChange={(e) => handleSchoolNameChange(e.target.value)}
                      disabled={loading}
                      className={inputClass}
                    />
                    {errors.schoolName && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1.5" role="alert">{errors.schoolName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="slug" className={labelClass}>
                      {tUI("Slug (identificador único)")}
                    </label>
                    <input
                      id="slug"
                      type="text"
                      placeholder="colegio-exemplo"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      disabled={loading}
                      className={inputClass}
                    />
                    <p className="text-xs text-zinc-400 mt-1">
                      {tUI("Gerado automaticamente a partir do nome")}
                    </p>
                    {errors.slug && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1.5" role="alert">{errors.slug}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nif" className={labelClass}>
                        {tUI("NIF")}{" "}<span className="text-zinc-400">{tUI("(opcional)")}</span>
                      </label>
                      <input
                        id="nif"
                        type="text"
                        placeholder="000000000"
                        value={nif}
                        onChange={(e) => setNif(e.target.value)}
                        disabled={loading}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelClass}>
                        {tUI("Telefone")}
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+244 900 000 000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={loading}
                        className={inputClass}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1.5" role="alert">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="schoolEmail" className={labelClass}>
                      {tUI("E-mail da escola")}
                    </label>
                    <input
                      id="schoolEmail"
                      type="email"
                      placeholder="escola@exemplo.ao"
                      value={schoolEmail}
                      onChange={(e) => setSchoolEmail(e.target.value)}
                      disabled={loading}
                      className={inputClass}
                    />
                    {errors.schoolEmail && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1.5" role="alert">{errors.schoolEmail}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="address" className={labelClass}>
                      {tUI("Endereço")}
                    </label>
                    <input
                      id="address"
                      type="text"
                      placeholder={tUI("Rua, número, bairro")}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={loading}
                      className={inputClass}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1.5" role="alert">{errors.address}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className={labelClass}>
                        {tUI("Cidade")}
                      </label>
                      <input
                        id="city"
                        type="text"
                        placeholder="Luanda"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        disabled={loading}
                        className={inputClass}
                      />
                      {errors.city && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1.5" role="alert">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="provincia" className={labelClass}>
                        {tUI("Província")}
                      </label>
                      <select
                        id="provincia"
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                        disabled={loading}
                        className={inputClass}
                      >
                        <option value="">{tUI("Seleccione...")}</option>
                        {PROVINCIAS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      {errors.provincia && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1.5" role="alert">{errors.provincia}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Teacher: school selector + teaching area ── */}
            {selectedType === "teacher" && (
              <>
                <FormInput
                  id="name"
                  label={tUI("Nome completo")}
                  type="text"
                  placeholder={tUI("O seu nome")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  disabled={loading}
                  autoFocus
                />

                <FormInput
                  id="signup-email"
                  label={tUI("E-mail")}
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  disabled={loading}
                />

                <div>
                  <PasswordInput
                    id="signup-password"
                    label={tUI("Palavra-passe")}
                    autoComplete="new-password"
                    placeholder={tUI("Mínimo 8 caracteres")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    disabled={loading}
                  />
                  <PasswordRequirements password={password} />
                </div>

                <div>
                  <label htmlFor="schoolSelect" className={labelClass}>
                    {tUI("Escola")}
                  </label>
                  <select
                    id="schoolSelect"
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    disabled={loading || schoolsLoading}
                    className={inputClass}
                  >
                    <option value="">{schoolsLoading ? tUI("A carregar...") : tUI("Seleccione...")}</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
                    ))}
                  </select>
                  {errors.selectedSchoolId && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1.5" role="alert">{errors.selectedSchoolId}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="teachingArea" className={labelClass}>
                    {tUI("Área de ensino")}
                  </label>
                  <input
                    id="teachingArea"
                    type="text"
                    placeholder="Ex: Matemática, Física, Português"
                    value={teachingArea}
                    onChange={(e) => setTeachingArea(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                  />
                  {errors.teachingArea && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1.5" role="alert">{errors.teachingArea}</p>
                  )}
                </div>
              </>
            )}

            {/* ── Student: same as original ── */}
            {selectedType === "student" && (
              <>
                <FormInput
                  id="name"
                  label={tUI("Nome completo")}
                  type="text"
                  placeholder={tUI("O seu nome")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  disabled={loading}
                  autoFocus
                />

                <FormInput
                  id="signup-email"
                  label={tUI("E-mail")}
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  disabled={loading}
                />

                <div>
                  <PasswordInput
                    id="signup-password"
                    label={tUI("Palavra-passe")}
                    autoComplete="new-password"
                    placeholder={tUI("Mínimo 8 caracteres")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    disabled={loading}
                  />
                  <PasswordRequirements password={password} />
                </div>
              </>
            )}

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary focus:ring-offset-0"
              />
              <label
                htmlFor="terms"
                className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed"
              >
                {tUI("Li e aceito os")}{" "}
                <Link
                  href="/termos"
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                >
                  {tUI("Termos de Serviço")}
                </Link>{" "}
                {tUI("e a")}{" "}
                <Link
                  href="/privacidade"
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                >
                  {tUI("Política de Privacidade")}
                </Link>
                .
              </label>
            </div>
            {errors.terms && (
              <p className="text-xs text-red-600 dark:text-red-400 -mt-2" role="alert">
                {errors.terms}
              </p>
            )}

            <SubmitButton loading={loading} loadingText={tUI("Criando conta...")}>
              {tUI("Criar conta")}
            </SubmitButton>
          </form>

          <OAuthDivider label={tUI("ou registe-se com")} />

          <GoogleOAuthButton disabled={loading} />

          <TrustBadge />
        </div>
      </AuthCard>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
        {tUI("Já tem uma conta?")}{" "}
        <Link href="/signin" className="text-primary font-medium hover:underline">
          {tUI("Entrar")}
        </Link>
      </p>
    </div>
  )
}
