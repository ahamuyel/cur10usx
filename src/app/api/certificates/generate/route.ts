import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { getOrDefaultAcademicYearId } from "@/lib/academic-year"
import { jsPDF } from "jspdf"
import QRCode from "qrcode"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher", "student", "parent"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const userId = session!.user.id
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const documentType = searchParams.get("type") || "declaracao_frequencia"
    const providedAcademicYearId = searchParams.get("academicYearId")

    if (!studentId) {
      return NextResponse.json({ error: "studentId é obrigatório" }, { status: 400 })
    }

    if (role === "student") {
      const ownStudent = await prisma.student.findFirst({
        where: { userId, schoolId },
        select: { id: true },
      })
      if (!ownStudent || ownStudent.id !== studentId) {
        return NextResponse.json({ error: "Sem permissão para este aluno" }, { status: 403 })
      }
    }

    if (role === "parent") {
      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
        select: { students: { select: { id: true } } },
      })
      const childIds = parent?.students.map((s) => s.id) || []
      if (!childIds.includes(studentId)) {
        return NextResponse.json({ error: "Sem permissão para este aluno" }, { status: 403 })
      }
    }

    const academicYearId = await getOrDefaultAcademicYearId(schoolId, providedAcademicYearId)

    const [student, school] = await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        include: {
          class: { select: { id: true, name: true, grade: true } },
          enrollments: {
            where: { academicYearId },
            include: { academicYear: { select: { name: true } } },
            orderBy: { enrolledAt: "desc" },
            take: 1,
          },
        },
      }),
      prisma.school.findUnique({
        where: { id: schoolId },
        select: {
          id: true,
          name: true,
          nif: true,
          address: true,
          city: true,
          provincia: true,
          phone: true,
          email: true,
          logo: true,
        },
      }),
    ])

    if (!student || student.schoolId !== schoolId || !school) {
      return NextResponse.json({ error: "Aluno ou escola não encontrados" }, { status: 404 })
    }

    let academicYearName = ""
    if (academicYearId) {
      const ay = await prisma.academicYear.findUnique({ where: { id: academicYearId }, select: { name: true } })
      academicYearName = ay?.name || ""
    }

    const enrollment = student.enrollments[0]

    // Generate sequential serial number
    const serialCount = await prisma.documentVerification.count({
      where: { schoolId, documentType: documentType as never },
    })

    const serialNumber = serialCount + 1
    const verificationCode = `${school.id.slice(-4).toUpperCase()}-${documentType.slice(0, 3).toUpperCase()}-${String(serialNumber).padStart(5, "0")}-${Date.now().toString(36).toUpperCase()}`

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Load logo if available
    let logoData: string | null = null
    if (school.logo) {
      try {
        const logoRes = await fetch(school.logo)
        const logoBlob = await logoRes.blob()
        logoData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(logoBlob)
        })
      } catch {
        logoData = null
      }
    }

    // Header
    if (logoData) {
      doc.addImage(logoData, "PNG", 14, 10, 20, 20)
    }
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(school.name, logoData ? 40 : 14, 18)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(school.address || "", logoData ? 40 : 14, 24)
    doc.text(`${school.city || ""}${school.provincia ? ` — ${school.provincia}` : ""}`, logoData ? 40 : 14, 29)
    doc.text(`NIF: ${school.nif || "—"}`, logoData ? 40 : 14, 34)
    doc.text(`Tel: ${school.phone || "—"}`, logoData ? 40 : 14, 39)

    // Separator line
    doc.setDrawColor(41, 65, 122)
    doc.setLineWidth(0.8)
    doc.line(14, 44, pageWidth - 14, 44)

    // Document title
    const titles: Record<string, string> = {
      declaracao_frequencia: "DECLARAÇÃO DE FREQUÊNCIA",
      certificado_aproveitamento: "CERTIFICADO DE APROVEITAMENTO",
      certificado_merito: "CERTIFICADO DE MÉRITO",
      declaracao_matricula: "DECLARAÇÃO DE MATRÍCULA",
      historico_escolar: "HISTÓRICO ESCOLAR",
      certificado_conclusao: "CERTIFICADO DE CONCLUSÃO",
    }

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(titles[documentType] || "DOCUMENTO OFICIAL", pageWidth / 2, 55, { align: "center" })

    // Verification code
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100)
    doc.text(`Código de Verificação: ${verificationCode}`, pageWidth / 2, 62, { align: "center" })
    doc.setTextColor(0)

    // Body content
    let yPos = 72
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    const studentName = student.name
    const className = student.class?.name || "—"
    const classGrade = student.class?.grade || 0
    const today = new Date().toLocaleDateString("pt-PT")

    switch (documentType) {
      case "declaracao_frequencia": {
        const bodyText = [
          `Para os devidos efeitos, declara-se que o(a) estudante ${studentName},`,
          `encontra-se regularmente matriculado(a) nesta instituição de ensino,`,
          `na ${classGrade}ª classe, turma ${className},`,
          `no ano lectivo ${academicYearName || "em curso"}.`,
          ``,
          `Mais declara que, até à presente data, o(a) referido(a) estudante`,
          `cumpre com as obrigações escolares estabelecidas no regulamento interno.`,
        ]
        for (const line of bodyText) {
          doc.text(line, 14, yPos)
          yPos += 7
        }
        break
      }

      case "declaracao_matricula": {
        const bodyText = [
          `Para os devidos efeitos, declara-se que o(a) estudante ${studentName},`,
          `efectuou a sua matrícula nesta instituição de ensino,`,
          `na ${classGrade}ª classe, turma ${className},`,
          `referente ao ano lectivo ${academicYearName || "em curso"}.`,
          ``,
          `A presente declaração é emitida a pedido do(a) interessado(a),`,
          `para os fins que julgar convenientes.`,
        ]
        for (const line of bodyText) {
          doc.text(line, 14, yPos)
          yPos += 7
        }
        break
      }

      case "certificado_aproveitamento": {
        doc.text(`O(A) estudante ${studentName}, da ${classGrade}ª classe, turma ${className},`, 14, yPos)
        yPos += 7
        doc.text(`obteve as seguintes classificações no ano lectivo ${academicYearName || "em curso"}:`, 14, yPos)
        yPos += 10

        // Fetch results
        const results = await prisma.result.findMany({
          where: {
            studentId,
            schoolId,
            ...(academicYearId ? { academicYearId } : {}),
          },
          select: {
            score: true,
            trimester: true,
            subject: { select: { name: true } },
          },
          orderBy: { subject: { name: "asc" as const } },
        })

        const subjectAverages = new Map<string, number[]>()
        for (const r of results) {
          if (!subjectAverages.has(r.subject.name)) {
            subjectAverages.set(r.subject.name, [])
          }
          subjectAverages.get(r.subject.name)!.push(r.score)
        }

        const tableData = Array.from(subjectAverages.entries()).map(([subject, scores]) => {
          const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
          return [subject, `${avg}`, avg >= 10 ? "Aprovado" : "Reprovado"]
        })

        const finalAvg = tableData.length > 0
          ? Math.round(tableData.reduce((s, row) => s + parseFloat(row[1]), 0) / tableData.length * 10) / 10
          : 0

        // Simple table
        doc.setFont("helvetica", "bold")
        doc.text("Disciplina", 14, yPos)
        doc.text("Média", 120, yPos)
        doc.text("Resultado", 160, yPos)
        doc.setFont("helvetica", "normal")
        yPos += 2
        doc.setDrawColor(200)
        doc.line(14, yPos, pageWidth - 14, yPos)
        yPos += 4

        for (const row of tableData) {
          doc.text(row[0], 14, yPos)
          doc.text(row[1], 120, yPos)
          doc.text(row[2], 160, yPos)
          yPos += 6
        }

        yPos += 4
        doc.setFont("helvetica", "bold")
        doc.text(`Média Final: ${finalAvg.toFixed(1)} valores`, 14, yPos)
        yPos += 7
        const overallResult = finalAvg >= 10 ? "APROVADO" : "REPROVADO"
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.text(`Resultado Final: ${overallResult}`, 14, yPos)
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        yPos += 10
        break
      }

      case "certificado_merito": {
        const results = await prisma.result.findMany({
          where: {
            studentId,
            schoolId,
            ...(academicYearId ? { academicYearId } : {}),
          },
          select: { score: true, subject: { select: { name: true } } },
        })

        const scores = results.map((r) => r.score)
        const avg = scores.length > 0
          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
          : 0

        const bodyText = [
          `O(A) Conselho de Direcção do ${school.name} vem, por este meio,`,
          `conceder o presente Certificado de Mérito ao(à) estudante ${studentName},`,
          `da ${classGrade}ª classe, turma ${className},`,
          `pelo seu excelente desempenho académico no ano lectivo`,
          `${academicYearName || "em curso"}, tendo alcançado a média de ${avg.toFixed(1)} valores.`,
          ``,
          `O(A) referido(a) estudante faz parte do Quadro de Honra da escola,`,
          `distinguindo-se pelo seu esforço, dedicação e resultados exemplares.`,
        ]
        for (const line of bodyText) {
          doc.text(line, 14, yPos)
          yPos += 7
        }
        break
      }

      case "historico_escolar": {
        // Get all academic histories for this student
        const histories = await prisma.academicHistory.findMany({
          where: { studentId, schoolId },
          include: { academicYear: { select: { name: true } } },
          orderBy: { grade: "asc" },
        })

        if (histories.length > 0) {
          doc.text(`Histórico Escolar do(a) estudante ${studentName}:`, 14, yPos)
          yPos += 8

          for (const h of histories) {
            doc.setFont("helvetica", "bold")
            doc.text(`${h.grade}ª Classe — ${h.academicYear.name} (${h.className})`, 14, yPos)
            doc.setFont("helvetica", "normal")
            yPos += 5

            if (h.subjectResults) {
              const subjects = typeof h.subjectResults === "string"
                ? JSON.parse(h.subjectResults)
                : h.subjectResults
              if (Array.isArray(subjects)) {
                for (const s of subjects) {
                  const name = typeof s === "object" ? (s as { name?: string; subject?: string }).name || (s as { subject?: string }).subject || "—" : s
                  const score = typeof s === "object" ? (s as { score?: number; average?: number; media?: number; nota?: number }).score || (s as { average?: number }).average || (s as { media?: number }).media || (s as { nota?: number }).nota : null
                  doc.text(`  ${name}${score !== null && score !== undefined ? `: ${score} valores` : ""}`, 20, yPos)
                  yPos += 4
                }
              }
            }

            doc.setFont("helvetica", "bold")
            const statusLabels: Record<string, string> = {
              aprovada: "Aprovado",
              reprovada: "Reprovado",
              transferida: "Transferido",
              concluida: "Concluído",
              em_recurso: "Em Recurso",
            }
            doc.text(`  Resultado: ${statusLabels[h.status] || h.status}${h.finalAverage ? ` — Média: ${h.finalAverage}` : ""}`, 20, yPos)
            doc.setFont("helvetica", "normal")
            yPos += 8
          }
        } else {
          doc.text(`O(A) estudante ${studentName} encontra-se actualmente matriculado(a)`, 14, yPos)
          yPos += 7
          doc.text(`na ${classGrade}ª classe, turma ${className}.`, 14, yPos)
          yPos += 7
          doc.text(`Ano Lectivo: ${academicYearName || "em curso"}`, 14, yPos)
        }
        break
      }

      case "certificado_conclusao": {
        const cycleLabels: Record<string, string> = {
          primario: "Ensino Primário",
          primeiro_ciclo: "1.º Ciclo do Ensino Secundário",
          segundo_ciclo: "2.º Ciclo do Ensino Secundário",
        }

        const cycleCert = await prisma.cycleCertificate.findFirst({
          where: { studentId, schoolId },
          orderBy: { completionDate: "desc" },
        })

        if (cycleCert) {
          doc.text(`Certifica-se que o(a) estudante ${studentName},`, 14, yPos)
          yPos += 7
          doc.text(`concluiu com aproveitamento o ${cycleLabels[cycleCert.cycleLevel] || cycleCert.cycleName},`, 14, yPos)
          yPos += 7
          doc.text(`com a média final de ${cycleCert.finalAverage.toFixed(1)} valores,`, 14, yPos)
          yPos += 7
          doc.text(`no ano lectivo ${academicYearName || "em curso"}.`, 14, yPos)
          yPos += 10

          if (cycleCert.certificateData) {
            const data = typeof cycleCert.certificateData === "string"
              ? JSON.parse(cycleCert.certificateData)
              : cycleCert.certificateData
            if (data.disciplinas && Array.isArray(data.disciplinas)) {
              doc.setFont("helvetica", "bold")
              doc.text("Disciplinas concluídas:", 14, yPos)
              doc.setFont("helvetica", "normal")
              yPos += 6
              for (const d of data.disciplinas) {
                doc.text(`  ${d.nome || d.name || d}: ${d.nota || d.score || d.media || "—"} valores`, 14, yPos)
                yPos += 5
              }
            }
          }
        } else {
          doc.text(`Certifica-se que o(a) estudante ${studentName},`, 14, yPos)
          yPos += 7
          doc.text(`concluiu a ${classGrade}ª classe com aproveitamento,`, 14, yPos)
          yPos += 7
          doc.text(`no ano lectivo ${academicYearName || "em curso"}.`, 14, yPos)
        }
        break
      }
    }

    yPos = Math.max(yPos + 10, 140)

    // Signature area
    const sigY = pageHeight - 60
    doc.line(30, sigY, 90, sigY)
    doc.setFontSize(8)
    doc.text("Director(a) da Escola", 60, sigY + 5, { align: "center" })

    doc.line(120, sigY, 180, sigY)
    doc.text("Coordenador(a) Pedagógico(a)", 150, sigY + 5, { align: "center" })

    // Stamp placeholder
    doc.setDrawColor(150)
    doc.setLineWidth(0.5)
    doc.circle(pageWidth - 30, pageHeight - 40, 12)
    doc.setFontSize(5)
    doc.text("CARIMBO", pageWidth - 30, pageHeight - 38, { align: "center" })

    // QR Code
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://cur10usx.com"}/verificar-documento/${verificationCode}`
    try {
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: 100, margin: 0 })
      doc.addImage(qrDataUrl, "PNG", pageWidth - 30 - 10, 14, 20, 20)
    } catch {
      // QR code generation failed, skip
    }

    // Footer
    const footerText = `Documento emitido em ${today} — Código: ${verificationCode} — Verifique em: cur10usx.com/verificar`
    doc.setFontSize(6)
    doc.setTextColor(120)
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" })

    // Save verification record
    await prisma.documentVerification.create({
      data: {
        code: verificationCode,
        documentType: documentType as never,
        studentName,
        studentId,
        className,
        academicYear: academicYearName,
        schoolId,
        serialNumber,
        metadata: {
          grade: classGrade,
          schoolName: school.name,
        },
      },
    })

    // Update serial number counter
    const buffer = Buffer.from(doc.output("arraybuffer"))

    const filenames: Record<string, string> = {
      declaracao_frequencia: "Declaracao_Frequencia",
      certificado_aproveitamento: "Certificado_Aproveitamento",
      certificado_merito: "Certificado_Merito",
      declaracao_matricula: "Declaracao_Matricula",
      historico_escolar: "Historico_Escolar",
      certificado_conclusao: "Certificado_Conclusao",
    }

    const filename = `${filenames[documentType] || "Documento"}_${studentName.replace(/\s+/g, "_")}.pdf`

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
