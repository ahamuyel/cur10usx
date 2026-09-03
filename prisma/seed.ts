import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import crypto from "crypto"

const directUrl = process.env.DATABASE_URL?.replace("-pooler", "") || process.env.DATABASE_URL
const prisma = new PrismaClient({
  datasources: { db: { url: directUrl } },
})

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function retry<T>(fn: () => Promise<T>, label: string, maxRetries = 5): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (err: any) {
      if (i === maxRetries - 1) throw err
      console.log(`  ⏳ ${label}: conexão falhou, retry ${i + 1}/${maxRetries} em 5s...`)
      await sleep(5000)
    }
  }
  throw new Error("unreachable")
}

async function main() {
  console.log("=== Seed Cur10usX ===\n")

  // ─── 1. Super Admin ────────────────────────────────────────────
  const isProduction = process.env.NODE_ENV === "production"
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@cur10usx.com"
  let adminPassword = process.env.SUPER_ADMIN_PASSWORD

  if (!adminPassword) {
    if (isProduction) {
      throw new Error("FALHA DE SEGURANÇA: A variável de ambiente SUPER_ADMIN_PASSWORD é obrigatória para o seed em produção.")
    }
    // Gerar password aleatória forte para ambiente de desenvolvimento local
    adminPassword = crypto.randomBytes(16).toString("hex")
  }

  const hashedPassword = await hash(adminPassword, 12)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { hashedPassword, role: "super_admin", isActive: true, emailVerified: true, provider: "credentials" },
    create: {
      name: "Super Admin",
      email: adminEmail,
      hashedPassword,
      role: "super_admin",
      isActive: true,
      emailVerified: true,
      provider: "credentials",
    },
  })

  if (!isProduction) {
    console.log(`✓ Super Admin configurado com sucesso!`)
    console.log(`  Email: ${adminEmail}`)
    console.log(`  Password temporária local: ${adminPassword}\n`)
  } else {
    console.log(`✓ Super Admin configurado com sucesso para: ${adminEmail}\n`)
  }

  // ─── 2. Platform Config ────────────────────────────────────────
  await prisma.platformConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      name: "Cur10usX",
      description: "Plataforma de Gestão Escolar",
      allowRegistration: true,
      maintenanceMode: false,
    },
  })
  console.log("✓ Platform Config")

  // ─── 3. Ciclos do Sistema Educativo Angolano ───────────────────
  const primario = await prisma.educationCycle.upsert({
    where: { name: "Ensino Primário" },
    update: {},
    create: {
      name: "Ensino Primário",
      level: "primario",
      startGrade: 1,
      endGrade: 6,
    },
  })

  const primeiroCiclo = await prisma.educationCycle.upsert({
    where: { name: "1.º Ciclo do Ensino Secundário" },
    update: {},
    create: {
      name: "1.º Ciclo do Ensino Secundário",
      level: "primeiro_ciclo",
      startGrade: 7,
      endGrade: 9,
    },
  })

  const segundoCiclo = await prisma.educationCycle.upsert({
    where: { name: "2.º Ciclo / Ensino Médio" },
    update: {},
    create: {
      name: "2.º Ciclo / Ensino Médio",
      level: "segundo_ciclo",
      startGrade: 10,
      endGrade: 13,
    },
  })
  console.log("✓ 3 Ciclos de Ensino")

  // ─── 4. 13 Classes Globais ─────────────────────────────────────
  const classNames = [
    { grade: 1, name: "1.ª Classe", cycleId: primario.id },
    { grade: 2, name: "2.ª Classe", cycleId: primario.id },
    { grade: 3, name: "3.ª Classe", cycleId: primario.id },
    { grade: 4, name: "4.ª Classe", cycleId: primario.id },
    { grade: 5, name: "5.ª Classe", cycleId: primario.id },
    { grade: 6, name: "6.ª Classe", cycleId: primario.id },
    { grade: 7, name: "7.ª Classe", cycleId: primeiroCiclo.id },
    { grade: 8, name: "8.ª Classe", cycleId: primeiroCiclo.id },
    { grade: 9, name: "9.ª Classe", cycleId: primeiroCiclo.id },
    { grade: 10, name: "10.ª Classe", cycleId: segundoCiclo.id },
    { grade: 11, name: "11.ª Classe", cycleId: segundoCiclo.id },
    { grade: 12, name: "12.ª Classe", cycleId: segundoCiclo.id },
    { grade: 13, name: "13.ª Classe", cycleId: segundoCiclo.id },
  ]

  for (const cls of classNames) {
    await prisma.globalClass.upsert({
      where: { grade: cls.grade },
      update: { cycleId: cls.cycleId },
      create: cls,
    })
  }
  console.log("✓ 13 Classes Globais")

  // ─── 5. Disciplinas Globais ────────────────────────────────────
  const subjects = [
    { name: "Língua Portuguesa", code: "LP" },
    { name: "Matemática", code: "MAT" },
    { name: "Ciências da Natureza", code: "CN" },
    { name: "Física", code: "FIS" },
    { name: "Química", code: "QUI" },
    { name: "Biologia", code: "BIO" },
    { name: "Geografia", code: "GEO" },
    { name: "História", code: "HIS" },
    { name: "Educação Moral e Cívica", code: "EMC" },
    { name: "Educação Física", code: "EF" },
    { name: "Educação Visual e Plástica", code: "EVP" },
    { name: "Educação Musical", code: "EM" },
    { name: "Inglês", code: "ING" },
    { name: "Francês", code: "FRA" },
    { name: "Filosofia", code: "FIL" },
    { name: "Informática", code: "INF" },
    { name: "Empreendedorismo", code: "EMP" },
  ]

  for (const sub of subjects) {
    await prisma.globalSubject.upsert({
      where: { code: sub.code },
      update: {},
      create: sub,
    })
  }
  console.log(`✓ ${subjects.length} Disciplinas Globais`)

  // ─── 6. Cursos Globais ─────────────────────────────────────────
  const courses = [
    { name: "Ciências Físicas e Biológicas", code: "CFB" },
    { name: "Ciências Económicas e Jurídicas", code: "CEJ" },
    { name: "Ciências Humanas", code: "CH" },
    { name: "Artes Visuais", code: "AV" },
    { name: "Informática", code: "CINF" },
    { name: "Ensino Geral", code: "EG" },
  ]

  for (const course of courses) {
    await prisma.globalCourse.upsert({
      where: { code: course.code },
      update: {},
      create: course,
    })
  }
  console.log(`✓ ${courses.length} Cursos Globais`)

  // ─── 7. Configuração Global de Avaliação ───────────────────────
  await prisma.globalGradingConfig.upsert({
    where: { classGrade_courseId: { classGrade: 0, courseId: "" } },
    update: {},
    create: {
      classGrade: null,
      courseId: null,
      passingGrade: 10,
      resourceMinGrade: 8,
      maxFailedSubjects: 2,
      trimesterWeights: [0.33, 0.33, 0.34],
      roundingMode: "arredondar",
      roundingScale: 1,
      recursoAllowed: true,
      active: true,
    },
  }).catch(() => {
    // If unique constraint fails, try create directly
    return prisma.globalGradingConfig.create({
      data: {
        classGrade: null,
        courseId: null,
        passingGrade: 10,
        resourceMinGrade: 8,
        maxFailedSubjects: 2,
        trimesterWeights: [0.33, 0.33, 0.34],
        roundingMode: "arredondar",
        roundingScale: 1,
        recursoAllowed: true,
        active: true,
      },
    }).catch(() => {
      console.log("  (config global já existe, ignorado)")
    })
  })
  console.log("✓ Configuração Global de Avaliação (default)")

  // ─── 8. Currículo Piloto: Matemática 7ª Classe ──────────────────
  const curriculum = await prisma.curriculum.upsert({
    where: { id: "curriculum-ao-2024" },
    update: {},
    create: {
      id: "curriculum-ao-2024",
      name: "Currículo Nacional - Angola 2024",
      country: "AO",
      version: "2024.1",
    },
  })

  const mathCourse = await prisma.curriculumCourse.upsert({
    where: { id: "curriculum-mat-7" },
    update: {},
    create: {
      id: "curriculum-mat-7",
      curriculumId: curriculum.id,
      name: "Matemática - 7ª Classe",
      grade: 7,
      cycleLevel: "primeiro_ciclo",
    },
  })

  const units = [
    { title: "Números Inteiros", order: 1, description: "Operações com números inteiros, propriedades e aplicações" },
    { title: "Frações e Números Decimais", order: 2, description: "Operações com frações, decimal e percentagem" },
    { title: "Álgebra", order: 3, description: "Expressões algébricas, equações e inequações de 1.º grau" },
  ]

  for (const unit of units) {
    await prisma.curriculumUnit.upsert({
      where: { id: `curriculum-mat-7-unit-${unit.order}` },
      update: {},
      create: {
        id: `curriculum-mat-7-unit-${unit.order}`,
        curriculumCourseId: mathCourse.id,
        ...unit,
      },
    })
  }
  console.log("✓ Currículo Piloto: Matemática 7ª Classe (3 unidades)")

  // ─── 9. Topics para cada Unidade ───────────────────────────────
  const unit1Topics = [
    { title: "Adição de Números Inteiros", order: 1, description: "Soma de números inteiros com sinais" },
    { title: "Subtração de Números Inteiros", order: 2, description: "Subtração e operações com sinais opostos" },
    { title: "Multiplicação de Números Inteiros", order: 3, description: "Produto de números inteiros, sinais" },
    { title: "Divisão de Números Inteiros", order: 4, description: "Divisão inteira e resto" },
    { title: "Propriedades das Operações", order: 5, description: "Comutativa, associativa, distributiva" },
  ]

  const unit2Topics = [
    { title: "Frações Equivalentes", order: 1, description: "Simplificação e ampliação de frações" },
    { title: "Adição e Subtração de Frações", order: 2, description: "Frações com mesmo e diferente denominador" },
    { title: "Multiplicação de Frações", order: 3, description: "Produto de frações e números inteiros" },
    { title: "Números Decimais", order: 4, description: "Representação decimal e operações básicas" },
    { title: "Percentagem", order: 5, description: "Cálculo de percentagens e aplicações" },
  ]

  const unit3Topics = [
    { title: "Expressões Algébricas", order: 1, description: "Termos, coeficientes e simplificação" },
    { title: "Equações de 1.º Grau", order: 2, description: "Resolução de equações lineares" },
    { title: "Inequações de 1.º Grau", order: 3, description: "Resolução e representação gráfica" },
    { title: "Problemas com Equações", order: 4, description: "Tradução de enunciados para equações" },
  ]

  const allTopics = [
    { unitId: "curriculum-mat-7-unit-1", topics: unit1Topics },
    { unitId: "curriculum-mat-7-unit-2", topics: unit2Topics },
    { unitId: "curriculum-mat-7-unit-3", topics: unit3Topics },
  ]

  for (const { unitId, topics } of allTopics) {
    for (const topic of topics) {
      await prisma.curriculumTopic.upsert({
        where: { curriculumUnitId_order: { curriculumUnitId: unitId, order: topic.order } },
        update: {},
        create: { curriculumUnitId: unitId, ...topic },
      })
    }
  }
  console.log("✓ 14 Topics curriculares (5 + 5 + 4)")

  // ─── 10. Lessons e Exercises: Unidade 1 — Números Inteiros ────
  // (conteúdo piloto para validação com 1 turma)

  let school = await prisma.school.findFirst()
  if (!school) {
    school = await prisma.school.create({
      data: {
        name: "Escola Piloto Cur10usX",
        slug: "escola-piloto",
        email: "piloto@cur10usx.com",
        phone: "+244900000000",
        address: "Rua da Semente, 1",
        city: "Luanda",
        provincia: "Luanda",
        status: "aprovada",
      },
    })
    console.log("✓ Escola Piloto criada (seed)")
  }

  let matSubject = await prisma.subject.findFirst({ where: { name: "Matemática" } })
  if (!matSubject) {
    const globalMat = await prisma.globalSubject.findFirst({ where: { name: "Matemática" } })
    matSubject = await prisma.subject.create({
      data: {
        name: "Matemática",
        schoolId: school.id,
        globalSubjectId: globalMat?.id,
      },
    })
    console.log("✓ Subject 'Matemática' criada (seed)")
  }

  if (matSubject && school) {
    await prisma.curriculumCourse.update({
      where: { id: "curriculum-mat-7" },
      data: { subjectId: matSubject.id },
    })
  }

  if (!matSubject || !school) {
    console.log("⚠ Sem Subject 'Matemática' ou School — a saltar seed de Lessons/Exercises")
    console.log("  (criar manualmente depois de criar a escola e disciplina)")
  } else {
    const unit1 = await prisma.curriculumUnit.findUnique({ where: { id: "curriculum-mat-7-unit-1" } })
    if (!unit1) {
      console.log("⚠ Unidade 'Números Inteiros' não encontrada — a saltar")
    } else {
      const topics = await prisma.curriculumTopic.findMany({
        where: { curriculumUnitId: unit1.id },
        orderBy: { order: "asc" },
      })

      const lessonsData = [
        {
          topicOrder: 1,
          lessons: [
            {
              title: "Introdução à Adição de Números Inteiros",
              content: "# Adição de Números Inteiros\n\nA adição de números inteiros segue regras simples:\n\n- **Dois positivos:** somamos e mantemos o sinal positivo\n  - Exemplo: (+3) + (+5) = +8\n- **Dois negativos:** somamos os valores absolutos e mantemos o negativo\n  - Exemplo: (-3) + (-5) = -8\n- **Sinais opostos:** subtraímos o menor do maior e usamos o sinal do maior\n  - Exemplo: (+5) + (-3) = +2\n  - Exemplo: (-5) + (+3) = -2\n\n## Regra da Linha Numérica\n\nQuando somamos um número positivo, avançamos para a direita.\nQuando somamos um número negativo, avançamos para a esquerda.",
              contentType: "teorico" as const,
              estimatedMinutes: 10,
              exercises: [
                {
                  type: "multiple_choice" as const,
                  question: "Quanto é (+7) + (+3)?",
                  options: [{ key: "A", text: "+10" }, { key: "B", text: "-10" }, { key: "C", text: "+4" }, { key: "D", text: "-4" }],
                  correctAnswer: "A",
                  explanation: "Dois positivos: 7 + 3 = 10, sinal positivo.",
                  difficulty: 1,
                },
                {
                  type: "fill_in" as const,
                  question: "Complete: (-4) + (-6) = ___",
                  correctAnswer: "-10",
                  explanation: "Dois negativos: somamos 4 + 6 = 10 e mantemos o negativo.",
                  difficulty: 1,
                },
                {
                  type: "true_false" as const,
                  question: "Verdadeiro ou Falso: (+8) + (-3) = +5",
                  correctAnswer: "true",
                  explanation: "Sinais opostos: 8 - 3 = 5. O maior é positivo, resultado positivo.",
                  difficulty: 1,
                },
              ],
            },
            {
              title: "Prática: Adição com a Linha Numérica",
              content: "# Prática de Adição\n\nUsa a linha numérica para resolver:\n\n```\n... -3  -2  -1   0  +1  +2  +3  +4  +5 ...\n```\n\n**Exercício 1:** Começa em -2 e avança 5 unidades para a direita.\n**Exercício 2:** Começa em +1 e avança 3 unidades para a esquerda.\n**Exercício 3:** Começa em -4 e avança 7 unidades para a direita.",
              contentType: "pratico" as const,
              estimatedMinutes: 15,
              exercises: [
                {
                  type: "multiple_choice" as const,
                  question: "Começando em -2, se avançarmos 5 unidades para a direita, chegamos a:",
                  options: [{ key: "A", text: "+3" }, { key: "B", text: "-7" }, { key: "C", text: "+2" }, { key: "D", text: "-3" }],
                  correctAnswer: "A",
                  explanation: "-2 + 5 = +3",
                  difficulty: 1,
                },
                {
                  type: "fill_in" as const,
                  question: "Complete: (-3) + (+7) = ___",
                  correctAnswer: "+4",
                  explanation: "Sinais opostos: 7 - 3 = 4. O maior é positivo.",
                  difficulty: 2,
                },
              ],
            },
          ],
        },
        {
          topicOrder: 2,
          lessons: [
            {
              title: "Subtração de Números Inteiros",
              content: "# Subtração de Números Inteiros\n\nA subtração pode ser transformada numa adição:\n\n> **Para subtrair, adicionamos o oposto:**\n> a - b = a + (-b)\n\n## Exemplos\n\n- (+5) - (+3) = (+5) + (-3) = +2\n- (+2) - (+7) = (+2) + (-7) = -5\n- (-3) - (-5) = (-3) + (+5) = +2\n- (-4) - (+6) = (-4) + (-6) = -10\n\n## Regra Geral\n\n1. Inverter o sinal do segundo número\n2. Aplicar as regras da adição",
              contentType: "teorico" as const,
              estimatedMinutes: 10,
              exercises: [
                {
                  type: "multiple_choice" as const,
                  question: "Quanto é (+6) - (+9)?",
                  options: [{ key: "A", text: "+15" }, { key: "B", text: "-3" }, { key: "C", text: "+3" }, { key: "D", text: "-15" }],
                  correctAnswer: "B",
                  explanation: "(+6) - (+9) = (+6) + (-9) = -3",
                  difficulty: 1,
                },
                {
                  type: "fill_in" as const,
                  question: "Complete: (-5) - (-8) = ___",
                  correctAnswer: "+3",
                  explanation: "(-5) - (-8) = (-5) + (+8) = +3",
                  difficulty: 2,
                },
                {
                  type: "true_false" as const,
                  question: "Verdadeiro ou Falso: (-3) - (+4) = -7",
                  correctAnswer: "true",
                  explanation: "(-3) - (+4) = (-3) + (-4) = -7. Correto!",
                  difficulty: 1,
                },
              ],
            },
          ],
        },
        {
          topicOrder: 3,
          lessons: [
            {
              title: "Multiplicação de Números Inteiros",
              content: "# Multiplicação de Números Inteiros\n\nA multiplicação segue a regra dos sinais:\n\n| Sinal 1 | Sinal 2 | Resultado |\n|---------|---------|-----------|\n| + | + | **+** |\n| - | - | **+** |\n| + | - | **-** |\n| - | + | **-** |\n\n## Regra\n- **Mesmo sinal:** resultado positivo\n- **Sinais opostos:** resultado negativo\n\n## Exemplos\n- (+3) × (+4) = +12\n- (-3) × (-4) = +12\n- (+3) × (-4) = -12\n- (-3) × (+4) = -12",
              contentType: "teorico" as const,
              estimatedMinutes: 10,
              exercises: [
                {
                  type: "multiple_choice" as const,
                  question: "Quanto é (-5) × (-3)?",
                  options: [{ key: "A", text: "-15" }, { key: "B", text: "+15" }, { key: "C", text: "+8" }, { key: "D", text: "-8" }],
                  correctAnswer: "B",
                  explanation: "Mesmo sinal (- × -): resultado positivo. 5 × 3 = 15.",
                  difficulty: 1,
                },
                {
                  type: "fill_in" as const,
                  question: "Complete: (+6) × (-2) = ___",
                  correctAnswer: "-12",
                  explanation: "Sinais opostos (+ × -): resultado negativo. 6 × 2 = 12.",
                  difficulty: 1,
                },
                {
                  type: "true_false" as const,
                  question: "Verdadeiro ou Falso: (-7) × (+1) = -7",
                  correctAnswer: "true",
                  explanation: "Sinais opostos: resultado negativo. 7 × 1 = 7.",
                  difficulty: 1,
                },
              ],
            },
          ],
        },
      ]

      let totalLessons = 0
      let totalExercises = 0

      for (const lessonGroup of lessonsData) {
        const topic = topics.find(t => t.order === lessonGroup.topicOrder)
        if (!topic) continue

        for (let i = 0; i < lessonGroup.lessons.length; i++) {
          const ld = lessonGroup.lessons[i]
          const lesson = await prisma.lesson.upsert({
            where: { curriculumTopicId_order: { curriculumTopicId: topic.id, order: i + 1 } },
            update: {},
            create: {
              curriculumTopicId: topic.id,
              title: ld.title,
              content: ld.content,
              contentType: ld.contentType,
              estimatedMinutes: ld.estimatedMinutes,
              order: i + 1,
              isPublished: true,
              schoolId: school.id,
            },
          })
          totalLessons++

          for (let j = 0; j < ld.exercises.length; j++) {
            const ed = ld.exercises[j]
            await prisma.exercise.upsert({
              where: { lessonId_order: { lessonId: lesson.id, order: j + 1 } },
              update: {},
              create: {
                lessonId: lesson.id,
                type: ed.type,
                question: ed.question,
                options: ed.options ?? undefined,
                correctAnswer: ed.correctAnswer,
                explanation: ed.explanation,
                points: 10,
                difficulty: ed.difficulty,
                order: j + 1,
                isPublished: true,
              },
            })
            totalExercises++
          }
        }
      }
      console.log(`✓ ${totalLessons} Lessons + ${totalExercises} Exercises (Matemática 7ª — Números Inteiros)`)
    }
  }

  // ─── Fix: Ensure all existing users have emailVerified = true ────
  const updated = await prisma.user.updateMany({
    where: { emailVerified: false },
    data: { emailVerified: true },
  })
  if (updated.count > 0) {
    console.log(`✓ ${updated.count} utilizadores corrigidos (emailVerified → true)`)
  }

  console.log("\n=== Seed concluído com sucesso! ===")
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
