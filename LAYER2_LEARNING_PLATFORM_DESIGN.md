# LAYER 2 — LEARNING PLATFORM · Design & Vertical Slice

> **Primeira entrega obrigatória** — antes de qualquer alteração estrutural ao código.
> Estado da revisão: **27/ago/2026**, branch `learning`.

**Foco desta fase (reequacionado):**
> A Camada 2 **existe** e é a **Learning Platform**. Este documento não reabre essa decisão.
> A tarefa é **projetar e construir** a Learning Platform sobre o School OS existente.

- **Layer 1 — School OS:** administra a escola. *(existente, pronta)*
- **Layer 2 — Learning Platform:** ajuda o estudante a aprender. *(esta fase)*
- **Student Development / Evolutive Profile:** conecta as duas camadas. *(futuro — depende de dados da Layer 2)*

---

## 0. Estado real do repositório (auditoria — branch `learning`)

Antes de propor, auditei o repositório. Segue o que **já existe** e o que **falta**.

### 0.1 Já implementado na branch `learning`

| Camada | Peça | Estado |
|--------|------|--------|
| **Schema** | 13 modelos do learning engine + enums `ContentType`, `ExerciseType` | ✅ no `prisma/schema.prisma` |
| **Migração** | `20260825000000_add_learning_engine` | ✅ aplicável |
| **Seed** | Currículo piloto Matemática 7ª (1 curriculum, 1 course, 3 units, 14 topics, 4 lessons, 11 exercises) + subject/school | ✅ no `prisma/seed.ts` |
| **API curriculum** | 8 rotas CRUD (`/api/curriculum/*`) | ✅ |
| **API learning** | 9 rotas (`/api/learning/lessons`, `.../exercises`, `.../submit`, `progress`, `mastery`, `xp`, `streak`) | ✅ |
| **Validações** | Zod: curriculum, lesson, exercise, submit | ✅ `src/lib/validations/academic.ts` |
| **Auth/Autorização** | `requirePermission`, `getSchoolId`, multi-tenancy por `schoolId`, middleware por role | ✅ sólido |
| **Multi-tenancy** | todos os novos modelos content têm `schoolId` | ✅ |

### 0.2 O que NÃO existe (o objetivo desta fase)

- **Nenhuma Student UX.** Não existe **nenhuma** página/componente `.tsx` a referenciar `learning` fora de `src/app/api/`. Não há Home de aprendizagem, Learning Path UI, Lesson player, Exercise player, Feedback, Progress UI.
- **Nenhuma lógica de negócio de domínio** separada (mastery calc, XP, streak, progress). Tudo está **inline** nos route handlers.
- **O loop não está fechado.** O `POST /api/learning/exercises/[id]/submit` grava o `Answer`, mas **não** cria/actualiza `MasteryScore`, `StudentXP`, `StudentStreak`, nem `LearningPath`.
- **Não há** tracking de estado por lição (`Started / In Progress / Completed`).

---

## 0.3 Gaps de domínio identificados (bloqueiam o learning loop do prompt)

> Estes são os pontos que **devem** ser resolvidos antes/de durante a implementação do vertical slice, porque contradizem o comportamento descrito no prompt (multiple attempts, feedback "try again", progress por lesão, mastery substituível).

### GAP-1 — `Answer` tem `@@unique([exerciseId, studentId])` → **1 tentativa por exercício**
`prisma/schema.prisma:1352`. O prompt exige *attempts*, *accuracy*, *recent performance* e feedback "try again". Uma única tentativa bloqueia o loop de revisão/mastery.
- **Proposta:** remover o `@@unique` e permitir múltiplos `Answer` por exercício/estudante (`@@index([studentId, exerciseId])`). Manter a "primeira resposta" para pontuação e usar tentativas posteriores para mastery/revisão.

