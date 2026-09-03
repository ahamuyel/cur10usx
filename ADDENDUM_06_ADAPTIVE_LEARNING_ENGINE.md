# ADDENDUM 06 — Motor de Aprendizagem Adaptativa: Alinhamento com Reclassificação "Adaptive Learning Platform + School OS"

**Data:** 2026-08-25
**Autor:** Head of Engineering + Product Manager + Technical Project Manager
**Escopo:** Novos modelos Prisma, impacto no roadmap de épicos, estimativa de esforço, loop mínimo testável, decisões pendentes
**Referência:** Auditoria de Alinhamento (19/ago/2026), Master Plan Partes 1–5, Addendum de CLI Findings
**Estado:** PENDENTE DE DECISÃO — 3 pontos marcados `DECISION REQUIRED`

---

## SECÇÃO 0 — Pré-condições e Contexto Não-Negociável

Estas premissas vêm das Partes 1–5 do Master Plan e não são reabertas neste addendum:

| # | Premissa | Fonte |
|---|----------|-------|
| 1 | Reclassificação de categoria: "Adaptive Learning Platform + School OS" (comparáveis: Duolingo, Century Tech, Byju's + SIS) | Decisão de produto |
| 2 | Estratégia de entrada "Cavalo de Troia": vender pela dor administrativa, liderar a narrativa pelo Perfil Evolutivo | Master Plan Parte 2 |
| 3 | Student Experience mínima é P0 do MVP 2.0 | Master Plan Parte 3 |
| 4 | Repo MVP 2.0 = base de trabalho (55 modelos Prisma, 167 rotas API, 83 páginas) | Auditoria 19/ago |
| 5 | Fundação administrativa (auth, multi-tenancy, CRUD, grading, presença, comunicação, certificados) deve ser reaproveitada | Auditoria 19/ago |
| 6 | Marco de fundação (EPIC01–04) estimado para 09/set/2026 | Master Plan Parte 5 |
| 7 | Nenhum modelo do "coração" existe no schema atual | Auditoria 19/ago, confirmado |

---

## SECÇÃO 1 — Novo Bloco de Modelos Prisma: Student Learning Loop

### 1.1 Diagnóstico do Schema Atual

O schema atual tem 55 modelos, todos dedicados à gestão escolar administrativa. O modelo `Subject` (schema:237) existe como âncora académica — cada escola tem Subject vinculada a GlobalSubject, com relações a Assignment, Exam, Lesson (agendamento), Result, CourseSubject e TeacherSubject.

**Colisão de nomes a resolver:** O modelo `Lesson` existente (schema:326) é uma **entidade de agendamento** (day, startTime, endTime, room, subjectId, classId, teacherId). Não contém conteúdo educativo. O loop de aprendizagem precisa de "lições" como unidades de conteúdo. **Solução proposta:** renomear o `Lesson` existente para `ScheduleSlot` (entidade de agenda) e usar `Lesson` para a nova entidade de conteúdo educativo. Alternativa: manter `Lesson` como agenda e chamar a nova entidade `LearningItem`. Opção recomendada: `ScheduleSlot` (clara, sem ambiguidade, alinhada com o que o modelo realmente é).

### 1.2 Modelos Novos — Definição Completa

#### 1.2.1 Curricula (Framework Nacional)

```prisma
model Curriculum {
  id          String   @id @default(cuid())
  name        String                              // ex: "Curriculo Nacional - Angola 2024"
  country     String   @default("AO")
  version     String                              // ex: "2024.1"
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  courses     CurriculumCourse[]
}
```

**Justificação:** Modelar o framework curricular como entidade permite suportar múltiplos países (Angola, Moçambique) e versões ao longo do tempo. No MVP, 1 curriculum ativo por escola.

#### 1.2.2 CurriculumCourse (Mapeamento Course→Curriculum)

```prisma
model CurriculumCourse {
  id              String      @id @default(cuid())
  curriculumId    String
  name            String                              // ex: "7a Classe - Matematica"
  grade           Int
  cycleLevel      EducationLevel
  curriculum      Curriculum  @relation(fields: [curriculumId], references: [id], onDelete: Cascade)
  units           CurriculumUnit[]
  learningPaths   LearningPath[]

  @@unique([curriculumId, name])
}
```

**Relação com schema existente:** `CurriculumCourse` NÃO substitui `Course`. `Course` (schema:254) continua como a entidade escolar (criada pelo admin da escola). `CurriculumCourse` é o template curricular. O link entre ambos é semântico (mesmo nome, mesma disciplina) — não físico (FK). Isto evita acoplar o schema escolar ao framework curricular.

#### 1.2.3 CurriculumUnit (Unidades do Curriculo)

```prisma
model CurriculumUnit {
  id                  String          @id @default(cuid())
  curriculumCourseId  String
  title               String                              // ex: "Numeros Inteiros"
  description         String?
  order               Int
  weight              Float           @default(1.0)       // peso na avaliação
  curriculumCourse    CurriculumCourse @relation(fields: [curriculumCourseId], references: [id], onDelete: Cascade)
  topics              CurriculumTopic[]
  learningPaths       LearningPath[]

  @@unique([curriculumCourseId, order])
}
```

#### 1.2.4 CurriculumTopic (Topicos dentro de uma Unidade)

```prisma
model CurriculumTopic {
  id                  String           @id @default(cuid())
  curriculumUnitId    String
  title               String
  description         String?
  order               Int
  curriculumUnit      CurriculumUnit   @relation(fields: [curriculumUnitId], references: [id], onDelete: Cascade)
  lessons             Lesson[]

  @@unique([curriculumUnitId, order])
}
```

#### 1.2.5 Lesson (Conteudo Educativo — NOVO)

```prisma
model Lesson {
  id                  String           @id @default(cuid())
  curriculumTopicId   String
  title               String
  content             String                               // markdown ou JSON rico
  contentType         ContentType      @default(teorico)
  estimatedMinutes    Int?                                 // tempo estimado
  order               Int
  isPublished         Boolean          @default(false)
  schoolId            String
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt
  curriculumTopic     CurriculumTopic  @relation(fields: [curriculumTopicId], references: [id], onDelete: Cascade)
  school              School           @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  exercises           Exercise[]
  lessonContents      LessonContent[]

  @@unique([curriculumTopicId, order])
}
```

**Relação com schema existente:** `Lesson` NOVA (conteúdo educativo) NÃO se confunde com `Lesson` existente (agendamento). A colisão de nomes é resolvida pelo rename proposto em 1.1. Se o rename não for aprovado, esta entidade passa a chamar-se `LearningItem`.

**Relação com School:** Mantida via `schoolId` para multi-tenancy. Cada escola publica as suas versões de Lesson — permite customização local dentro do framework curricular.

#### 1.2.6 LessonContent (Conteudo Auxiliar — OPCIONAL)

```prisma
model LessonContent {
  id              String    @id @default(cuid())
  lessonId        String
  title           String                                    // ex: "Video explicativo", "Leitura complementar"
  url             String?                                   // link externo ou upload
  type            String                                    // video, pdf, link, imagem
  order           Int
  lesson          Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
}
```

#### 1.2.7 Exercise (Exercicios)

```prisma
model Exercise {
  id              String           @id @default(cuid())
  lessonId        String
  type            ExerciseType
  question        String                                    // texto da questao (markdown)
  options         Json?                                    // para multiple_choice: [{key, text}]
  correctAnswer   String                                    // resposta correta (text ou key)
  explanation     String?                                  // feedback apos resposta
  points          Int              @default(10)
  difficulty      Int              @default(1)              // 1=facil, 2=medio, 3=dificil
  order           Int
  isPublished     Boolean          @default(false)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  lesson          Lesson           @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  answers         Answer[]
  masteryScores   MasteryScore[]

  @@unique([lessonId, order])
}
```

#### 1.2.8 Answer (Respostas dos Estudantes)

```prisma
model Answer {
  id              String    @id @default(cuid())
  exerciseId      String
  studentId       String
  answer          String                                    // resposta submetida
  isCorrect       Boolean
  pointsEarned    Int
  timeSpentMs     Int?                                      // tempo em milissegundos
  answeredAt      DateTime  @default(now())
  exercise        Exercise  @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  student         Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([exerciseId, studentId])                         // 1 tentativa por exercise por student (MVP)
}
```

**Nota MVP:** No MVP, 1 tentativa por exercise. Se o design pedir múltiplas tentativas, basta remover o `@@unique` e adicionar `attemptNumber Int`.

#### 1.2.9 MasteryScore (Dominio por Topico)

```prisma
model MasteryScore {
  id              String    @id @default(cuid())
  studentId       String
  exerciseId      String
  subjectId       String                                    // FK para Subject existente (schema:237)
  topicTitle      String                                    // nome do topico (denormalizado para performance)
  score           Float                                     // 0.0 a 1.0 (percentual de dominio)
  calculatedAt    DateTime  @default(now())
  exercise        Exercise  @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  student         Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  subject         Subject   @relation(fields: [subjectId], references: [id], onDelete: Cascade)
}
```

**Relação com Subject existente:** `MasteryScore` referencia diretamente `Subject` (schema:237). Isto é intencional — o score de dominio é sempre por disciplina, e Subject já existe como âncora no schema. Não criamos uma nova entidade paralela.

**Agregação:** O `score` por tópico é calculado a partir das respostas (Answer). A UI mostra "Dominás 72% de Numeros Inteiros" — o score agregado pode ser calculado a cada resposta ou periodicamente (cron). Para MVP, calcular a cada resposta.

#### 1.2.10 StudentXP (Experiencia e Gamificacao)

```prisma
model StudentXP {
  id              String    @id @default(cuid())
  studentId       String    @unique
  totalXP         Int       @default(0)
  level           Int       @default(1)
  updatedAt       DateTime  @updatedAt
  student         Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
}
```

#### 1.2.11 XPEvent (Historico de XP)

```prisma
model XPEvent {
  id              String    @id @default(cuid())
  studentId       String
  amount          Int                                     // positivo=ganho, negativo=perda (futuro)
  source          String                                    // "exercise_correct", "streak_bonus", "lesson_complete"
  referenceId     String?                                  // ID do exercise/lesson que gerou o XP
  createdAt       DateTime  @default(now())
  student         Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@index([studentId, createdAt])
}
```

#### 1.2.12 StudentStreak (Sequencia Diaria)

```prisma
model StudentStreak {
  id              String    @id @default(cuid())
  studentId       String    @unique
  currentStreak   Int       @default(0)                   // dias consecutivos
  longestStreak   Int       @default(0)
  lastActiveDate  DateTime?                                // data da ultima atividade
  updatedAt       DateTime  @updatedAt
  student         Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
}
```

### 1.3 Enums Novos

```prisma
enum ContentType {
  teorico       // texto explicativo
  pratico       // exercicio pratico guiado
  video         // video incorporado
  misto         // combinacao de teorico + pratico
}

enum ExerciseType {
  multiple_choice    // escolha multipla
  fill_in            // preencher espaco em branco
  step_by_step       // resolucao passo a passo (MVP)
  true_false         // verdadeiro/falso (MVP)
  drag_and_drop      // ordenar/associar (pos-MVP)
  short_answer       // resposta curta (pos-MVP)
  listening          // exercicio de audicao (pos-MVP)
}
```

### 1.4 Relações com Modelos Existentes — Mapa Completo

```
EducationCycle ──> GlobalClass ──> Class
                                   |
Course ──> Class ──> Enrollment ──> Student ──> User
   |                                     |
Subject (existente, schema:237)         Answer
   |                                     |
   └── MasteryScore <── Exercise ──── Lesson (NOVA)
                      CurriculumTopic
                      CurriculumUnit
                      CurriculumCourse
                      Curriculum
```

**Princípio:** Subject é a âncora. O Learning Path nasce de CurriculumCourse (template curricular), mas o MasteryScore ancora-se em Subject (entidade escolar). Isto permite que a mesma Lesson sirva múltiplas escolas (via Subject mapping) sem duplicar dados.

**NÃO criamos:** LearningSubject, LearningClass, ou qualquer entidade paralela. O schema existente de Subject, Class, Student, Enrollment continua a ser o que é — o addendum apenas acrescenta a camada de conteúdo e progressão por cima.

### 1.5 Mudanças ao Schema Existente (REQUERIDAS)

| Modelo | Mudança | Impacto |
|--------|---------|---------|
| `Lesson` (schema:326) | **RENOMEAR para `ScheduleSlot`** | Todas as referências a `Lesson` no código precisam de update. ~15 ficheiros afetados (rotas API, components). |
| `Student` (schema:191) | Adicionar relations: `answers Answer[]`, `masteryScores MasteryScore[]`, `studentXP StudentXP?`, `studentStreak StudentStreak?` | Migration simples — adicionar 4 campos de relation. |
| `School` (schema:11) | Adicionar relations: `lessons Lesson[]` (NOVA) | 1 linha no schema. |
| `Subject` (schema:237) | Adicionar relation: `masteryScores MasteryScore[]` | 1 linha no schema. |

**Se o rename de Lesson não for aprovado:** A nova entidade de conteúdo chama-se `LearningItem` em vez de `Lesson`. O schema existente `Lesson` (agendamento) mantém o nome. Trade-off: a UI do teacher mostraria "Learning Items" em vez de "Lessons" — menos natural em português.

---

## SECÇÃO 2 — Impacto no Roadmap de Épicos

### 2.1 Mapa de Épicos Atual (Partes 1–5)

| Épico | Escopo | Dependências | Estado |
|-------|--------|-------------|--------|
| **EPIC01** | Auth, Multi-tenancy, Fundação de dados | Nenhuma | Em curso → meta 09/set |
| **EPIC02** | CRUD Gestão Escolar (Students, Teachers, Classes, Enrollments) | EPIC01 | Paralelo ao EPIC01 |
| **EPIC03** | Grading Engine, Results, Year Transition | EPIC02 | Sequencial ao EPIC02 |
| **EPIC04** | Analytics, Dashboards por role | EPIC01, EPIC02 | Paralelo ao EPIC03 |
| **EPIC05** | (Não definido nas Partes 1–5) | — | — |
| **EPIC06** | Backlog do "coração" (StudentProfile, Portfolio, Feedback Loop) — identificado na Auditoria | EPIC01 | Pós-fundação |

### 2.2 Épico Proposto: EPIC07 — Learning Engine

**EPIC07 — Learning Engine** é o novo épico que materializa a reclassificação "Adaptive Learning Platform". Substitui e absorve o EPIC06 (backlog do "coração"), porque o Perfil Evolutivo, Portfolio e Feedback Loop são **consequências naturais** dos dados gerados pelo Learning Engine — não funcionalidades independentes.

| Fase | Escopo | Dependências | Estimativa |
|------|--------|-------------|------------|
| **EPIC07-A** | Schema + Migrations + Seed (Curriculum → Lesson → Exercise) | EPIC01 | 3–4 dias |
| **EPIC07-B** | API CRUD para conteúdos (Professor cria/edita Lessons e Exercises) | EPIC07-A | 4–5 dias |
| **EPIC07-C** | Student Learning Flow (exercitar → submeter → ver resultado → mastery score) | EPIC07-B | 5–7 dias |
| **EPIC07-D** | Gamificação (XP, Streak) + Dashboard Estudante com Progressão | EPIC07-C | 3–4 dias |
| **EPIC07-E** | Curriculum Seed Tool (importar conteúdo do currículo angolano) | EPIC07-A | 5–7 dias |
| **EPIC07-F** | StudentProfile / Portfolio / Feedback Loop (usa dados do EPIC07-C/D) | EPIC07-C | 4–5 dias |

**Total EPIC07:** 24–32 dias de desenvolvimento (1 pessoa full-time).

### 2.3 Sequenciamento: Onde EPIC07 Entra

```
Setembro 2026
┌─────────────────────────────────────────────────────────┐
│ 09/set ─── EPIC01-04 (Fundação) CONCLUIDO               │
│                                                         │
│ 10/set ─── EPIC07-A (Schema + Migrations)   ← INICIO   │
│ 14/set ─── EPIC07-B (API CRUD conteúdos)                │
│ 19/set ─── EPIC07-C (Student Learning Flow) ← MVP LOOP │
│ 26/set ─── LOOP MÍNIMO TESTÁVEL PRONTO                  │
│                                                         │
│ 27/set ─── EPIC07-D (Gamificação)                       │
│ 01/out ─── EPIC07-E (Curriculum Seed)                   │
│ 06/out ─── EPIC07-F (Profile/Portfolio/Feedback)        │
│                                                         │
│ 10/out ─── EPIC07 COMPLETO                              │
└─────────────────────────────────────────────────────────┘
```

### 2.4 Compete com EPIC06?

**Não — EPIC07 ABSORVE EPIC06.** O EPIC06 (identificado na Auditoria como backlog do "coração": StudentProfile, Portfolio, Feedback Loop) não faz sentido como épico independente. Estas funcionalidades dependem dos dados que o Learning Engine gera (mastery scores, exercise history, XP). Construir EPIC06 sem EPIC07 seria construir uma casca sem conteúdo.

**Recomendação:** Eliminar EPIC06 como épico separado. Absorver o seu escopo no EPIC07-F. O resultado final é o mesmo (student profile, portfolio, feedback), mas com a dependência correta (dados do learning engine primeiro, apresentação depois).

**Impacto na equipa:** Se há equipa em paralelo, EPIC07-B/C e EPIC07-D/E/F podem correr em paralelo (dois devs). Se equipa solo, é sequencial — 4–5 semanas.

---

## SECÇÃO 3 — Estimativa de Esforço e Impacto no Marco de 09/Set

### 3.1 O que cabe DENTRO da fundação (antes de 09/set)

| Item | Cabe? | Justificação |
|------|-------|-------------|
| Schema Prisma dos novos modelos | **SIM** | 13 models + 2 enums. Migration Prisma é rápida (1 dia com revisão). Pode ser feito como parte do EPIC01/02 se houver overlap com seed data. |
| Seed data: 1 curriculum base (Matemática, 7a classe) | **SIM** | Script de seed TS. 1 dia. |
| Rename `Lesson` → `ScheduleSlot` | **SIM (mas arriscado)** | 15 ficheiros afetados. Se feito agora (antes do EPIC03-04 consolidar o código de Lesson), o custo é baixo. Se feito depois, o custo cresce. |

**Recomendação:** Adicionar o schema novo e o rename de Lesson ao EPIC01/02 antes de 09/set. Isto não atrasa a fundação — são 2 dias extra — e garante que o schema está pronto quando o EPIC07 começar.

### 3.2 O que NÃO cabe dentro da fundação

| Item | Porquê | Quando |
|------|--------|--------|
| API CRUD de Lessons/Exercises | Depende do schema estar migrated e do EPIC01 (auth, multi-tenancy) estar concluído | EPIC07-B (setembro) |
| Student Learning Flow | Depende de API + UI | EPIC07-C (setembro) |
| Gamificação (XP, Streak) | Feature completa, não bloqueia o loop básico | EPIC07-D (outubro) |
| Curriculum Seed Tool | Ferramenta de conteúdo, não de fundação | EPIC07-E (outubro) |
| Portfolio/Profile/Feedback | Depende de dados do learning engine | EPIC07-F (outubro) |

### 3.3 Impacto no Marco de 09/Set

**Cenário A — Schema adicionado à fundação (+2 dias):**
- Fundação completa com schema pronto para EPIC07
- EPIC07-A é eliminado (já feito)
- EPIC07 começa em 10/set direto no EPIC07-B
- Loop mínimo testável: **26/set** (1 semana mais cedo)

**Cenário B — Schema fica para EPIC07 (sem alteração à fundação):**
- Fundação completa como planeado em 09/set
- EPIC07-A consome 3–4 dias em setembro
- Loop mínimo testável: **30/set** (1 semana mais tarde)

**Recomendação:** Cenário A. Os 2 dias extra na fundação são investimento que acelera todo o EPIC07.

---

## SECÇÃO 4 — Loop Mínimo Testável (Antes do Investimento Completo)

### 4.1 Premissa

Ao contrário do SIS (validado por 22 entrevistas), o Learning Engine não tem validação com utilizadores reais. Antes de investir 4–5 semanas no EPIC07 completo, é necessário provar o conceito com 1 escola piloto.

### 4.2 Definição do Loop Mínimo

**Escopo mínimo para validação:**

| Componente | Escopo | O que NÃO faz |
|------------|--------|---------------|
| **Disciplina** | 1: Matemática | Não suporta outras disciplinas |
| **Unidade** | 1: "Números Inteiros" | Não há árvore curricular completa |
| **Lições** | 3–5 lições dentro da unidade | Não há conteúdo multimedia |
| **Exercícios** | 5–15 exercícios totais (2–3 por lição) | Não há drag-and-drop, listening, nem simulações |
| **Tipos de exercício** | `multiple_choice`, `fill_in`, `true_false` | Não há `step_by_step`, `short_answer`, nem `drag_and_drop` |
| **Submissão** | 1 tentativa por exercício, resultado imediato | Não há revisão por professor nem múltiplas tentativas |
| **Mastery Score** | Cálculo por exercício (0/1), agregado por tópico | Não há algoritmo adaptativo nem weighting |
| **XP** | **NÃO** (omitido do loop mínimo) | Gamificação fica para EPIC07-D |
| **Streak** | **NÃO** (omitido do loop mínimo) | Streak fica para EPIC07-D |
| **Dashboard** | Página simples: "Completaste 3/5 lições. Dominas 60% de Números Inteiros" | Não há visualização avançada nem comparação |
| **Autoria** | Conteúdo criado manualmente por 1 professor parceiro (ou equipa interna) | Não há Curriculum Seed Tool nem geração IA |

### 4.3 Modelos Necessários para o Loop Mínimo

Apenas 6 dos 13 modelos novos são obrigatórios:

1. `Curriculum` (1 registro seed)
2. `CurriculumCourse` (1: Matemática 7a classe)
3. `CurriculumUnit` (1: Números Inteiros)
4. `CurriculumTopic` (3–5 tópicos)
5. `Lesson` / `LearningItem` (3–5 lições)
6. `Exercise` (5–15 exercícios)
7. `Answer` (submissões do estudante)
8. `MasteryScore` (agregação por tópico)

`StudentXP`, `XPEvent`, `StudentStreak`, `LessonContent` ficam para depois.

### 4.4 Critérios de Sucesso do Loop Mínimo

| Critério | Métrica | Target |
|----------|---------|--------|
| **Estudante consegue exercitar** | Taxa de completion de exercício | > 80% dos estudantes piloto completam pelo menos 1 exercício |
| **Resultado é imediato e compreensível** | Feedback do estudante | "Entendi se acertei ou não" — qualitativo, 5 estudantes |
| **Mastery Score reflete realidade** | Correlação score vs. performance no exame real | > 0.6 (Pearson) — validação com 1 turma |
| **Professor consegue criar conteúdo** | Tempo para criar 5 exercícios | < 30 minutos |
| **Fluxo é usável no telemóvel** | Teste em mobile browser | Sem erros críticos, UX aceitável |

### 4.5 Plano de Validação

| Fase | Ativeto | Duração | Entregável |
|------|---------|---------|-----------|
| **1. Construção** | Implementar loop mínimo (schema + API + UI simples) | 2 semanas | App funcional com 1 disciplina, 1 unidade |
| **2. Conteúdo** | Professor parceiro cria 5 lições + 10 exercícios | 1 semana (em paralelo com fase 1) | Conteúdo real de Matemática 7a classe |
| **3. Piloto** | 1 turma (15–20 estudantes) usa durante 1 semana | 1 semana | Dados de uso, feedback qualitativo |
| **4. Análise** | Avaliar critérios de sucesso | 2 dias | Relatório go/no-go para EPIC07 completo |

**Total: 3–4 semanas** do início da construção à decisão go/no-go.

---

## SECÇÃO 5 — DECISION REQUIRED

### DECISÃO 1 — Sequenciamento do Student Learning Loop

> **O Student Learning Loop entra como P0 do MVP 2.0 (junto com Student Experience mínima), ou fica como P1 pós-fundação?**

**Opção A — P0 do MVP 2.0 (integrado na fundação)**

| Aspecto | Detalhe |
|---------|---------|
| **Vantagens** | Schema novo adicionado antes de 09/set; EPIC07 começa mais cedo; loop mínimo testável em 26/set; mensagem clara à equipa: "isto é o produto, não é extra" |
| **Riscos** | 2 dias extra na fundação; rename de Lesson cria churn no código existente; equipa pode分散 foco entre gestão escolar e learning engine |
| **Custo** | +2 dias fundação, sem atraso no marco de 09/set |

**Opção B — P1 pós-fundação (só schema no MVP, conteúdo depois)**

| Aspecto | Detalhe |
|---------|---------|
| **Vantagens** | Fundação fica 100% como planeado; equipa foca em consolidar o SIS antes de pivotar; menos risco de bugs cross-cutting |
| **Riscos** | EPIC07-A consome 3–4 dias em setembro; loop mínimo testável só em 30/set; atrasa 1 semana a validação com utilizadores reais; mensagem à equipa: "o learning engine é importante mas não urgente" |
| **Custo** | 0 dias extra na fundação; +3–4 dias no início do EPIC07 |

**Opção C — Paralelo sem bloquear (schema no MVP, conteúdo em sprint separado)**

| Aspecto | Detalhe |
|---------|---------|
| **Vantagens** | Schema é adicionado como "próximo passo lógico" sem alterar o plano atual; conteúdo pode ser desenvolvido por dev separado em paralelo |
| **Riscos** | Exige 2 devs; se equipa solo, é idêntico à Opção B |
| **Custo** | Se equipa solo: idêntico a B. Se 2 devs: schema + conteúdo em paralelo |

**RECOMENDAÇÃO: Opção A.** Os 2 dias de investimento no schema antes de 09/set são marginais e aceleram todo o EPIC07. O rename de Lesson é mais barato fazer agora (antes do EPIC03-04 consolidar o código) do que depois. A mensagem à equipa deve ser: "A fundação inclui o schema do learning engine porque ele é parte da identidade do produto, não uma feature adicional."

---

### DECISÃO 2 — Autoria de Conteúdo

> **Quem cria as lessons/exercícios por disciplina alinhados ao currículo angolano?**

**Opção A — Equipa interna (devs + 1 professor parceiro)**

| Aspecto | Detalhe |
|---------|---------|
| **Vantagens** | Controlo total de qualidade; conteúdo pronto antes do piloto; experiência direta com o fluxo de criação (dogfooding) |
| **Riscos** | Custo de tempo de professor parceiro (precisa de compensação ou parceria); conteúdo pode não ser representativo da realidade escolar; limited scalabilidade |
| **Custo** | ~20h de professor parceiro (5 lições × 2h criação + 2h revisão) |

**Opção B — Professores parceiros (1 escola piloto)**

| Aspecto | Detalhe |
|---------|---------|
| **Vantagens** | Conteúdo real da realidade escolar; professor testa o fluxo de criação como用户; validação implícita do product-market fit |
| **Riscos** | Professor pode não ter tempo; qualidade variável; precisa de onboarding na ferramenta; risco de atraso no piloto |
| **Custo** | ~10h de professor (após onboarding) + 5h de suporte da equipa |

**Opção C — Geração assistida por IA + revisão humana (ligando ao Edgar/AI & Data Engineer)**

| Aspecto | Detalhe |
|---------|---------|
| **Vantagens** | Escalável; rápido (gera 50 exercícios em minutos); pode ser automatizado para múltiplas disciplinas; usa competência existente do Edgar |
| **Riscos** | Qualidade variável; exercício gerado pode não estar alinhado ao currículo angolano específico; precisa de revisão humana obrigatória; risco de conteúdo genérico demais |
| **Custo** | ~8h Edgar (prompt engineering + tooling) + 5h professor (revisão) |

**RECOMENDAÇÃO: Opção C como estratégia, Opção A como tática imediata.** Para o loop mínimo (1 disciplina, 1 unidade), usar Opção A — 1 professor parceiro cria o conteúdo manualmente (dogfooding). Paralelamente, Edgar desenvolve a tool de geração IA para o EPIC07-E (Curriculum Seed). Quando a tool estiver pronta, migra-se para Opção C. Isto dá conteúdo rápido para o piloto E prepara a escalabilidade.

---

### DECISÃO 3 — Escopo do Motor de Exercícios no MVP

> **O MVP limita-se a 2–3 tipos de interação cobrindo 1–2 disciplinas piloto, ou implementa o leque completo descrito no design (drag&drop, listening, timeline, simulação)?**

**Opção A — Restrito (MVP): multiple_choice, fill_in, true_false — 1–2 disciplinas**

| Aspecto | Detalhe |
|---------|---------|
| **Vantagens** | Implementável em 1 semana (EPIC07-B/C); validável rapidamente; cobre 80% dos exercícios de Matemática e Português; UI simples e testada |
| **Riscos** | Experiência pode parecer "básica" comparada com Duolingo; professores de disciplinas práticas (Desenho, Música) não conseguem criar exercícios; limita a validação a 2 disciplinas |
| **Custo** | 5–7 dias dev + 3 dias UI |

**Opção B — Intermediário: + step_by_step e short_answer — 3–4 disciplinas**

| Aspecto | Detalhe |
|---------|---------|
| **Vantagens** | step_by_step é essencial para Matemática (resolução de equações); short_answer permite Português e História; cobre 4 disciplinas do currículo angolano |
| **Riscos** | +3–4 dias de dev; step_by_step exige UI de multi-step (mais complexo); validação precisa de mais conteúdo |
| **Custo** | 8–11 dias dev + 4 dias UI |

**Opção C — Completo: + drag_and_drop, listening, timeline, simulação — todas as disciplinas**

| Aspecto | Detalhe |
|---------|---------|
| **Vantagens** | Experiência rica desde o início; diferencial competitivo vs. SIS; suporta todas as disciplinas do currículo |
| **Riscos** | +15–20 dias de dev; dragging UI é complexa em mobile; listening precisa de áudio infrastructure; timeline/simulação são features de produto maduro; atrasa o loop mínimo em 3+ semanas |
| **Custo** | 20–27 dias dev + 7 dias UI |

**RECOMENDAÇÃO: Opção A para o piloto, evoluir para Opção B no EPIC07 completo.** O piloto precisa de provar o conceito com 1 disciplina (Matemática) — `multiple_choice`, `fill_in` e `true_false` são suficientes. Para o EPIC07 completo (outubro), adicionar `step_by_step` (essencial para Matemática) e `short_answer` (essencial para Português). Opção C fica para iterações futuras — drag-and-drop e listening são features de produto maduro que não precisam de MVP.

---

## SECÇÃO 6 — Riscos e Dependências

### 6.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Rename `Lesson` → `ScheduleSlot` causa bugs em código existente | Média | Alto | Fazer rename com migration de dados; testar todas as rotas de Lesson (15 ficheiros); fazer PR dedicado |
| Schema novo cria conflito com migrações pendentes do EPIC01-04 | Baixa | Alto | Adicionar schema no final da cadeia de migrações; usar `prisma migrate dev` com cuidado |
| MasteryScore calculation é lenta com muitos exercises | Baixa | Médio | Indexar por studentId + subjectId; calcular score em batch (não a cada resposta) se necessário |
| Conteúdo curricular angolano não está digitalizado | Alta | Médio | Seed data manual para 1 unidade; não precisa de curriculum completo para piloto |

### 6.2 Dependências Externas

| Dependência | Estado | Impacto se bloqueada |
|-------------|--------|---------------------|
| Professor parceiro para criar conteúdo | **A IDENTIFICAR** | Sem conteúdo, o piloto não acontece. Prioridade máxima. |
| Escola piloto para validar | **A IDENTIFICAR** | Sem escola, não há dados reais. Pode usar turma existente se houver. |
| Edgar (AI & Data Engineer) para geração IA | Disponível | Não bloqueia piloto (usa conteúdo manual), bloqueia EPIC07-E |
| Currículo angolano digitalizado | **NÃO EXISTE** | Não bloqueia — seed data manual basta para piloto |

### 6.3 Outros Riscos de Produto

| Risco | Descrição | Mitigação |
|-------|-----------|-----------|
| **Validação insuficiente** | O loop mínimo é testado com 1 turma de 15 alunos — amostra pequena | Usar dados qualitativos (entrevistas) em paralelo com quantitativos |
| **Expectativa vs. realidade** | Comparação com Duolingo é inevitável — MVP vai parecer "básico" | Posicionar como "primeira versão", comunicar roadmap de evolução |
| **Professores não adotam** | Se a ferramenta de criação de conteúdo for difícil, professores não criam exercícios | Dogfooding desde o início; 1 professor parceiro como co-criador, não só reviewer |

---

## SECÇÃO 7 — Checklist de Implementação

### 7.1 Pré-EPIC07 (até 09/set)

- [ ] Decidir DECISÃO 1 (sequenciamento)
- [ ] Decidir DECISÃO 2 (autoria de conteúdo)
- [ ] Decidir DECISÃO 3 (escopo de exercícios)
- [ ] Adicionar schema Prisma (13 models + 2 enums) ao repo
- [ ] Renomear `Lesson` → `ScheduleSlot` (ou decidir nome alternativo)
- [ ] Criar migration Prisma
- [ ] Seed data: 1 Curriculum, 1 CurriculumCourse, 1 CurriculumUnit
- [ ] Identificar professor parceiro para conteúdo
- [ ] Identificar escola piloto

### 7.2 EPIC07-A (semana de 10/set)

- [ ] Migration Prisma executada em staging
- [ ] Verificar integridade do schema (relations, indexes)
- [ ] Atualizar referências a `Lesson` no código (~15 ficheiros)
- [ ] Seed data completo para 1 disciplina piloto

### 7.3 EPIC07-B (semana de 14/set)

- [ ] API CRUD: Curriculum, CurriculumCourse, CurriculumUnit, CurriculumTopic
- [ ] API CRUD: Lesson (NOVA), Exercise
- [ ] API: submissão de Answer + cálculo de MasteryScore
- [ ] Validação: professor consegue criar 5 exercícios em < 30min

### 7.4 EPIC07-C (semana de 19/set — LOOP MÍNIMO)

- [ ] UI: estudante vê lista de lições da unidade
- [ ] UI: estudante exercita (multiple_choice, fill_in, true_false)
- [ ] UI: resultado imediato + explicação
- [ ] UI: dashboard de progressão ("Completaste 3/5 lições")
- [ ] API: mastery score visível ao estudante
- [ ] Teste mobile: fluxo funcional em browser mobile

### 7.5 Validação (semana de 26/set)

- [ ] Piloto: 1 turma, 1 semana de uso
- [ ] Recolha: dados de uso (completion rate, tempo, errors)
- [ ] Recolha: feedback qualitativo (5 entrevistas)
- [ ] Análise: correlação mastery score vs. performance real
- [ ] Decisão: go/no-go para EPIC07 completo

---

## SECÇÃO 8 — Resumo Executivo

O Cur10usX tem uma fundação administrativa sólida (55 modelos, 167 rotas, 83 páginas) mas **zero modelos do "coração" do estudante**. A reclassificação para "Adaptive Learning Platform + School OS" exige um novo bloco de 13 modelos Prisma (Curriculum → Lesson → Exercise → Answer → MasteryScore, XP, Streak) que se conectam ao schema existente via Subject como âncora — sem criar entidades paralelas.

O **EPIC07 — Learning Engine** (24–32 dias) absorve o EPIC06 identificado na Auditoria e deve começar imediatamente após a fundação (10/set). Um **loop mínimo testável** (1 disciplina, 5 exercícios, sem gamificação) pode estar pronto até **26/set** — 3 semanas após o marco da fundação — permitindo validação com utilizadores reais antes do investimento completo.

**3 decisões estão pendentes** (secção 5) e precisam de ser resolvidas antes de iniciar o EPIC07: sequenciamento (P0 vs P1), autoria de conteúdo (interno/parceiro/IA), e escopo de exercícios (restrito/intermediário/completo). Sem estas respostas, nenhuma estimativa de esforço é confiável.

**Recomendação final:** Adicionar o schema à fundação agora (+2 dias), usar conteúdo manual para o piloto, e escalar com IA depois. O learning engine não é uma feature — é a identidade do produto.

---

*Fim do Addendum 06*
