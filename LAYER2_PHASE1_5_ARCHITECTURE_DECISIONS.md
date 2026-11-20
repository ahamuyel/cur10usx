# LAYER 2 — PHASE 1.5 · Learning Platform Architecture Decisions

> **Estado da revisão:** 28/ago/2026 — branch `learning`.
> **Natureza:** decisões arquitecturais e de produto. **SEM alterações de código.**
> Este documento **revisa** `LAYER2_LEARNING_PLATFORM_DESIGN.md` (Phase 0) e prepara a aprovação da Phase 2.
> **Regra final:** nada é executado até o Alberto aprovar ("aprovado, avançar para Phase 2").

---

## 1. Executive Decision Summary

**Veredicto central:** a implementação actual na branch `learning` está **mais avançada** do que o documento de Phase 0 descreve. O schema já contém aproximadamente **70% das correcções** que a Phase 0 listava como "propostas" (GAP-1, GAP-3 e grande parte de GAP-2/GAP-5 já estão implementadas na migração `20260827000000_phase2_learning_loop`). O que **falta de facto** não é mais schema estrutural — é **fechar bugs, organizar o serviço, e construir a UX do estudante**.

A Phase 2, portanto, é mais **fechamento de loop + frontend** do que **modelagem**. Isto reduz drasticamente o risco de derrapagem face a 09/09/2026.

### Decisões-chave (aprovadas neste documento, a confirmar na secção 18)
| # | Decisão | Recomendação | Efecto |
|---|---------|--------------|--------|
| D1 | Prioridade do Learning Loop | **A. P0** — fechar o loop é o objectivo da fase | Todo o esforço do learning foca no loop |
| D2 | Autoria de conteúdo | **A. Team interna** no piloto (seed), autoria por professores adiado | Zero ferramentas de CMS no piloto |
| D3 | Tipos de exercício P0 | **Confirmar** MC + fill-in (+ true_false já usado) | Sem novos tipos no piloto |
| D4 | Onde vive o engine | **Dentro da EPIC06** (não EPIC07) | Evita duplicação e serialização |
| D5 | Colisão "Lesson" | **`Lesson` = conteúdo de aprendizagem** (mantém nome); scheduling já é `ScheduleSlot` | Confirmar e documentar |

### Contagem de escopo (Scope Guardrail) — PASS ✅
- **Novos modelos Prisma:** 0 (SLEP/Answer/Mastery já existem; só enums/colunas de endurecimento). [Limite 5]
- **Novos endpoints:** 0 (os que faltam são já existentes; só correcção de bug em `mastery`/`progress` e possivelmente 1 endpoint de review opcional). [Limite 10]
- **Novos serviços:** +1 (refactor do `learningService.ts` existente em ficheiros coesos; sem novos domínios). [Sem limite formal, mas intencionalmente mínimo]
- **Vertical slice:** construível realisticamente por 5 pessoas antes de 09/09/2026, **desde que** a UX se limite ao slice definido (D1/D3). **Sem entrada SCOPE RISK necessária.**

---

## 2. Phase 0 Findings Review

### 2.1 Verificação (contra-teste com o código real)

A revisão re-inspecionou o schema, as migrações e as rotas. **A Phase 0 descreve um estado desactualizado** no que toca ao schema. Correccões ao registo:

| Claim da Phase 0 (GAP) | Estado real verificado na branch | Veredicto |
|------------------------|-----------------------------------|-----------|
| GAP-1: `Answer @@unique([exerciseId, studentId])` → 1 tentativa | **JÁ RESOLVIDO.** `Answer` não tem `@@unique`; tem `attempt Int @default(1)` + `@@index([studentId, exerciseId])`. `submitExerciseAttempt` já implementa tentativas numeradas e idempotência. | **Desactualizado — não re-fazer** |
| GAP-2: `MasteryScore` desnormalizado por `topicTitle`, sem cálculo | **PARCIAL.** `topicTitle` já foi removido; modelo tem `topicId`/`lessonId`/`attempts`, `@@unique([studentId, topicId])`; serviço `recomputeTopicMastery` calcula e faz upsert. **MAS** as rotas `mastery` e `progress` ainda fazem `groupBy(["topicTitle"])` — campo **inexistente** → **rotas partidas.** | **Bugs a corrigir** |
| GAP-3: Sem `StudentLessonProgress` | **JÁ RESOLVIDO.** Tabela criada; `startLesson` e submit tratam in_progress/completed. | **Desactualizado** |
| GAP-4: `LearningPath` sem lifecycle | **PARCIAL.** `advanceLearningPath` marca in_progress/completed; progresso é derivado em `getLearningPath`. Falta transição explícita AVAILABLE e "continue" robusto, mas núcleo existe. | **Endurecer, não criar** |
| GAP-5: `Subject` só semântico | **JÁ RESOLVIDO.** `CurriculumCourse.subjectId` (FK) existe; seed liga a Matemática. | **Desactualizado** |
| GAP-6: `submit` expõe `correctAnswer` e 409 | **PARCIAL.** `correctAnswer` só devolvido em resposta errada; `stripExercise`/`stripLesson` protegem GET de estudantes. Já não há 409 (re-tentativa permitida). | **Endurecer** |
| GAP-7: Sem service layer (lógica inline) | **PARCIAL.** Existe `learningService.ts` (submitExerciseAttempt, recomputeTopicMastery, startLesson, advanceLearningPath, getLearningPath, computeMasteryScore). Está num único ficheiro monolítico. | **Refactor, não criar de raiz** |
| GAP-8: Sem Student UX | **VERDADEIRO.** Só existe `src/app/api/learning/*`; zero páginas `.tsx`. | **Construir (núcleo da Phase 2)** |
| GAP-9: Sem loop E2E fechado | **PARCIAL.** O backend fecha o loop (submit→mastery→completion→path), mas sem UI não há experiência. XP/streak **nunca são escritos**. | **Fechar UX + xp/streak opcional** |
| GAP-10: Colisão "Lesson" | **PARCIALMENTE RESOLVIDO na BD.** O modelo de scheduling já foi renomeado para `ScheduleSlot`/`ScheduleSlotRecord`; as FKs antigas `Lesson_*` foram renomeadas. Ficam colunas residuais `Attendance.lessonId` e `ScheduleSlotRecord.lessonId` a apontar para `ScheduleSlot`. | **Documentar; renomear coluna opcional** |