### GAP-2 — `MasteryScore` é por `exerciseId` + `topicTitle` desnormalizado
Não há relação com `CurriculumTopic` nem `Lesson`. Um tópico dá-nos `MasteryScores` espalhados. Não há cálculo de mastery em lado nenhum (a API só faz `groupBy` das linhas existentes — que **nunca são escritas**).
- **Proposta:** ver secção 2.3 (Modelo Conceptual) — ancorar mastery ao `topic`/`subject` e implementar um **serviço** `computeMastery(masteryService.ts` que centraliza o algoritmo (configurável, substituível), e que o submit invoca.

### GAP-3 — Não há tracking de progresso por lição
`Lesson` sem estado por estudante. O prompt pede `Started → In Progress → Completed` (StudentLessonProgress).
- **Proposta:** novo modelo `StudentLessonProgress` (student state) — separa content vs. student state, como o prompt define (secção 6).

### GAP-4 — `LearningPath` está desligado e sem lifecycle
Existe no schema mas nada o cria/atualiza no flow. `status` é string mágica.
- **Proposta:** criar/atualizar `LearningPath` no início da interação (student state), derivando progresso a partir de `StudentLessonProgress`.

### GAP-5 — Âncora `Subject` não está ligada ao content path
`CurriculumCourse` liga-se a `Course/Subject` **apenas semanticamente por nome** (sem FK). O prompt (secção 19) exige "uma única representação da disciplina escolar".
- **Proposta (incremental, não invasivo):** manter a ligação semântica no piloto, mas adicionar um mapeamento explícito (`CurriculumCourse.subjectId?` ou tabela de mapeamento `CurriculumAlignment`) para responder "que conteúdo curricular esta lesson ensina". **Decisão aberta** (não bloqueia o vertical slice).

### GAP-6 — `submit` expõe `correctAnswer` e responde `409` se já respondido
Com GAP-1 resolvido, o `409` desaparece. O endpoint deve devolver apenas o necessário para o feedback (correct/incorrect + explanation), e o `correctAnswer` só quando a resposta está errada (evitar leaks a re-tentativas).

---

## 1. Current Architecture Audit

```
┌─ Next.js App Router (NextAuth v5) ─────────────────────────────┐
│  (auth)  (dashboard: school_admin/teacher)  (minha-area: me)   │
│          (admin: super_admin)                                  │
├─ API Routes ───────────────────────────────────────────────────┤
│  /api/curriculum/* (CRUD template)    /api/learning/* (flow)   │
├─ Prisma ORM ── PostgreSQL (multi-tenant por schoolId) ─────────┤
│  School OS: School, User, Teacher, Student, Subject, Course,   │
│  Class, EducationCycle, AcademicYear, Enrollment, Result, ...  │
│  Learning: Curriculum*, Lesson, Exercise, Answer, | (já existe)│
│            MasteryScore, LearningPath, XP, Streak              │
└────────────────────────────────────────────────────────────────┘
```

**Modelos escolares de referência (source of truth — NÃO duplicar):**

| Modelo | Linha no schema | Papel na Layer 2 |
|--------|----------------|------------------|
| `Subject` | 244 | **Âncora curricular** — mastery referencia por `subjectId` |
| `Student` | 192 | Estado por estudante (`answers`, `masteryScores`, `learningPaths`, `studentXP`, `studentStreak`) |
| `EducationCycle` | 829 | Nível (`CurriculumCourse.cycleLevel` — semântico) |
| `Class` | 287 | Via `Enrollment → Student` |
| `School` | 11 | Multi-tenancy (todo o content tem `schoolId`) |

**Pontos de integração da Layer 2:**
- **Multi-tenancy:** auth + `getSchoolId` já asseguram isolamento por `schoolId`. Todo novo endpoint deve seguir o padrão `requirePermission(...) : { requireSchool: true }`.
- **Autorização por role:** `requirePermission` (api-auth.ts) — não se baseia em UI.
- **Navegação do estudante:** hoje `/(minha-area)/minha-area`. A Learning Platform terá rotas próprias (ver secção 7).

---

## 2. Domain Model

### 2.1 Óptica do prompt aplicada aos modelos existentes

