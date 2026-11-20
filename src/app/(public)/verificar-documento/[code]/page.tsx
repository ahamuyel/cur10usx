import { prisma } from "@/lib/prisma"
import { CheckCircle, XCircle, AlertCircle, FileText, Shield, Calendar, Hash, Clock } from "lucide-react"
import Link from "next/link"

const documentLabels: Record<string, string> = {
  declaracao_frequencia: "Declaração de Frequência",
  certificado_aproveitamento: "Certificado de Aproveitamento",
  certificado_merito: "Certificado de Mérito",
  declaracao_matricula: "Declaração de Matrícula",
  historico_escolar: "Histórico Escolar",
  certificado_conclusao: "Certificado de Conclusão",
}

async function getDocument(code: string) {
  try {
    const doc = await prisma.documentVerification.findUnique({
      where: { code },
      include: {
        school: {
          select: { id: true, name: true, logo: true, address: true, city: true, provincia: true, phone: true, email: true },
        },
      },
    })
    return doc
  } catch {
    return null
  }
}

export default async function VerifyDocumentPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const document = await getDocument(code)

  if (!document) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 text-center">
          <XCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Documento Não Encontrado</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            O código de verificação fornecido não corresponde a nenhum documento válido.
          </p>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 break-all">{code}</p>
          </div>
          <Link
            href="/"
            className="inline-block mt-6 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  const isExpired = document.expiresAt && new Date(document.expiresAt) < new Date()
  const isValid = !isExpired

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Seal */}
        <div className="flex justify-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
            isValid
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600"
              : "bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-600"
          }`}>
            {isValid ? (
              <CheckCircle size={32} className="text-emerald-500" />
            ) : (
              <XCircle size={32} className="text-red-500" />
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 text-center">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {isValid ? "Documento Válido" : "Documento Expirado"}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {documentLabels[document.documentType] || document.documentType}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* School info */}
            {document.school.logo && (
              <div className="flex justify-center mb-2">
                <img src={document.school.logo} alt={document.school.name} className="h-12 object-contain" />
              </div>
            )}
            <div className="text-center mb-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{document.school.name}</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {document.school.address}{document.school.city ? `, ${document.school.city}` : ""}{document.school.provincia ? ` — ${document.school.provincia}` : ""}
              </p>
            </div>

            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

            {/* Document details */}
            <div className="space-y-3">
              <DetailRow icon={FileText} label="Tipo de Documento" value={documentLabels[document.documentType] || document.documentType} />
              <DetailRow icon={Hash} label="Código de Verificação" value={document.code} mono />
              <DetailRow icon={Shield} label="Estudante" value={document.studentName} />
              {document.className && <DetailRow icon={FileText} label="Turma" value={document.className} />}
              {document.courseName && <DetailRow icon={FileText} label="Curso" value={document.courseName} />}
              <DetailRow icon={Calendar} label="Ano Lectivo" value={document.academicYear} />
              <DetailRow icon={Calendar} label="Data de Emissão" value={new Date(document.issuedAt).toLocaleDateString("pt-PT")} />
              <DetailRow icon={Hash} label="N.º Sequencial" value={String(document.serialNumber)} />
              {document.expiresAt && (
                <DetailRow
                  icon={Clock}
                  label="Validade"
                  value={`${new Date(document.expiresAt).toLocaleDateString("pt-PT")}${isExpired ? " (Expirado)" : ""}`}
                  highlight={isExpired ? "text-red-500" : "text-emerald-500"}
                />
              )}
            </div>

            {document.verifiedAt ? (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg text-center mt-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Verificado anteriormente em {new Date(document.verifiedAt).toLocaleString("pt-PT")}
                </p>
              </div>
            ) : null}

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg mt-2">
              <p className="text-[11px] text-amber-700 dark:text-amber-400 text-center">
                Este documento foi verificado electronicamente. Qualquer alteração invalida a sua autenticidade.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-6">
          Verificação realizada em {new Date().toLocaleString("pt-PT")}
        </p>

        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  icon: Icon, label, value, mono, highlight,
}: {
  icon: typeof FileText
  label: string
  value: string
  mono?: boolean
  highlight?: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={14} className="text-zinc-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className={`text-sm font-semibold ${highlight || "text-zinc-800 dark:text-zinc-200"} ${mono ? "font-mono text-xs break-all" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