**Novo gap encontrado (a Phase 0 não o listou):**
- **BUG — `mastery/route.ts` e `progress/route.ts` referenciam `topicTitle`** (campo removido do schema). Ambas as rotas lançam erro em runtime e estão inutilizadas. **Correcção obrigatória, de baixo custo, no arranque da Phase 2.**

### 2.2 Avaliação de qualidade da Phase 0
- **Correctas:** a separação Content vs Student State; a rejeição de modelos duplicados (`LearningSubject` etc.); a âncora `Subject`; a granularidade de mastery por tópico; a decisão de manter a gamificação desacoplada; o slice vertical mínimo.
- **Questionáveis/desactualizadas:** a proposta de "migração única para GAP-1/2/3" — essa migração **já existe** (`20260827000000_phase2_learning_loop`); re-executá-la seria redundante. A recomendação de "adiar subjectId" (GAP-5) foi ultrapassada pela implementação.
- **Em falta:** não sinalizou o bug `topicTitle`; não distinguiu "schema pronto" de "código partido".
- **Complexidade desnecessária:** `MasteryScore` com campos redundantes `exerciseId` + `lessonId` + `topicId` todos opcionais — aceitável para evolução, mas o MVP deve usar **só `topicId`** como canónico (os outros ficam como contexto histórico opcional).

---

## 3. Existing Learning Models Audit

Os 13 modelos + 2 enums existentes, com classificação KEEP / MODIFY / REPLACE / REMOVE.

### Content (partilhado)
| Modelo | Propósito | Campos-chave / Relações | Problema actual | Classificação |
|--------|-----------|--------------------------|-----------------|---------------|
| **Curriculum** | Template de currículo nacional (AO) | name, country, version, active → CurriculumCourse[] | Nenhum. | **KEEP** |
| **CurriculumCourse** | Curso dentro do currículo (ex.: Matemática 7ª) | curriculumId, **subjectId**, name, grade, cycleLevel → units, learningPaths | `cycleLevel` ainda semântico (não FK a EducationCycle); MVP ok | **KEEP** (coluna `subjectId` já adicionada) |
| **CurriculumUnit** | Unidade do curso | curriculumCourseId, title, order, weight → topics, learningPaths | Nenhum. | **KEEP** |
| **CurriculumTopic** | Tópico da unidade — **nível canónico de mastery** | curriculumUnitId, title, order → lessons, masteryScores | Nenhum (modo de mastery). | **KEEP** |
| **Lesson** | Conteúdo de aprendizagem (o "Lesson" correcto) | curriculumTopicId, title, content, contentType, order, isPublished, schoolId → exercises, lessonContents, masteryScores, lessonProgresses | Colisão de nome com scheduling (ver §4.3); **mantém o nome**. | **KEEP** |
| **LessonContent** | Conteúdo auxiliar (URLs/vídeos) | lessonId, title, url, type, order | Não usado no slice; manter para futuro. | **KEEP** (não usar no MVP) |
| **Exercise** | Pergunta de exercício | lessonId, type, question, options(Json), correctAnswer, explanation, points, difficulty, order, isPublished → answers, masteryScores | `correctAnswer` texto — OK no MVP para MC/fill_in/true_false; solução para tipos mais ricos adiada. | **KEEP** |

### Student State (por estudante)
| Modelo | Propósito | Campos-chave / Relações | Problema actual | Classificação |
|--------|-----------|--------------------------|-----------------|---------------|
| **Answer** | Tentativa histórica (imutável) | exerciseId, studentId, **attempt**, answer, isCorrect, pointsEarned, timeSpentMs, answeredAt | Já sem `@@unique`; **GAP-1 resolvido**. | **KEEP** |
| **MasteryScore** | Projecção actual de domínio | studentId, **subjectId**, **topicId?**, lessonId?, exerciseId?, score, attempts →@@unique([studentId,topicId]) | **BUG top-level:** `mastery`/`progress` usam `topicTitle` inexistente. Campos lessonId/exerciseId desnecessários no MVP (manter opcionais). | **MODIFY** (usar só topicId; corrigir rotas) |
| **StudentLessonProgress** | Estado do estudante por lição | studentId, lessonId, status(in_progress/completed), startedAt, completedAt | **Falta estado NOT_STARTED** no enum (implícito por ausência de linha); OK mas documentar. | **MODIFY** (adicionar NOT_STARTED ao enum, opcional) |
| **StudentXP** | Total XP + nível | studentId, totalXP, level | **Nunca é escrito** (só lido). | **KEEP** (escrita adiada) |
| **XPEvent** | Registo de eventos XP | studentId, amount, source, referenceId | **Nunca é escrito.** | **KEEP** (escrita adiada) |
| **StudentStreak** | Sequência de dias | studentId, current/longestStreak, lastActiveDate | **Nunca é escrito.** | **KEEP** (escrita adiada) |
| **LearningPath** | Relação estudante↔curso | studentId, curriculumCourseId, curriculumUnitId?, status(string), startedAt, completedAt →@@unique([studentId,courseId]) | `status` é string mágica; nenhuma transição AVAILABLE. | **MODIFY** (enum de status; derived progress) |