```
ESCOLA (existe)                 APRENDIZAGEM (novo / já no schema)
─────────────────────           ──────────────────────────────────
Subject ────────────┬─────────► Subject (âncora, via MasteryScore)
Course ──(semântica)┼─────────► Curriculum → CurriculumCourse
EducationCycle ─────┼─────────► CurriculumCourse.cycleLevel
Class ──► Student ──┤         │   → CurriculumUnit
                     │         │       → CurriculumTopic
                     │         │           → Lesson → LessonContent
                     │         │               → Exercise → options
                     │         ▼
                     └───────── Answer (student state)
                              MasteryScore
                              LearningPath
                              StudentXP / XPEvent / StudentStreak
```

**Regra (já respeitada no código, a manter):** **não criar** `LearningSubject`, `LearningStudent`, `LearningTeacher`, `LearningClass`, `LearningSchool`. `Subject` é a âncora.

### 2.2 Content vs. Student State (confirmado no schema)

| Content (partilhado) | Student State (por estudante) |
|----------------------|-------------------------------|
| `Curriculum`, `CurriculumCourse`, `CurriculumUnit`, `CurriculumTopic` | `Answer` (GAP-1: → múltiplos) |
| `Lesson`, `LessonContent`, `Exercise` | `MasteryScore` (por topic/subject) |
| | `StudentLessonProgress` (NOVO — GAP-3) |
| | `LearningPath` (lifecycle — GAP-4) |
| | `StudentXP`, `XPEvent`, `StudentStreak` |

### 2.3 Modelo conceptual proposto

```
Subject (não duplicar)
   └── Curriculum (template) → CurriculumCourse → CurriculumUnit → CurriculumTopic → Lesson → Exercise → Options(JSON)
   └── MasteryScore (studentId + subjectId + topic)   ← ancorado em Subject (GAP-2)

Student
   ├── StudentLessonProgress (lessonId, status: started/in_progress/completed)   ← NOVO
   ├── Answer[] (múltiplos por exercício)                                         ← GAP-1
   ├── MasteryScore[] (por topic/subject)                                         ← GAP-2
   ├── LearningPath[] (curso, unidade, status, startedAt/completedAt)             ← GAP-4
   ├── StudentXP / XPEvent[]
   └── StudentStreak
```

**Alterações Prisma propostas (4):**
1. `Answer`: remover `@@unique([exerciseId, studentId])` → `@@index([studentId, exerciseId])` (**GAP-1**).
2. Novo modelo `StudentLessonProgress` (`@@unique([studentId, lessonId])`) (**GAP-3**).
3. `MasteryScore`: opcional — adicionar `topicId?`/`lessonId?` e `attempts/_count`, remover dependência de `exerciseId` obrigatório; manter `@@unique([studentId, topic|subject])` para idempotência (**GAP-2**).
4. `LearningPath`: garantir lifecycle no flow (não é mudança de schema) (**GAP-4**).

Nenhuma destas alterações quebra o School OS: são aditivas dentro do learning domain já presente.

---

## 3. Prisma Relationship Proposal

### 3.1 Relações propostas (devem respeitar multi-tenancy e âncora `Subject`)

```prisma
model StudentLessonProgress {          // NOVO — student state
  id         String   @id @default(cuid())
  studentId  String
  lessonId   String
  status     LessonProgressStatus @default(started)   // started | in_progress | completed
  startedAt  DateTime @default(now())
  completedAt DateTime?
  student    Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  lesson     Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  @@unique([studentId, lessonId])
  @@index([studentId])
}

model Answer {                        // GAP-1 — múltiplas tentativas
  // remover: @@unique([exerciseId, studentId])
  // adicionar: @@index([studentId, exerciseId])
  attempt     Int      @default(1)    // n.º de tentativa
}

model MasteryScore {                  // GAP-2 — ancorado em topic/subject
  id        String   @id @default(cuid())
  studentId String
  // exerciseId → manter opcional (contexto) mas não obrigatório
  subjectId String
  topicId   String?                  // referência ao CurriculumTopic (não desnormalizar título)
  score     Float
  attempts  Int      @default(1)
  calculatedAt DateTime @default(now())
  // idempotência: @@unique([studentId, subjectId, topicId])
}
```