### Enums
| Enum | Conteúdo | Classificação |
|------|----------|---------------|
| **ContentType** | teorico/pratico/video/misto | **KEEP** |
| **ExerciseType** | multiple_choice, fill_in, step_by_step, true_false, drag_and_drop, short_answer, listening | **KEEP** (P0 usa MC, fill_in, true_false; os demais ficam reservados) |

**Classificação agregada:** 12 KEEP, 4 MODIFY (MasteryScore, StudentLessonProgress, LearningPath + enum), 0 REPLACE, 0 REMOVE. **Não se propõe nenhum modelo novo.** Não há razão de domínio para REPLACE: todos os modelos têm papel distinto e coerente.

---

## 4. Canonical Domain Model (incl. naming resolution)

### 4.1 Modelo canónico

```
ESCOLA (School OS — fonte de verdade)
School ──► EducationCycle ──► GlobalClass ──► Class ──► Student
            │                    │
            │                    └──► Enrollment (aluno↔turma, ano lectivo)
            ▼
        Subject  ◄──(ÂNCORA académica)── CurriculumCourse.subjectId
        (name+schoolId único; ligado a GlobalSubject)
```
```
CONTEÚDO (aprendizagem — partilhado entre estudantes)
School → Subject → CurriculumCourse → CurriculumUnit → CurriculumTopic → Lesson → Exercise
```
```
ESTADO DO ESTUDANTE (separado — nunca toca conteúdo partilhado)
Student → LearningPath[course] → StudentLessonProgress[lesson] → Answer[exercise]
          → MasteryScore[topic/subject]
          → (futuro) XP / Streak / Avatar / Recomendações
```

### 4.2 Regra canónica de 1 para 1
- **Um `CurriculumCourse` pertence exactamente a um `Subject`** (`subjectId`). Não existem `LearningSubject`, `CourseSubject`-de-aprendizagem, nem duplicados.
- **O `Subject` académico do School OS é a única âncora** de curriculum, mastery e futuro perfil evolutivo.

### 4.3 Naming collision: "Lesson" (DECISION 5)

**Situação verificada:** na BD, o conceito de agendamento (aula/timeline) já foi renomeado de `Lesson` → **`ScheduleSlot`** (a migração `phase2_learning_loop` renomeou as FKs `Lesson_*` para `ScheduleSlot_*`, e `ScheduleSlotRecord` substituiu o antigo registo de aulas). Portanto **a colisão de modelo já foi resolvida a favor do "Lesson" de aprendizagem**.

**Decisão formal:**
- **`Lesson` → conteúdo de aprendizagem** (mantém o nome). É o conceito canónico e o menos entrincheirado a nível de produto.
- **`ScheduleSlot` → aula/agendamento** (renomeação antiga já aplicada).
- **Colunas residuais** `Attendance.lessonId` e `ScheduleSlotRecord.lessonId` apontam para `ScheduleSlot`. **Recomendação:** mantê-las (renomear colunas com dados existentes e restrições únicas é risco alto, valor baixo), mas documentar a semântica e **não** criar ambiguidade em código novo. Opcional de baixa prioridade: renomear para `scheduleSlotId` numa migração futura dedicada — **DP (fora do 09/09)**.

**Confirmado:** a resolução **não exige renomear** o modelo de scheduling (já feito) nem tocar no `Lesson` de aprendizagem.

---

## 5. Content vs Student State

**Regra inegociável:** o mesmo `Lesson`/`Exercise` é partilhado por muitos estudantes. **Nenhum dado específico de estudante pode viver num record de conteúdo.**

| Content (partilhado, `schoolId`) | Student State (por `studentId`) |
|-----------------------------------|----------------------------------|
| `Curriculum`, `CurriculumCourse`, `CurriculumUnit`, `CurriculumTopic` | `LearningPath` |
| `Lesson`, `LessonContent`, `Exercise` | `StudentLessonProgress`, `Answer`, `MasteryScore`, `XP`, `Streak` |

- Conteúdo é **imutável em produção** (via `isPublished` + edição por admin/teacher, nunca por student).
- `Lesson.isPublished` e `Exercise.isPublished` controlam visibilidade; estudante só vê publicado.
- `schoolId` é o pivô de multi-tenancy: **conteúdo** tem `schoolId` explícito; **estado** herda o tenant via `Student.schoolId`. A API valida ambos (padrão `where: { ..., student: { schoolId } }` já usado).

---

## 6. Subject / Curriculum Integration

**Estrutura decidida:** `Subject → CurriculumCourse → CurriculumUnit → CurriculumTopic → Lesson → Exercise`.

- `Subject` é académico e canónico; **uma única `Subject`** (name+schoolId). `Course` (curso escolar / programa) permanece como conceito **académico distinto** — **não** partilha o caminho de aprendizagem.
- **Role exacto do `CurriculumCourse`:** é o elo que amarra o conteúdo curricular ao `Subject`. É o "Learning Path template" por disciplina+grau. O `LearningPath` (estado do estudante) referencia um `CurriculumCourse`.
- `cycleLevel` (primario/1.º/2.º ciclo) permanece **semântico** no MVP (mapeado a `EducationCycle` por `GlobalClass.grade` → cycle). Não bloquear com FK neste fase.
- **Nenhum modelo novo** de subject/alignment é necessário: `CurriculumCourse.subjectId` já faz o mapeamento explícito "que conteúdo ensina esta disciplina".

---

## 7. Attempt Architecture

**O GAP-1 já está resolvido** na branch (Answer sem `@@unique`, com `attempt`). Formalizar o lifecycle:

- **O que é um attempt:** um **evento histórico imutável** de submissão (`Answer`). Representa "o estudante tentou uma vez responder ao exercício X".
- **Dados do attempt:** `exerciseId`, `studentId`, `attempt` (número), `answer`, `isCorrect`, `pointsEarned`, `timeSpentMs?`, `answeredAt`.
- **Correcção:** calculada no servidor no momento da submissão e **persistida** em `isCorrect`. **Older evidence é imutável** — nunca se sobreescreve uma `Answer` (é a "evidência histórica").
- **Numeração e timestamp:** `attempt` auto-incrementado por (studentId, exerciseId); `answeredAt` registado.
- **Retries:** **ilimitadas no MVP (sem limite configurável)** — é um motor de aprendizagem, não um exame. O 409 desapareceu.
- **Pontuação/XP:** `pointsEarned` **apenas na 1.ª resposta correcta** por exercício (evita farmar XP a re-tentar). Tentativas seguintes alimentam mastery, não pontos.
- **Anti-cheating / avaliação de exame:** **fora de âmbito** por decisão explícita — não desenhámos bloqueios de re-tentativa nem regimes de exame.

---

## 8. Mastery Architecture

**Princípio:** Attempts são a **evidência**; `MasteryScore` é a **projecção** do estado actual do estudante.

- **Nível canónico de mastery (MVP):** **tópico (`CurriculumTopic`)**, agregado depois por `Subject`. (A Phase 0 recomendou o mesmo; é o equilíbrio certo entre granularidade útil e ruído — não por lesson nem por exercício.)
- **Relação:** `MasteryScore` tem `topicId` (canónico) + `subjectId` (para agregação); `lessonId`/`exerciseId` ficam opcionais como contexto histórico, **não usados** no cálculo MVP.
- **Armazenado ou calculado:** **armazenado** (upsert idempotente) por `@@unique([studentId, topicId])`, **re-calculado** a partir dos attempts sempre que há nova submissão (`recomputeTopicMastery`). Armazenar é necessário para leitura barata em Home/Path e para "Continue Learning".
- **Algoritmo v1 (simples, substituível):** `score = round(correct / total * 100)` sobre **todas** as respostas do tópico do estudante. Concentrado em `computeMasteryScore` + `recomputeTopicMastery` → substituível pelo future adaptive sem tocar nos call-sites.
- **Barras (configuráveis, não pedagógicas):** 0–39 Needs Practice · 40–69 Developing · 70–89 Proficient · 90–100 Mastered (já em `MASTERY_THRESHOLDS`).
- **Correcções obrigatórias:** as rotas `mastery` e `progress` usam `topicTitle` (campo removido) — **devem ler `MasteryScore.topicId→CurriculumTopic.title`** em vez de groupBy por um campo inexistente.

---

## 9. Lesson Progress

**Modelo mínimo:** `StudentLessonProgress` (já existe). Estados:
- **NOT_STARTED** (implícito: sem linha) — o enum só tem `in_progress`/`completed`; **recomenda-se adicionar `not_started`** ao enum para explícito e para suportar "Continue"/bloqueio, mas é opcional (a ausência de linha já o representa).
- **IN_PROGRESS** — quando o estudante abre a lição (`POST .../start` cria linha com `in_progress`).
- **COMPLETED** — quando **todos os exercícios publicados da lição foram tentados pelo menos uma vez** (lógica já em `submitExerciseAttempt`). *Nota de produto:* a definição de "completo" pode evoluir para "todos resolvidos correctamente" — **decisão aberta**, recomenda-se "tentado" para o MVP (não prender o estudante).
- **Reversível?** Não directamente no MVP; re-abrir mantém `completed`. Se futuro "Review" pedir re-tentativa, cria-se estado `review` — **deferido**.
- **Percentagem:** **não guardar %** — é derivada (exercícios tentados / total) no `getLearningPath`. Estado mínimo mantém consistência.
- **Derivado de exercícios:** sim, a transição para `completed` decorre dos `Answer`.
- **Retorno posterior:** `getLearningPath` devolve `continueLessonId` (primeira lição não completa em ordem) para "Continue Learning" — já implementado.

---

## 10. Learning Path Lifecycle

- **Relação:** um `LearningPath` = relação **estudante ↔ curriculumCourse** (`@@unique([studentId, curriculumCourseId])`). **Sem "enrollment"** extra nem entidade de participação — a relação simples é suficiente.
- **Lifecycle mínimo:** `available` (implícito: nenhuma linha / curso disponível) → `in_progress` (criado no `start`/primeira submissão) → `completed` (todas as lições do curso completas). Atualmente `status` é **string mágica** — **recomenda-se enum** `LearningPathStatus { available, in_progress, completed }`.
- **Progresso armazenado ou derivado?** **Derivado** (`getLearningPath` calcula % em runtime a partir de `StudentLessonProgress`). Razão: não há redundância que possa dessincronizar; leitura barata com índices. Só `status` e `startedAt/completedAt` são persistidos no `LearningPath`.
- **Correcção `LearningPath.curriculumUnitId`:** coluna opcional que aponta para a unidade "actual" — pouco usada e ambígua. **Recomenda-se ignorá-la no MVP** (a unidade actual deriva da lição incompleta seguinte); remover/renomear fica deferido.

---

## 11. Domain Services

**Existe** `src/lib/learning/learningService.ts` com o núcleo. A Phase 2 faz **refactor de coesão** (não criação de N ficheiros por função). Arquitectura alvo:

```
API Route → Validação (Zod) → Service (ler, validar tenant/state, escrever) → Prisma
```

**Fronteira mínima de serviços (coesos, não 1-por-função):**
1. **`learningService`** (orquestrador do loop): `submitExerciseAttempt`, `startLesson`, `getLearningPath` — o "contrato de domínio" que as rotas chamam.
2. **`masteryService`** (extrair de `learningService`): `computeMasteryScore` (puro), `recomputeTopicMastery`, `masteryCategory`, thresholds — isolado e substituível para o future adaptive.
3. **`progressService`** (extrair): `completeLesson`, `advanceLearningPath`, cálculo derivado de progresso/Continue — mantém regras de transição de estado.