### 3.2 Regras de integridade
- `schoolId` nunca pode ser inferido do cliente — vem da sessão (`getSchoolId`).
- O content (`Lesson`, `Exercise`) tem `schoolId`; o estado do estudante herda o tenant via `Student.schoolId`. A API deve guardar ambos (ex.: `student: { schoolId }` no `where`, já usado nas rotas atuais).
- `Subject` continua a ser a âncora de mastery — nunca criar `LearningSubject`.

---

## 4. Learning Lifecycle

```
Subject → LearningPath → Unit → Lesson → Exercise → Answer → Feedback
   → Progress → Mastery → Next Learning Step
```

**Estado por lição (GAP-3):**
`Not started → Started → In Progress → Completed`

**Fluxo de escrita (fecha o loop — hoje aberto):**
1. Student abre Lesson → `StudentLessonProgress` `started`; `LearningPath` `in_progress`.
2. Student resolve Exercise → `POST ../submit` cria `Answer`.
3. Serviço `masteryService` recalcula `MasteryScore` do tópico/disciplina (accuracy + attempts + recent performance) e persiste (upsert idempotente).
4. Se lesson concluída (todos os exercícios obrigatórios respondidos) → `StudentLessonProgress.completed`; avança para próxima lesson.
5. Gamificação (opcional, surface desacoplada): `XPEvent`/`StudentXP`/`StudentStreak` são atualizados no mesmo serviço (registo de eventos), **mas não bloqueiam o loop base**.

**Mastery (v1 — configurável, substituível):**
| 0–39 | 40–69 | 70–89 | 90–100 |
|------|-------|-------|--------|
| Needs Practice | Developing | Proficient | Mastered |

- Thresholds = **configuração** (`platform-config`), não verdade pedagógica.
- Algoritmo concentrado num serviço único → substituível por versão adaptativa futura sem reescrever o engine.

---

## 5. API Contract Proposal

### 5.1 Reusar o existente (sem API paralela)
Mantêm-se as rotas já implementadas. Adições minimalistas para fechar o loop:

| Método | Rota | Descrição | Role |
|--------|------|-----------|------|
| `GET` | `/api/learning/paths` | Learning Paths do estudante + estado | student |
| `GET` | `/api/learning/paths/:id` | path com units/topics/lessons + progresso por lesson | student |
| `POST` | `/api/learning/lessons/:id/start` | marca `StudentLessonProgress` started | student |
| `POST` | `/api/learning/exercises/:id/attempt` | (evolução do `submit` atual) múltiplas tentativas, devolve feedback **sem** corretas "grátis" | student |
| `GET` | `/api/learning/home` | agregado Home: streak, XP, continue, today, progress por disciplina | student |
| `GET` | `/api/learning/progress` | (já existe) — garantir que reflete `StudentLessonProgress` + mastery calculado | student/teacher/admin |
| `GET` | `/api/learning/mastery` | (já existe) — passa a ler mastery persistido | student/teacher/admin |
| `PUT` | `/api/learning/mastery/config` | thresholds/alg config (super_admin) | super_admin |

### 5.2 Observações sobre o `submit` atual
- Deve **deixar de responder `409`** após GAP-1 (permitir re-tentativa).
- Deve devolver `{ correct, explanation, correctAnswer?, pointsEarned }` — `correctAnswer` apenas em resposta errada.
- Deve invocar o serviço de mastery/XP/streak (hoje não invoca).

---

## 6. Authorization Matrix