**Candidatos NÃO separados no MVP:** `calculateLearningPathProgress` (fica dentro de progressService/learningService — derivado simples), `awardXP`/`updateStreak` (**deferidos**, ver §13 — não criar serviços agora). Regra: 3 serviços coesos, não 8.

---

## 12. Security Model

### 12.1 Correcção do `correctAnswer`
**Já em parte implementada** (`stripExercise`/`stripLesson` + submit só devolve `correctAnswer` se incorrecta). Formalizar o fluxo seguro (manter):
```
Student → POST /api/learning/exercises/:id/submit { answer }
   → requirePermission(["student"])
   → server resolve ex.lesson.schoolId e valida tenant + isPublished
   → server lê exercise.correctAnswer (nunca enviado antes)
   → server valida → grava Answer → recalcula mastery → gera feedback
   → response { isCorrect, explanation, correctAnswer? (só se errada), pointsEarned, lessonCompleted, mastery }
```
- O cliente **nunca recebe `correctAnswer` antes da submissão**; só em resposta errada (para aprender).
- `GET` de lesson/exercise para student passa por `strip*` (remover `correctAnswer`).

### 12.2 Autorização / tenant / content visibility
| Endpoint | Estudante | Teacher | School Admin | Regra |
|----------|:---------:|:-------:|:------------:|-------|
| `GET /learning/paths`, `home` | ✅ só as suas | ❌ (agregado via progress) | ✅ | tenant via `getSchoolId` |
| `POST lessons/:id/start`, `POST exercises/:id/submit`, `GET lessons/:id`, `GET exercises/:id` | ✅ só as suas (conteúdo publicado da sua escola) | ✅ (criar/editar) | ✅ | valida `lesson.schoolId === schoolId` |
| `GET /learning/progress`, `/mastery`, `/xp`, `/streak` | ✅ só o seu | ✅ (estudante da sua escola, via studentId) | ✅ | student resolve por sessão; teacher/admin fornecem `studentId` e valida `student.schoolId` |
| Criar/editar conteúdo (`curriculum/*`, exercícios) | ❌ | ✅* | ✅ | `requirePermission(..., "canManageLessons"/"canManageSubjects")` |

\* Autoria por teacher no piloto: ver D2 (recomenda-se team interna/seed).
- **Regras invariantes (verificadas no código):** tenant sempre via `getSchoolId`; `schoolId` nunca vem do corpo; conteúdo não publicado é invisível ao estudante; super_admin e admin primário passam por cima apenas em gestão, **nunca** no fluxo de estudante (o estudante é sempre limitado à sua própria escola e aos seus dados).
- **Nota:** as rotas `progress`, `mastery`, `xp`, `streak` passam `canManageLessons` ao `requirePermission` para estudantes — estudantes não são `school_admin`, logo o `permissionKey` é ignorado para eles; correcto mas cosmeticamente estranho. Sugere-se limpar o argumento (estudante não precisa de `canManageLessons`).

---

## 13. XP / Streak Boundary

**Decisão:** XP e Streak **NÃO são necessários** para o primeiro loop técnico funcionar. **Adiá-los para Phase 3+** (depois da validação com estudantes).

- **Justificação:** o slice E2E funciona sem eles; adicioná-los agora aumenta a superfície e o risco. Os modelos já existem (StudentXP, XPEvent, StudentStreak) e são **lidos** pela Home/progress — **apenas leitura no MVP** (mostram 0 se nada foi escrito, o que é aceitável, ou omitir).
- **Quando adicionar:** manter **event-driven e desacoplado** de mastery:
  - `LessonCompleted` → **XPEvent** (+StudentXP.totalXP e level)
  - `LearningDayCompleted` (≥1 exercício correcto num dia) → **StudentStreak** update
  - **Nunca** acoplar a lógica de XP/streak directamente dentro do `submitExerciseAttempt` de núcleo; disparar via serviço/evento à parte.
- Os eventos `XPEvent` já modelados servem de trilha auditável.

---

## 14. Adaptive Learning Boundary

**Definição de "adaptive" para o MVP (única implementável):**
- **Baixa mastery** (Needs Practice/Developing) → **Review** (re-tentar exercícios do tópico).
- **Média mastery** (Proficient) → **Practice** (mais exercícios do mesmo tópico).
- **Alta mastery** (Mastered) → **Next topic**.

Isso é um **mapper simples** a partir do `MasteryScore` já persistido. **NÃO** se constrói: AI tutor, LLM, motor de recomendação, modelação preditiva, personalização avançada, spaced repetition, nem reinforcement learning.

**Extensibilidade sem rewrite:**
- Mastery algorithm está isolado em `masteryService` (substituível).
- A "decisão de próximo passo" deve ser uma **função pura** (`nextStepFor(mastery, path)`) — hoje o `continueLessonId` é "primeira lição incompleta". Para o MVP manter essa regra linear; no futuro trocar a função por uma adaptativa sem alterar a API/dados.
- `.tsx` de UI separa **estado** (progresso/mastery) de **conteúdo**; recomendações futuras apenas consomem os mesmos dados.
- **Não** introduzir infra de ML/agendamento na Phase 2.

---

## 15. Vertical Slice

**Alvo (mínimo definido):** 1 School · 1 Subject (Matemática) · 1 LearningPath (Matemática 7ª) · 1 Unit · 1 Topic · 3 Lessons · 5 Exercises · 1 Student.

**Fluxo do estudante (definição de "funcional"):**
```
Login → Learning Home → Open Path → Open Lesson → Answer Exercise
      → Feedback (correct/incorrect + explanation + try-again)
      → Retry (permitido, sem 409)
      → Complete Lesson → See Progress → See Mastery → Continue
```

**Nota sobre o seed:** o seed actual já cria: 1 curriculum, 1 course (Matemática 7ª), 3 units, 14 topics, **4 lessons** (Não 3) e 11 exercícios na unidade 1. O slice pode **reutilizar o seed existente** — não é preciso reduzir para "3 lessons/5 exercises", o seed já cobre e excede o mínimo. Usar o seed como está (talvez limitar a visibilidade a uma turma para o piloto).

**Tipos P0 (D3):** `multiple_choice`, `fill_in`, `true_false` — os que o seed já usa. Outros tipos ficam reservados no enum mas **não implementados**.

**Domínio de código necessário (Phase 2):**
1. Corrigir bugs `mastery`/`progress` (`topicTitle`).
2. (opcional) adicionar `not_started` + enum `LearningPathStatus`.
3. Refactor de serviços (3 ficheiros coesos).
4. UX `/(learning)`: LearningHome, LearningPathView, LessonPlayer, ExercisePlayer, FeedbackPanel, ProgressView.
5. Limpeza de auth nas rotas (opcional).
6. Testes: unit (mastery, validation, progress), integration (start→submit→mastery→completion→path), e2e (login→path→lesson→exercise→finish→progress).

---

## 16. Phase 2 Scope (Must / Should / Deferred / Out of Scope)

### MUST HAVE (bloqueiam o loop E2E)
1. Corrigir `mastery/route.ts` e `progress/route.ts` (remover `topicTitle`; ler `topicId→CurriculumTopic.title`).
2. Garantir que `submit` fecha o loop de forma consistente (mastery persiste, lesson completa, path avança) — já existe; **testar** e estabilizar.
3. Serviço de mastery desacoplado (extrair `masteryService` + `progressService` de `learningService.ts`).
4. UX do estudante mínima: LearningHome, LearningPathView, LessonPlayer, ExercisePlayer, FeedbackPanel, ProgressView (via `/(learning)`).
5. O slice vertical E2E de 1 estudante (reutilizar seed).
6. Testes unit + integration + e2e do slice.
7. Limpeza de auth nas rotas de progress/mastery/xp/streak (remover `canManageLessons` desnecessário para student).

### SHOULD HAVE (se encaixar no tempo, sem bloquear)
8. Adicionar `not_started` ao `LessonProgressStatus` e enum `LearningPathStatus` (endurecer lifecycle).
9. "Complete lesson" explícito: definir semântica de completion (tentado vs correcto) — **decisão de produto**, ver secção 9.
10. Mostrar XP/streak como **leitura** na Home (0 se vazio) ou omitir — decisão menor.

### DEFERRED (fase 3+)
11. Escrita de XP / Streak (event-driven; ver §13).
12. Adaptive "next step" (mapper simples) — depois de masterizado no slice.
13. Autoria de conteúdo por professores (CMS) e revisão pedagógica.
14. Renomear colunas residuais `lessonId`→`scheduleSlotId` (baixo valor, risco).
15. `CurriculumCourse.cycleLevel` → FK a `EducationCycle`.
16. Novos tipos de exercício (step-by-step, etc.) e `listening`/`drag_and_drop` (reservados no enum).
17. Gamificação avançada (achievements, leaderboards, avatar).

### OUT OF SCOPE
- AI Tutor, motor de recomendação por LLM/ML, predictive modeling, spaced repetition, reinforcement learning.
- Marketplace, rede social, leaderboards globais.
- Multi-escola / multi-disciplina no piloto E2E (o schema suporta, mas o slice é 1).
- Motor de exames / anti-cheating / regimes de prova.
- Reconstruir School OS ou criar entidades paralelas (`LearningSubject`, etc.).

---

## 17. 09/09/2026 Impact

Equipa de 5 (Alberto/PM, Kélcio/DevOps, Tchiade/Backend, Eliandra/Frontend, Edgar/AI&Data). Base: EPIC01–04 (09/09), EPIC02 em paralelo, EPIC06 por detalhar. EPIC06 é o "heart" (Student Development / Evolutive Profile), onde o Learning Platform se ancorará.

| Mudança | Classificação | Racional |
|---------|---------------|----------|
| Corrigir `mastery`/`progress` (`topicTitle`) | **CAN FIT BEFORE 09/09** — 1 dia (backend, Tchiade) | Bug localizado, baixo esforço, destrava Home/Progress |
| Refactor serviços (3 ficheiros) | **CAN FIT BEFORE 09/09** — 1–2 dias (backend) | Reorganização, sem novas funcionalidades |
| Estabilizar/submit/mastery/path (testes) | **CAN RUN IN PARALLEL** — com EPIC01–04 | Só área learning, não toca os épicos de base |
| UX do estudante `/(learning)` | **CAN FIT BEFORE 09/09** — 4–7 dias (Eliandra + Alberto) | Frontend isolado; é o maior item |
| Slice E2E (seed reutilizado) | **CAN FIT BEFORE 09/09** — 2–3 dias (integração, Edgar/Tchiade) | Depende das duas linhas acima |
| Autoria de conteúdo por teachers | **SHOULD FOLLOW FOUNDATION / BLOCKED BY PRODUCT DECISION** | Requer D2; adiado pós-validação |
| XP/Streak escrita | **SHOULD FOLLOW FOUNDATION** — fase 3+ | Não bloqueia loop |
| Adaptive next-step | **SHOULD FOLLOW FOUNDATION** — fase 3+ | Só após mastery validado |
| `cycleLevel`→FK, renomear `lessonId` | **BLOCKED BY CONTENT/risco** — deferido | Migrações com dados; baixo valor agora |
| EPIC06 detalhamento | **CAN RUN IN PARALLEL** (Alberto/PM) | Não requer código; a aprendizagem alimenta-o depois |