| Capacidade | Student | Teacher | School Admin | Super Admin |
|------------|:-------:|:-------:|:------------:|:-----------:|
| Ver Learning Paths das suas disciplinas | ✅ (só as suas) | ✅ (da turma) | ✅ (agregado) | ✅ |
| Abrir Lesson / responder exercícios | ✅ | ✅ (criar/editar) | ✅ (criar/editar) | ✅ |
| Ver o próprio progresso/mastery/XP/streak | ✅ (só o seu) | ✅ (de estudantes autorizados) | ✅ (agregado) | ✅ |
| Ver progresso/mastery de estudantes | ❌ | ✅ (turmas suas) | ✅ (escola) | ✅ |
| Criar/rever conteúdo (Lesson/Exercise) | ❌ | ✅* | ✅ | ✅ |
| Gerir curriculum/template global | ❌ | ❌ | ❌ | ✅ |
| Configurar mastery thresholds | ❌ | ❌ | ❌ | ✅ |

\* Depende da decisão de produto (DR2 — autoria). No piloto, conteúdo é seedado/gerido por admin.
**Regra:** autorização sempre validada no backend (`requirePermission`) — nunca só na UI. Multi-tenancy: um estudante nunca acede a conteúdo/progresso/mastery de outra escola.

---

## 7. Student UX Flow

### 7.1 Rotas de navegação do estudante (não tocar na navegação admin)
```
/(learning)                          ← nova árvore (login-exigido, role student)
  ├── home        → "O que devo fazer agora?" (streak, XP, continue, today, progress)
  ├── learn/paths → Learning Paths por disciplina
  ├── learn/[pathId] → UI de progressão (completed/current/available/locked/review)
  ├── lessons/[lessonId] → Lesson player (intro → conceito → exemplo → exercícios → conclusão)
  └── progress    → onde estou / o que completei / o que fazer a seguir
```
> O middleware atual redireciona por role; a nova árvore será alvo de `requirePermission(["student", ...])`.

### 7.2 Componentes UX principais
| Componente | Descrição |
|------------|-----------|
| `LearningHome` | streak 🔥, XP ⭐, botão "Continue", hoje, progresso por disciplina |
| `LearningPathView` | nós: 🟢 completed / 🔵 current / ⚪ available / 🔒 locked / ⚠️ review |
| `LessonPlayer` | passos curtos, barra de progresso, próximo passo |
| `ExercisePlayer` | multiple choice / fill-in / true-false (P0) |
| `FeedbackPanel` | correct/incorrect + explanation + hint + "try again" |
| `LessonComplete` | resumo + próximo passo |
| `ProgressView` | mastery por disciplina/tópico, recent activity |

### 7.3 Princípio de design
Cada ecrã responde a uma das três perguntas do prompt: *Where am I?* / *What should I do next?* / *Am I improving?*. Nada administrativo, nada estilo PDF/LMS.

---

## 8. Vertical Slice Scope

**Alvo do piloto (Math 7ª):**
```
1 School → 1 Subject (Matemática) → 1 Curriculum → 1 CurriculumCourse (7ª)
   → 1 Unit (Números Inteiros) → 3-5 Topics → 3-5 Lessons → 5-15 Exercises
   → 1 Student (login → home → continue → lesson → feedback → progress → mastery → next)
```

**Tipos de exercício P0:** `multiple_choice`, `fill_in`, `true_false`. (Arquitetura pronta para mais; não implementar drag&drop/listening/etc. agora.)

**Fora do slice:** AI Tutor, recommendation engine, XP/streak avançados (gamificação completa), CMS gigante, achievements complexos, multi-disciplinas, multi-escolas, analytics avançados.

**Gamificação nesta iteração:** mostrar XP/streak na Home **apenas leitura** se o serviço já os gravar; o sistema completo de gamificação fica fora, mas os eventos são registados pelo serviço de mastery (desacoplado).

---

## 9. Implementation Plan (fases)

> Seguindo o prompt §30, sem escrever centenas de ficheiros de uma vez.