**Conclusão de prazo:** com as decisões D1–D5 (especialmente D1=P0 e D3=tipos P0), o slice **cabe antes de 09/09/2026**, **não se move o milestone**. O caminho crítico é: corrigir bugs (rápido) → refactor serviços → UX → integração E2E → testes. As 5 pessoas cobrem isso com folga se a UX for disciplinada ao slice. O detalhamento da EPIC06 é o único item que pode ser avançado **em paralelo** e não atrasa nada.

---

## 18. Decisions Required

**DECISION 1 — Prioridade do Learning Loop**
Opções: A. P0 · B. P1 · C. Vertical slice em paralelo.
**Recomendação: A. P0.** É o objectivo explícito de Layer 2 e o schema está 70% pronto; fechar o loop dá valor imediato e alimenta a EPIC06. (C seria essencialmente igual a A dado o estado do schema.)

**DECISION 2 — Autoria de conteúdo**
Opções: A. Team interna · B. Teachers · C. AI-assisted + revisão humana · D. Híbrido.
**Recomendação: A. Team interna (seed) no piloto**, com revisão pedagógica de um professor voluntário; autoria por teachers (**B**) como fase posterior. **Não assumir como decidido** — requer confirmação de Alberto e disponibilidade de um professor para validar o conteúdo matemático.

**DECISION 3 — Tipos de exercício P0**
P0 = MC, Fill-in (+ true_false já em uso) · P1 = Step-by-step · Later = Drag&drop, Listening, Speaking, Simulation, Timeline.
**Confirmar este limite.** É coerente com o seed e com o tempo. **Challenged:** `true_false` já é usado e é trivial — incluí-lo no P0 confirmado. Não alargar o P0.

**DECISION 4 — Onde vive o Learning Engine: EPIC06 ou novo EPIC07**
**Recomendação: EPIC06 (Student Development / Heart).**
Racional: (1) EPIC06 já é nomeado e é a camada que conecta dados académicos, de aprendizagem, skills, projectos e metas — o Learning Engine é exactamente a fonte de dados de aprendizagem que ele consome; (2) a EPIC06 está **sem tarefas detalhadas**, logo ancorar o engine nela dá a esse épico o seu primeiro "story" concreto em vez de criar um épico novo em paralelo; (3) criar EPIC07 (Adaptive Learning Engine) agora fragmenta: o "adaptativo" é uma evolução do mastery, não um produto separado. **Se** mais tarde o adaptativo se tornar um produto autónomo (LLM/recommendation), pode-se extrair; mas o MVP não justifica.
*Nota contraponto:* se Alberto preferir separar "engine (código)" de "perfil evolutivo (produto)", então EPIC06 = perfil e EPIC07 = engine seria defensável — mas para o slice E2E e a equipa de 5, um único epic (EPIC06) com tasks de engine + perfil é mais simples. **Deixar a favor de EPIC06.**

**DECISION 5 — Naming collision (formal)**
**Confirmar: `Lesson` = conteúdo de aprendizagem (mantém). `ScheduleSlot` = aula/agendamento (nome já aplicado).** Não renomear o modelo de scheduling nem o learning `Lesson`. Colunas residuais `lessonId`→`ScheduleSlot` documentadas, renomeação deferida (DP).

---

## 19. Risks (incl. SCOPE RISK check)

**SCOPE RISK — verificação do guardrail:** propõem-se **0 novos modelos**, **0 novos endpoints** (só correcção de bugs e refactor), **1 refactor de serviços**. Vertical slice realista para 5 pessoas antes de 09/09. **Sem entrada SCOPE RISK.** A única ressalva de escopo é a **UX**: se o escopo da UI crescer para além do slice (muitos ecrãs, gamificação completa, múltiplas disciplinas), isso sim estouraria o tempo — mitigado pelos itens MUST/SHOULD/DEFERRED acima.

| Risco | Nível | Mitigação |
|-------|:-----:|-----------|
| A Phase 0 ser tratada como agenda a executar cegamente (migração redundante, GAPs já resolvidos) | MÉDIO | Este documento corrige o registo; Phase 2 **não re-cria** o que já existe |
| Rotas `mastery`/`progress` partidas bloquearem Home/Progress | ALTO | Correcção no arranque da Phase 2 (item MUST #1) |
| Definição de "lesson complete" ambígua (tentado vs correcto) | MÉDIO | Decisão de produto na secção 9; recomendação: "tentado" para não prender o estudante |
| Escopo da UX crescer além do slice | ALTO | Disciplina por D1/D3 + lista MUST/SHOULD; revisão antes de começar UI |
| Autoria de conteúdo por teachers dispara CMS não planeado | MÉDIO | D2 = team interna/seed no piloto; teacher só valida conteúdo |
| XP/Streak sem escrita mostra "0" no piloto | BAIXO | Decisão clara: leitura-ou-omissão no MVP (item SHOULD #10) |
| Migrações futuras (renomear `lessonId`, `cycleLevel` FK) com dados existentes | BAIXO | Diferidas (DP); testes de migração no ambiente real |
| Conteúdo matemático sem validação pedagógica | MÉDIO | Review de 1 professor antes do piloto com alunos (ligado a D2) |
| Comparação com apps de gamificação (Duolingo) | BAIXO | Posicionar por alinhamento escolar, não por features |

---

## 20. Final Recommended Architecture

```
┌─────────────────────────────── SCHOOL OS (Layer 1 — existe) ───────────────────────────────┐
│ School · User · Teacher · Student · Parent · Class · AcademicYear · Enrollment           │
│ Subject (ÂNCORA) · Course · CourseSubject · EducationCycle · GlobalClass/Subject/Course  │
│ Attendance · Result · Exam · Assignment · ScheduleSlot (# aula) · ScheduleSlotRecord     │
└───────────────┬──────────────────────────────────────────────────────────────┬──────────┘
                │ schoolId (multi-tenancy)                                     │ (académico)
                ▼                                                              │
┌───────────────┴──────────── LEARNING PLATFORM (Layer 2 — Phase 2) ───────────┴────────────┐
│  CONTEÚDO (partilhado)           ESTADO DO ESTUDANTE (por studentId)                      │
│  Curriculum → CurriculumCourse──► LearningPath[course] (status, derived %)                │
│     → CurriculumUnit             StudentLessonProgress[lesson] (NS/IP/CP)                 │
│        → CurriculumTopic ───────► MasteryScore[topic, subject] (armazenado p/ leitura)    │
│           → Lesson ─────────────► Answer[exercise].attempt# (evidência imutável)          │
│              → Exercise          StudentXP / XPEvent / StudentStreak (fase 3+, escrita)   │
│  subjectId: CurriculumCourse.subjectId → Subject                                            │
│                                                                                             │
│  DOMAIN SERVICES (coesos):                                                                  │
│   learningService (loop/UX) · masteryService (puro, substituível) · progressService (estado)│
│  SECURITY: correctAnswer só pós-submissão (só se errada); strip* nos GET; tenant via schoolId│
│  ADAPTIVE (fase 3): nextStepFor(mastery) = pure → Review/Practice/Next (substituível)       │
└────────────────────────────────────────────────────────────────────────────────────────────┘
        │ (consome dados de aprendizagem p/ perfil)
        ▼
┌─────────────── STUDENT DEVELOPMENT / EVOLUTIVE PROFILE (EPIC06 — futuro) ────────────────┐
│  Skills · Projects · Goals · Portfolio · Opportunities · conecta académico + aprendizagem│
└───────────────────────────────────────────────────────────────────────────────────────────┘

LOOP ESTRATÉGICO (feito):
School ensina → Cur10usX reforça → Student pratica (slice) → Cur10usX mede (mastery)
   → Student melhora → Perfil evolui
```

**Regra transversal:** `Subject` é a única âncora académica de curriculum e mastery. Conteúdo nunca contém dados de estudante. Multi-tenancy em todas as camadas via `schoolId`.

---

## 21. Phase 2 Implementation Checklist

> A executar **após aprovação** de Alberto. Nada disto foi feito nesta Phase 1.5.

**Data layer (endurecimento, sem novos modelos):**
- [ ] Decidir e aplicar enum `LessonProgressStatus.not_started` + enum `LearningPathStatus` (SHOULD)
- [ ] Confirmar que `MasteryScore` usa só `topicId` canónico no cálculo; `lessonId`/`exerciseId` ficam opcionais/contexto
- [ ] (Nenhuma migração estrutural nova — o schema já tem o necessário)

**Services/refactor:**
- [ ] Extrair `masteryService.ts` (computeMasteryScore puro + recomputeTopicMastery + thresholds)
- [ ] Extrair `progressService.ts` (completeLesson, advanceLearningPath, derived progress/continue)
- [ ] Manter `learningService.ts` como orquestrador do loop (submitExerciseAttempt, startLesson, getLearningPath)
- [ ] Desacoplar XP/streak (deferido — não escrever ainda)

**API:**
- [ ] Corrigir `mastery/route.ts` e `progress/route.ts` (remover `topicTitle`)
- [ ] Limpar `canManageLessons` desnecessário nas rotas de progress/mastery/xp/streak para student
- [ ] Confirmar/submit fecha o loop E2E (mastery→completion→path) com testes
- [ ] Confirmar segurança `correctAnswer` (strip nas leituras; só devolvido se errada)

**UX (novo, `/(learning)`):**
- [ ] `LearningHome` — continue, hoje, progresso por disciplina
- [ ] `LearningPathView` — completed/current/available/locked/review
- [ ] `LessonPlayer` + `ExercisePlayer` (MC/fill_in/true_false)
- [ ] `FeedbackPanel` (correct/incorrect + explanation + retry)
- [ ] `ProgressView` (mastery por tópico/disciplina)
- [ ] Middleware/roteamento por role student para `/(learning)`

**Seed:**
- [ ] Reutilizar seed actual (já tem 1 course/3 units/14 topics/4 lessons/11 exercises), limitar piloto a 1 turma se necessário

**Testes:**
- [ ] Unit: mastery calc, answer validation, progress calc
- [ ] Integration: start→submit→mastery atualiza→lesson completa→path avança; authorization; tenant
- [ ] E2E: login→path→lesson→exercise→feedback→retry→finish→progress

---

## 22. WHAT WE ARE APPROVING FOR PHASE 2

> Itens concretos e mínimos. Nada para implementar agora — apenas aprovação de âmbito.

1. **Fechar o loop de aprendizagem** com base na implementação actual (schema já correcto, ~70%).
2. **Corrigir bugs** nas rotas `mastery` e `progress` (referência a `topicTitle` inexistente).
3. **Refactor dos serviços** existentes em 3 ficheiros coesos (learning / mastery / progressService). Sem novos modelos; sem novos endpoints; sem novos tipos de exercício.
4. **Construir a UX do estudante** mínima (`/(learning)`): Home, Path, Lesson/Exercise player, Feedback, Progress — para o **slice** de 1 estudante/Matemática 7ª (reutilizar o seed actual).
5. **Testes** unit + integration + e2e do slice.
6. **Endurecimento opcional** de enums (`not_started`, `LearningPathStatus`) conforme caiba no tempo.
7. **Adiar (fase 3+):** escrita de XP/Streak, adaptive "next step", autoria por teachers, novos tipos de exercício, renomeações de migração.

**Aprovar: [ ] Sim — avançar para Phase 2   [ ] Com alterações (especificar)**

---

*Fim da Phase 1.5. Nenhum código foi alterado. Aguarda-se aprovação explícita de Alberto para iniciar a Phase 2.*