| Fase | Escopo | Output |
|------|--------|--------|
| **PHASE 0** | Repository audit | ✅ **este documento** (já feito) |
| **PHASE 1** | Domain design + fecho dos GAPs (decisões) | Diagramas + modelo conceptual (acima) |
| **PHASE 2** | Data layer: migração Prisma (GAP-1/2/3), ajustes seed, serviço de mastery | modelos + serviço `masteryService.ts` |
| **PHASE 3** | Learning API: fechar loop (`submit` → mastery/XP/streak/progress), `start`, `paths`, `home` | APIs atualizadas + novas |
| **PHASE 4** | Student UX: Home, Path, Lesson, Exercise, Feedback, Progress | componentes + páginas `/(learning)` |
| **PHASE 5** | Vertical slice E2E | DB → API → business → UI → student |
| **PHASE 6** | Validação com estudantes reais | go/no-go (critérios ADDENDUM_07 §17) |

**Ordem de execução das alterações de schema:** migração única que trata GAP-1 (Answer), GAP-2 (MasteryScore), GAP-3 (StudentLessonProgress) num só passo, para não fragmentar o histórico de migrações.

---

## 10. Risks & Open Decisions

### Riscos técnicos
| Risco | Mitigação |
|-------|-----------|
| Alterar `Answer` p/ múltiplas tentativas afeta lógica existente de pontuação | Manter `pointsEarned` apenas na 1.ª tentativa; tentativas seguintes alimentam mastery/sem pontos |
| Migração com dados existentes em `Answer`/`MasteryScore` | Verificar volume no ambiente real antes da migração; migração aditiva |
| Performance de mastery em massa | Indexar por `studentId`; calcular por tópico (batch) no serviço |
| UI mobile | Componentes responsive desde o início; testar mobile no slice |
| Expor `correctAnswer` por engano | `submit` devolve `correctAnswer` só em resposta errada |

### Decisões abertas (para aprovação antes da PHASE 3+)
1. **Âncora Subject no content path (GAP-5):** manter ligação semântica por nome vs. adicionar `CurriculumCourse.subjectId`. Recomendado: manter semântica no piloto, adiar mapeamento explícito.
2. **MasteryScore granularidade (GAP-2):** por `topic` (recomendado) vs. por `lesson` vs. por `subject`. Recomendado: `topic` + agregação a `subject`.
3. **Autoria de conteúdo (DR2 reutilizada):** confirmar se o Teacher cria conteúdo no piloto ou se fica sementeado (recomendado: seedado, autoria pós-validação).
4. **Gamificação no slice (DR):** mostrar XP/streak na Home (leitura) vs. omitir por completo. Recomendado: mostrar se o serviço gravar, sem UI de gamificação completa.

### Riscos de produto
| Risco | Mitigação |
|-------|-----------|
| Conteúdo desalinhado ao currículo real | Professor valida o conteúdo piloto |
| Estudantes não adotam | Vertical slice + piloto de 1 turma (critérios go/no-go) |
| Comparação com Duolingo | Posicionar pelo alinhamento escolar, não por features |

---

## 11. Definition of Done (desta fase)

O slice está **concluído** quando, **end-to-end**, com auth + authorization + multi-tenancy + DB + APIs + validação + testes:

```
Student → vê learning path → abre lesson → completa exercícios → recebe feedback
   → progresso persistido → mastery muda → student vê progresso → continua a aprender
```
e não apenas quando "as páginas foram criadas".

**Testes mínimos:** unit (mastery calc, answer validation, progress calc, XP, streak) · integration (start lesson, submit answer, progress persistido, mastery atualiza, authorization) · e2e (login → path → lesson → exercises → finish → progress).

---

## 12. O que NÃO fazer nesta fase
AI Tutor, recommendation engine, 20 tipos de exercício, marketplace, career matching, social network, leaderboards globais, CMS gigante, centenas de disciplinas/lessons, analytics avançados, predictive modeling. **Não** reconstruir o School OS nem criar entidades paralelas.

---

## Aguardando aprovação
Segue os 10 outputs obrigatórios. **Aguardar aprovação** antes de executar alterações estruturais (PHASE 2 — migração Prisma e serviço de mastery).
