# RELATÓRIO DE AUDITORIA — CUR10USX

*Auditoria profunda, baseada em evidências do repositório real (`/home/ahamuyel/cur10usx`, HEAD `ba78c1e`).*

---

## Executive Summary

O Cur10usX é um projeto ambicioso e já substancial: **~74.500 linhas de TypeScript/TSX, 197 route handlers de API, ~50 páginas, um schema Prisma com 40+ modelos e um motor de avaliação testado**. Há engenharia real: cascata de config de avaliação, transição de ano letivo transacional, snapshots de saúde académica, previsões determinísticas, 2FA, CSRF, rate limiting, auditoria e GDPR. A base para um SaaS EdTech multi-tenant **existe e é parcialmente sólida**.

**O que está bom**: o motor de avaliação (regras de Angola, recurso, honra), a transição de ano em transação única, a maioria das routes com `getSchoolId(session)` + zod, o fluxo de password reset (tokens de alta entropia, single-use, expiração, invalidação de sessão via `sessionVersion`), e o padrão consistente de scoping por escola nas rotas de analytics.

**O que está perigoso** — falhas que tornam o sistema **inseguro para escolas reais hoje**:

1. **2FA é efetivamente uma verificação única na vida da conta** — `twoFactorVerifiedAt` é gravado permanentemente na BD e sincronizado em todo novo JWT; depois do primeiro login, nenhum outro login pede código (CRÍTICO, `auth.ts:206-210`).
2. **Escalação de privilégio**: qualquer utilizador autenticado pode chamar `/api/school-registrations` e tornar-se `school_admin`; o estado `pendente` da escola **nunca é verificado** nas routes (CRÍTICO).
3. **Fuga de dados entre tenants**: `results/averages` (IDOR por estudante), `user/search` (enumeração global de e-mails), `parents` (qualquer aluno lê todos os pais), `students/[id]/history` e `certificates` (queries sem `schoolId`), `notifications/broadcast` (qualquer utilizador injeta eventos WebSocket).
4. **Cron sem autenticação** e, simultaneamente, **bloqueado pelo middleware** no Vercel — o snapshot diário nunca roda em produção e qualquer utilizador pode forçar o delete de retenção de todas as escolas (CRÍTICO).
5. **CSRF só em 9 handlers** (~140 rotas de mutação desprotegidas) e **rate limiting por IP contornável** via `X-Forwarded-For`.
6. **Credencial super-admin hardcoded em código rastreado** (`migrate-to-multitenant.ts:62`, password `cur10usx`) e **secrets reais em `.env` não rotacionados**; **sem `.dockerignore`** (o `.env` entra nas layers de imagem).
7. **Sem backups**, sem monitoring, sem CSP, deploy CI **quebrado** (referencia `k8s/` inexistente).
8. **Sem testes** de segurança, multi-tenancy ou autorização — apenas 453 linhas de teste (avaliação, middleware, password).

**O que está ausente**: testes de integração/API, isolamento por tenant verificado, rate limiting em massa, `loading.tsx`/`error.tsx`, tradução es (93% incompleta), documentação real (README é o boilerplate do create-next-app) e o **Academic Health Score não corresponde à especificação** (50/50 em vez de 40/30/20/10).

**A arquitetura atual (Next.js App Router como "monólito modular" com services em `lib/`) é adequada para o MVP e escalável até ~100 escolas sem reescrita.** Não é preciso reescrever nada. É preciso corrigir segurança, consolidar fórmulas e adicionar testes antes de crescer.

**Veredicto final: ⚠️ Não ainda — funcional, mas requer endurecimento crítico.**

---

## 1. Repository Overview

| Aspecto | Realidade verificada |
|---|---|
| Arquitetura | Next.js 16 App Router, monólito modular; lógica de domínio em `src/lib/*`; API em `src/app/api/**` (197 route.ts); clientes pesados em `src/components/ui/*` |
| Frontend | React 19, Tailwind v4, shadcn/ui (Radix), framer-motion, recharts, 80 ficheiros `"use client"` (~27%), i18n pt/en/es/fr (es incompleto) |
| Estado | **Redux instalado mas 0% usado**; estado local + `useDataFetch` com cache em memória |
| Backend | Route handlers + Prisma ORM; Auth.js v5 (NextAuth beta); Zod; WebSocket server próprio (`ws-server.js`); ioredis |
| Database | PostgreSQL (Neon na produção), 40+ modelos, enum-based, sem soft deletes, sem particionamento |
| Autenticação | Credentials + Google OAuth, bcryptjs cost 12, 2FA (speakeasy), tokens de email/reset single-use, `sessionVersion` |
| Infra | Docker Compose (nginx/db/redis/app/ws), Vercel (build+migrate), CI GitHub Actions (1 workflow) |
| Testes | Vitest: 3 ficheiros, 453 linhas (evaluation, middleware, password) |
| Docs | README é boilerplate do create-next-app; sem docs de arquitetura/deploy/API |

---

## 2. Product Alignment

| Capability | Esperado | Atual | Status | Evidência |
|---|---|---|---|---|
| Autenticação | Sim | Sim | 🟢 Boa base | credentials+google, 2FA, reset |
| Multi-tenancy | Sim | Parcial | 🔴 Falhas graves | ver Secção 5 |
| School management | Sim | Sim | 🟢 | admin/schools, school-settings |
| Students | Sim | Sim | 🟢 | CRUD + transfer + dashboard |
| Teachers | Sim | Sim | 🟢 | CRUD + classes + subjects |
| Classes | Sim | Sim | 🟢 | catalog global + school-level |
| Subjects | Sim | Sim | 🟢 | catalog global + school-level |
| Attendance | Sim | Sim | 🟡 | presente/atrasado/falta; falta normalização |
| Evaluations | Sim | Sim | 🟢 Forte | evaluation-engine + grading configs |
| Assignments | Sim | Sim | 🟢 | + submissions |
| Participation | Sim | Proxy apenas | 🟡 | sem modelo real; proxy via submissions |
| Portfolio | Sim | Parcial | 🟡 | route de portfolio existe; sem modelo dedicado |
| Certificates | Sim | Sim | 🟢 | generate + verificar-documento público |
| Communication | Sim | Sim | 🟢 | chat WS, mensagens, anúncios, notificações |
| Analytics | Sim | Sim | 🟢/🟡 | executivo/risco/insights; pesado |
| Academic Health Score | Sim | Divergente | 🟡 | 50/50 vs 40/30/20/10 (Secção 3) |
| Evolutive Profile | Estratégico | Não | 🔴 Ausente | sem modelo |
| Gamification | Futuro | Não | — | modelo `Friend` existe (social parcial) |
| Communities | Futuro | Não | — | — |
| Competitions | Futuro | Não | — | — |
| Career | Futuro | Não | — | — |
| Opportunities | Futuro | Não | — | — |
| Marketplace | Futuro | Não | — | — |

**Conclusão**: a arquitetura atual **torna as features futuras fáceis de adicionar** (basta seguir o padrão modelo+lib+route), exceto a Evolutive Profile, que exigirá um redesenho do modelo `User`/`Student` (o estudante hoje é escravo de `schoolId` único; `schema.prisma:191-218`).

---

## 3. Architecture Assessment

**Arquitetura atual**: App Router + route handlers como camada fina; regras de negócio em `lib/` (evaluation-engine, academic-health, predictors, year-transition, class-health, student-risk); acesso a dados direto via Prisma dentro das libs. Monólito modular de facto — bom.

**Pontos fortes**:
- Motor de avaliação centralizado e testado (`lib/evaluation-engine.ts`, cascade `school→global→default`).
- `computeAcademicHealth` é a única fonte da verdade a nível de escola.
- Transições críticas em `$transaction` (year-transition, set-current).
- Scoping `getSchoolId(session)` consistente em analytics.
- Serviços separados por domínio em `lib/`.

**Fraquezas**:
- **Três fórmulas de "saúde" divergentes** (escola 50/50; turma 40/40/20; risco 40/30/30) com **definições de presença diferentes** (`presente+atrasado` vs `presente`) — o mesmo aluno mostra scores diferentes em dashboards diferentes (`academic-health.ts:103` vs `class-health.ts:110` vs `student-risk.ts:99`).
- **Academic Health Score ≠ spec**: spec 40/30/20/10; código 50/50; participação + "outros" são calculados mas **descartados do score** (vão para um `operationalScore` que nenhum endpoint combina) (`academic-health.ts:136-145`).
- Business logic em components (dashboards 1.400-980 LOC), N+1 em analytics, sem cache, muito `any`.
- Sem background jobs além do snapshot-queue (in-memory, perde em serverless).
- Snapshot cron: quebrado E desprotegido (Secção 4).

**Risco arquitetural**: crescimento para 100+ escolas esbarra em (a) analytics sem paginação/cache e (b) isolamento por tenant inconsistente. Para 1.000+ será preciso agregação pré-computada e filas.

**Target**: manter o monólito modular; extrair um `analytics-service` com agregação pré-computada; centralizar o score; tornar `requirePermission` a única porta de autorização.

---

## 4. Security Audit

| Severidade | Problema | Localização | Impacto | Recomendação |
|---|---|---|---|---|
| **CRÍTICO** | 2FA verificado **uma única vez por conta**; `twoFactorVerifiedAt` permanente e copiado para cada novo JWT | `auth.ts:206-210`, `2fa/verify-signin/route.ts:74-79` | Após o 1º login, todo login futuro ignora 2FA | Verificação 2FA por sessão (expiração curta por login); nunca sincronizar do DB |
| **CRÍTICO** | Escalação para `school_admin` por qualquer utilizador + estado da escola nunca verificado | `school-registrations/route.ts:9-50`; `api-auth.ts` não checa `school.status` | Conta de aluno vira admin; API administrativa aberta | Bloquear role != student; CSRF/rate limit/zod; forçar `status === "ativa"` em `requireRole` |
| **CRÍTICO** | WS broadcast sem role check | `notifications/broadcast/route.ts:5-35` | Qualquer utilizador injeta eventos WebSocket a qualquer um / a todos | Restringir a `service`/`super_admin`; validar `event` |
| **CRÍTICO** | Cron sem auth: snapshots globais + **delete de retenção de todas as escolas**; quebrado no Vercel (middleware 401 sem cookie) | `cron/snapshot/route.ts:5-33`; `middleware.ts:21` | DoS + destruição cross-tenant; snapshots nunca rodam | `Authorization: Bearer CRON_SECRET`; whitelist no middleware; scope por escola |
| **CRÍTICO** | Password super-admin hardcoded `cur10usx` em ficheiro tracked + secrets reais não rotacionados + sem `.dockerignore` | `migrate-to-multitenant.ts:62`; `.env`; `containers/app/Dockerfile:10` | Backdoor conhecida; segredos nas layers Docker | Remover/ler de env; `.dockerignore`; rotacionar tudo |
| **ALTO** | IDOR `results/averages`: aluno/pai lê médias de qualquer aluno | `results/averages/route.ts:8` | Leitura de dados académicos alheios | Replicar scoping de `results/route.ts:57-90` |
| **ALTO** | Enumeração global de utilizadores + emails | `user/search/route.ts`; `user/route.ts` | Correlação cross-tenant de contas | Filtrar por `schoolId` |
| **ALTO** | `parents` GET/[id]: qualquer aluno lê todos os pais; `history` e `certificates` sem `schoolId` | `parents/route.ts`, `students/[id]/history/route.ts`, `students/[id]/certificates/route.ts` | PII de pais; fuga cross-tenant | Scoping por role + `schoolId` |
| **ALTO** | Deleção GDPR não revoga sessões (conta apagada mantém API 24h) | `auth.ts:181-211` (bloco null) | Conta apagada continua operacional | Invalidar token se `dbUser === null`; incrementar `sessionVersion` antes de apagar |
| **ALTO** | CSRF só em 9 handlers; ~140 mutações desprotegidas (incl. gdpr DELETE, verify-signin) | `csrf.ts:66-88`; grep `withCsrf` = 9 | CSRF/CSWSH | `withCsrf` universal (ou SameSite=Strict + verificação de Origin) |
| **ALTO** | Rate limiting por IP contornável via `X-Forwarded-For` (1º valor) | `auth.ts:11-17`, `rate-limit.ts` | Brute force de login/TOTP/signup | Confiar no IP real do proxy |
| MÉDIO | Middleware decodifica JWT **sem verificar assinatura** para o gate 2FA | `middleware.ts:34-44,121-136` | Cookie forjado contorna o gate | Verificar com `jose` ou mover gate para route handlers |
| MÉDIO | Enumeração: signup 409, forgot-password com timing distinguível | `signup/route.ts:63-67`, `forgot-password/route.ts:48-63` | Enumeração de contas | Respostas uniformes + dummy hash |
| MÉDIO | Self-registration permite role `teacher` | `signup/route.ts:52` | Qualquer pessoa vira teacher ativo | Restringir `teacher` a convite/aprovação |
| MÉDIO | 2FA disable sem re-autenticação; setup sobrescreve secret ativo; sem backup codes | `2fa/disable/route.ts`, `2fa/setup/route.ts` | Sequestro remove 2FA silenciosamente | Pedir password/TOTP para disable |
| MÉDIO | Teacher não vinculado a aluno/turma em `certificates/generate`, `convocation`, `evaluation/class`, reports | vários | Teacher acede a qualquer aluno da escola | Vincular via `teacherClasses`/`teacherSubjects` |
| MÉDIO | Inject referências cross-tenant (classIds/subjectIds não validados) | `teachers/[id]/classes`, `teachers/[id]/subjects`, `courses/[id]/subjects` | Associar entidades de outra escola | Validar que cada id pertence ao `schoolId` |
| BAIXO | `import/execute` guarda passwords temporárias em texto plano no JSON `report` (descarregável) | `import/execute/route.ts` | Exposição de credenciais | Não persistir passwords |
| BAIXO | `profile/photo` valida só MIME do cliente | `profile/photo/route.ts` | Upload arbitrário | Content sniffing + allowlist |
| BAIXO | Comparação HMAC não-constante em verify-ws | `verify-ws/route.ts:21` | Timing attack teórico | `crypto.timingSafeEqual` |
| INFO | Cookie sem prefixo `__Secure-`; CSP/Referrer/Permissions-Policy ausentes | `auth.config.ts:30-39`, nginx `default.conf` | Hardening | Adicionar headers + prefixo |

---

## 5. Multi-Tenancy Audit

**Como funciona hoje**: cada `School` tem `id`; `User.schoolId`, `Student.schoolId`, `Teacher.schoolId` etc. carregam o tenant. O contexto vem do JWT (`session.user.schoolId`) e `getSchoolId(session)` alimenta `where: { schoolId }` em quase todas as rotas de dashboard. Padrão "coluna tenant" — correto para o MVP.

**Vetores de escape/traversal**:

| Vetor | Como | Evidência |
|---|---|---|
| 🔴 IDOR de médias | aluno/pai passa `studentId` de outro aluno da MESMA escola | `results/averages/route.ts:8` |
| 🔴 History sem tenant | `academicHistory.findMany({ where: { studentId } })` sem `schoolId` | `students/[id]/history/route.ts` |
| 🔴 Certificates sem tenant | `cycleCertificate.findMany({ where: { studentId } })` sem `schoolId` | `students/[id]/certificates/route.ts` |
| 🔴 Enumeração global | `user/search` procura em **todos** os users | `user/search/route.ts` |
| 🟠 Inject cross-tenant | `teacherClass.create` com `classId` de outra escola | `teachers/[id]/classes/route.ts` |
| 🟠 Cron global | delete de snapshots de todas as escolas por qualquer sessão | `cron/snapshot/route.ts:22` |
| 🟠 WS global | `broadcastToAll` por qualquer utilizador | `notifications/broadcast/route.ts:21-34` |
| 🟠 Pais | qualquer membro da escola lê todos os pais | `parents/route.ts` |
| 🟡 Caching | cache em memória não é tenant-aware | `useDataFetch` (cliente) |
| 🟡 WebSocket | canais não são tenant-scoped | `ws-server.js:133-140` |
| 🟡 Import | reutiliza users "órfãos" de outra escola | `import/execute/route.ts` |

**Observações críticas**:
- `User.email` é **global único** — duas escolas não podem ter um aluno com o mesmo email; um utilizador não pode pertencer a duas escolas. Isto impede o futuro "Evolutive Profile" cross-school e cria conflitos (`students/route.ts:90`).
- **Não há teste de isolamento entre tenants** (Secção 10).
- `requirePermission` deixa passar `teacher`/`student`/`parent` por simples presença de role — qualquer rota que os inclua sem scoping extra é "qualquer membro da escola vê tudo".

---

## 6. Database Audit

**Forças**: modelos ricos e bem relacionados; enums adequados; `@@unique` sensatos (Subject `[name,schoolId]`, Result `[student,subject,trimester,year]`, Attendance `[student,date,class,lesson]`, Conversation participantes); cascatas corretas para `School`/`Student`/`Teacher`.

**Problemas**:

| Área | Problema | Evidência |
|---|---|---|
| **Índices** | Result/Attendance/AssignmentSubmission só com unique, sem `@@index([schoolId, academicYearId, date])` — agregações varrem por escola+ano | `schema.prisma:410,430,754` |
| **N+1** | `computeClassHealth` 4 queries por turma em loop sequencial (~200 queries numa escola de 50 turmas) | `class-health.ts:51-89` |
| **Unbounded** | `computeStudentRisk` carrega todos os alunos com todos results/attendance/submissions | `student-risk.ts:49-68` |
| **Duplicação** | `academicYear` (String) E `academicYearId` (FK) co-existem em `Result` | `schema.prisma:395-396` |
| **Migration landmine** | `CREATE UNIQUE INDEX Result_..._key` sem dedupe prévio → bloqueia deploy se existirem duplicados | `migrations/20260515130000.../migration.sql:51-52` |
| **Sem soft deletes** | `DELETE` físico em students/teachers/results | `students/[id]/route.ts:100` |
| **User global** | `email @unique` global impede multi-tenancy real de pessoas | `schema.prisma:110` |
| **JSON desestruturado** | `features`, `certificateData`, `report`, `trimesterWeights` como `Json` — sem validação/consulta | vários |
| **Chat sem tenant** | `Conversation`/`ChatMessage` não têm `schoolId` — escola A conversa com escola B | `schema.prisma:448-476` |
| **Portfolio** | sem modelo `Portfolio`/`Achievement`/`Skill` — base da Evolutive Profile ausente | — |
| **Nomes PT** | enums PT/EN misturados (`PENDING`/`REALIZADA`), `aulasPrevistas` | inconsistência |

**Recomendações**: índices compostos `(schoolId, academicYearId, date)`; canonicar `Result.academicYearId`; dedupe antes do unique index; soft-delete com `deletedAt`; `schoolId` em `Conversation`.

---

## 7. API Audit

Inventário: **197 ficheiros route.ts**. 188 autenticam; **9 não autenticados** (applications/status, cron snapshot, health, schools/public, school-courses, platform config/status, verify-ws, applications POST).

| Grupo | Estado | Observações |
|---|---|---|
| auth/** | 🟢 melhor do código | CSRF+rate limit+zod na maioria; 2FA com falha crítica |
| admin/** | 🟢 | sempre `requireRole(["super_admin"])` |
| students/teachers | 🟡 | `[id]` exemplar; reports/history/certificates com falhas |
| results/evaluation | 🟡 | POST com validação por teacher; averages com IDOR; finalize não-atómico |
| analytics/** | 🟡 | tenant-scoped mas pesados, sem paginação/cache |
| chat/messages | 🟡 | participant-scoped mas sem tenant; broadcast aberto |
| import/** | 🟡 | admin-only; passwords em texto plano persistidas |
| cron/snapshot | 🔴 | sem auth + destruição cross-tenant + quebrado no Vercel |
| support/gdpr | 🟢 | owner/super_admin; gdpr sem CSRF |

Padrões fortes a preservar: `getSchoolId(session)` + `findFirst({id, schoolId})`, zod em mutations críticas, `logAudit`, `requestSnapshot` debounced. Padrão fraco: `requirePermission` com listas largas de roles.

---

## 8. Code Quality — Os 10 Piores Problemas

| # | Ficheiro | Problema | Porquê importa | Refactor | Prioridade |
|---|---|---|---|---|---|
| 1 | `(minha-area)/minha-area/page.tsx` (1.468 LOC) | God component | Impossível de testar; mistura UI+fetch+estado | Dividir em features + hooks | ALTA |
| 2 | `ui/StudentDashboard.tsx` (979), `ParentDashboard.tsx` (869) | God components | Bundle grande para todos | Lazy-load por role | ALTA |
| 3 | `academic-health.ts` vs `class-health.ts` vs `student-risk.ts` | **Regra de negócio duplicada e divergente** | Scores inconsistentes destroem confiança | `score.ts` central parametrizado | CRÍTICA |
| 4 | 197 handlers | 5 padrões de auth repetidos; erro `"Erro interno"` duplicado | Inconsistência | Helper `ApiError`/`withHandler` | MÉDIA |
| 5 | `useStudentDashboard.ts`, `AcademicHealthHistoryChart`, `ExecutiveDashboard` | Reimplementam fetch com `any` | Fuga de tipos | Consolidar em `useDataFetch` tipado | MÉDIA |
| 6 | `lib/i18n/es.ts` | 4 de 62 secções (~93% vazia) | Utilizadores es veem chaves cruas | Completar ou desativar | MÉDIA |
| 7 | `BigCalendar.tsx` + `react-big-calendar` | Código morto + dependência morta | Bloat | Remover | BAIXA |
| 8 | `provider/theme.tsx` | FOUC claro/escuro | UX fraca | Ler cookie no render inicial | MÉDIA |
| 9 | `middleware.ts` `decodeJwtPayload` | JWT sem verificação de assinatura | Gate 2FA forjável | Usar `jose` | ALTA |
| 10 | `rate-limit.ts` in-memory fallback | Limiter por instância, reseta no cold start | Brute force em serverless | Redis sempre | MÉDIA |
| menção | `routes.ts` (3 linhas) duplica `routes.config.ts`; `jest.config.ts` morto; `Oldpage.tsx` morto | dead code/duplicação | | limpar | BAIXA |

---

## 9. Performance

| # | Problema | Impacto | Evidência |
|---|---|---|---|
| 1 | `/api/analytics/predict` sem paginação, 4 preditores sequenciais × todos os alunos | timeout em escolas grandes | `predict/route.ts:27-39` |
| 2 | `computeClassHealth` N+1 (4 queries/turma em loop) | ~200 queries por dashboard | `class-health.ts:51-89` |
| 3 | `executive-dashboard` recomputa tudo (health ×3, risk ×2, class ×2, history ×2, insights) | 100+ queries por request | `executive-dashboard/route.ts:31-49` |
| 4 | `computeStudentRisk` unbounded (todos os alunos + include) | MBs em memória | `student-risk.ts:49-68` |
| 5 | `limit` não limitado em ~26 rotas (`limit=1000000` aceite; `page=0` → skip negativo) | DoS leve + 500s | `results/route.ts:21` |
| 6 | Sem cache/Redis em analytics | re-agregação a cada visita | — |
| 7 | `moment` (~330KB) no bundle cliente ×2 | peso de página | `StudentCalendarExperience.tsx`, `TeacherCalendarExperience.tsx` |
| 8 | 5 dashboards importadas estaticamente no hub | bundle de todos para cada role | `dashboard/[id]/page.tsx` |
| 9 | Duplicação WS (3× SessionGuard) + polling 30s duplicado | rede/CPU | layouts |
| 10 | WebSocket: 100KB maxPayload, 20 conn/IP, heartbeat ok | — | `ws-server.js` (bom) |

**Bottlenecks reais para escala**: agregações de saúde académica (pré-computar snapshots e servir do snapshot), `/predict` (paginá-lo) e a ausência de índices `(schoolId, academicYearId, date)`.

---

## 10. Testing

**O que existe** (453 linhas, Vitest):
- `evaluation.test.ts` (363) — motor de avaliação, médias, configs. **Bom.**
- `middleware.test.ts` (56) — redirecionamentos.
- `password.test.ts` (34) — hash/verificação.

**O que falta (perigoso)**: zero testes de API/integração, de autenticação, de autorização, **de isolamento por tenant**, de CSRF/2FA/reset, de health score, de chat/WS, de snapshots/cron. A `computeAcademicHealth` — a métrica principal do produto — **não tem nenhum teste**.

**Estratégia realista**:
1. Testes de tenant isolation (crítico, agora): aluno/teacher de escola A recebe 404/403 para escola B.
2. Testes de autorização por role nas rotas críticas.
3. Testes do Academic Health Score (fórmula + consistência class/risk).
4. Testes de auth (signup, login, reset, 2FA, CSRF).
5. Opcional: 1-2 E2E (Playwright). Priorize 1-3; não persiga cobertura de UI.

---

## 11. DevOps

**Produção segura? Não.**

| Área | Estado |
|---|---|
| Segredos | 🔴 `.env` com secrets reais não rotacionados; **super-admin hardcoded**; sem `.dockerignore`; `secrets/` não gitignored apesar do script afirmar; `.gitignore:55` quebrado |
| Docker | 🔴 ports 5432/6379 no host; Redis sem password; containers root; base images floating (`nginx:alpine`); sem limits/read_only/cap_drop; sem healthchecks app/ws/nginx; imagem prod com devDeps |
| TLS | 🟡 nginx bom (TLS1.2/1.3, HSTS, http2, WS upgrade) mas **self-signed** + `preload` HSTS; sem CSP/Referrer/Permissions-Policy |
| CI | 🟡 lint+tsc+test+build correm; 🔴 job de deploy **quebrado** (`k8s/` inexistente e gitignored); sem secret scan, `npm audit` ou scanner de imagem |
| Migrations | 🟡 `migrate deploy` no start de cada container + no `vercel-build`; migration única com risco de bloquear deploy |
| Backups | 🔴 **nenhum** — o marketing afirma "Automatic Backups" mas não há `pg_dump`/tooling; única mitigação é Neon managed (implícita) |
| Monitoramento | 🔴 nenhum (sem Sentry/logs estruturados/alertas); `/api/health` sem auth expõe nº de utilizadores |
| Cron | 🔴 `/api/cron/snapshot` sem auth e bloqueado pelo middleware no Vercel |
| Reset DB | 🔴 `reset-db.sh` com `prisma migrate reset --force` sem guard de produção |

**Ação imediata**: rotacionar todos os segredos; remover `migrate-to-multitenant.ts` ou ler de env; `.dockerignore`; parar de publicar ports; certbot; corrigir CI deploy; `CRON_SECRET`; plano de backup (pg_dump diário → object storage + restore drill).

---

## 12. Technical Debt Register

| # | Problema | Local | Impacto | Dificuldade | Risco se ignorado | Solução |
|---|---|---|---|---|---|---|
| 1 | 2FA permanente | auth | Alto | Baixa | Comprometimento total de contas com 2FA | Verificação por sessão |
| 2 | Escalação school_admin + status não verificado | school-registrations/api-auth | Alto | Baixa | Qualquer conta vira admin | Gates de role/status |
| 3 | Cron aberto + quebrado | cron/snapshot | Alto | Baixa | Destruição cross-tenant; snapshots obsoletos | CRON_SECRET + fix middleware |
| 4 | Secrets não rotacionados + hardcoded | .env, migrate script | Alto | Média | Comprometimento total | Rotação + remoção + dockerignore |
| 5 | Sem backups | infra | Alto | Média | Perda total de dados | pg_dump diário |
| 6 | IDOR averages + history/certificates sem schoolId | results, students | Alto | Baixa | Fuga de dados académicos | Scoping por role |
| 7 | Fórmulas de saúde divergentes | lib | Médio | Média | Métrica incorreta | Centralizar |
| 8 | CSRF parcial | api | Médio | Média | CSRF/CSWSH | withCsrf universal |
| 9 | Rate limit spoofável | lib | Médio | Baixa | Brute force | Proxy de confiança |
| 10 | N+1/unbounded analytics | lib | Médio | Média | Timeouts em escala | Agregação + índices |
| 11 | Migration bloqueia deploy | migrations | Médio | Baixa | Deploy travado | Dedupe prévio |
| 12 | es incompleta | i18n | Baixo | Média | UX ES quebrada | Completar/desativar |
| 13 | deploy CI quebrado | workflow | Médio | Média | Sem deploy automatizado | Corrigir path |

---

## 🚨 Fix Immediately

1. **CRÍTICO — 2FA por sessão.** `src/lib/auth.ts:206-210`, `src/app/api/auth/2fa/verify-signin/route.ts:74-79`. Hoje o desafio TOTP só corre uma vez na vida da conta. Fix: token 2FA curto por login (ou limpar `twoFactorVerifiedAt` a cada login); nunca sincronizar do DB para o JWT.
2. **CRÍTICO — Privilege escalation e estado da escola.** `src/app/api/school-registrations/route.ts:9-50` (aceitar apenas `student`, CSRF, rate limit, zod) e `src/lib/api-auth.ts:10-41` (rejeitar `school.status !== "ativa"` e `pendente`).
3. **CRÍTICO — Cron.** `src/app/api/cron/snapshot/route.ts` → exigir `Authorization: Bearer CRON_SECRET`; adicionar `/api/cron/snapshot` à whitelist do middleware (`src/middleware.ts:21`) para o Vercel funcionar.
4. **CRÍTICO — Secrets.** Rotacionar todos os valores de `.env` (DB, AUTH_SECRET, Google, Resend, Blob, super-admin); remover `prisma/migrate-to-multitenant.ts:62`; adicionar `.dockerignore`; corrigir `.gitignore:55`.
5. **ALTO — IDOR averages.** `src/app/api/results/averages/route.ts:8` — replicar o scoping por role de `results/route.ts:57-90`.
6. **ALTO — WS broadcast.** `src/app/api/notifications/broadcast/route.ts:5-35` — restringir a `service`/`super_admin`.
7. **ALTO — PII parents.** `src/app/api/parents/route.ts` e `[id]/route.ts` — limitar a `school_admin`/`teacher` (com vínculo).
8. **ALTO — history/certificates sem schoolId.** `students/[id]/history/route.ts`, `students/[id]/certificates/route.ts` — filtrar por `schoolId`.
9. **ALTO — Enumeração global.** `user/search/route.ts` — filtrar por `schoolId`.
10. **ALTO — Deleção GDPR mantém sessão.** `src/lib/auth.ts:181-211` — invalidar JWT quando `dbUser === null`.
11. **ALTO — Backups + reset-db guard.** pg_dump diário e guard de produção em `scripts/reset-db.sh`.
12. **MÉDIO — CSRF universal** e rate limit com IP confiável do proxy.

---

## Prioritized Roadmap

### Phase 0 — Emergency Fixes (1-2 semanas, bloqueante)
Security + data integrity: os 12 itens do 🚨 acima. Nada de features novas antes disto.

### Phase 1 — Foundation (2-4 semanas)
- Centralizar autorização: `requirePermission` como única porta; `school.status` e scoping por role por defeito; remover a semântica "role na lista = acesso total".
- `score.ts` único (Academic Health Score parametrizado) alinhado à spec 40/30/20/10; normalização de presença única; testes.
- `withCsrf` para todas as mutações; `getIp` confiável.
- Dedupe pré-migration do unique index do Result; índices compostos novos.
- Backups + restore drill.

### Phase 2 — Quality (4-8 semanas)
- Testes: tenant isolation, autorização por role, health score, auth/2FA/CSRF.
- Split dos god components; es.ts completo ou desativado; remover Redux/moment/BigCalendar mortos.
- Error boundaries (`error.tsx`, `not-found.tsx`, `global-error.tsx`), lazy-load dashboards, WS único.
- Docs: README real, arquitetura, deploy, API; hardening Docker.

### Phase 3 — Performance
- Analytics: servir do snapshot pré-computado; `/predict` paginado e com `Promise.all`; índices; cap de `limit`; cache Redis opcional.
- Cron funcional com retenção por escola.

### Phase 4 — Product Evolution
- Modelo de identidade cross-school para Evolutive Profile (desacoplar `User` de `schoolId` único; `StudentProfile` portátil; conquistas/skills/portfolio).
- Gamificação/communities/competições: seguir padrão modelo+lib+route; social parcial (`Friend`) já existe.
- Marketplace/career: sem impedimento arquitetural.

---

## Target Architecture

- **Frontend**: RSC para leitura, componentes clientes finos; fetch de servidor por página; Redux **removido**; i18n server-side.
- **Backend**: monólito modular — route handlers finos → services (`lib/domains/*`) → Prisma; audit/notify/events transversais.
- **Authorization**: central em `requirePermission` com políticas por domínio (não por role), incluindo tenant e status da escola.
- **Multi-tenancy**: coluna `schoolId` + RLS como alvo futuro a 1.000+ escolas; hoje reforçar verificação manual + testes.
- **Database**: índices analíticos, soft-deletes, `Result.academicYearId` canónico, `Conversation.schoolId`.
- **Caching**: Redis (ratelimit, sessões WS, cache analytics curta TTL); snapshots como fonte de analytics.
- **WebSockets**: token WS por sessão (incl. 2FA), canais tenant-scoped, broadcast só por `service`.
- **Background jobs**: Redis queue (BullMQ ou equivalente) para snapshots/imports/emails.
- **Storage**: Vercel Blob + content-sniffing; PDFs gerados no servidor.
- **Observability**: Sentry + logs estruturados + healthcheck sem info sensível.
- **CI/CD**: lint+tsc+test+build+secretscan+audit+trivy; deploy docker-compose SSH (ou k8s commitado); migração como passo gated com lock.
- **Infra**: nginx com certbot; ports internos; containers non-root com limits.

---

## Is Cur10usX ready for real schools?

### ⚠️ **Not yet — funcional, mas requer endurecimento crítico.**

**Porquê**: o produto é funcional e a arquitetura é adequada, mas há falhas de segurança que uma escola real (com dados de menores — crianças angolanas) não pode aceitar: 2FA efetivamente inoperante após o primeiro login, escalação para `school_admin`, IDORs e fugas cross-tenant de PII, cron destrutivo desprotegido, secrets não rotacionados e zero testes de isolamento. Além disso, o Academic Health Score — a métrica central do produto — não corresponde à especificação.

**O que é preciso antes de um piloto real**: resolver os 12 itens do Fix Immediately, adicionar os testes de tenant isolation e rotacionar segredos. Depois disso, um piloto controlado com 1-3 escolas é razoável. Não antes.

---

### "What should Alberto and the team do NEXT?"

**Top 10 (por prioridade):**

1. **Sessão técnica de segurança (1 dia)** — corrigir 2FA por sessão, escalação school_admin, cron, IDOR averages e broadcast WS (fixes de < 50 linhas).
2. **Rotacionar todos os segredos do `.env`** e remover o password hardcoded; adicionar `.dockerignore` e corrigir `.gitignore`.
3. **Bloquear tenant**: history/certificates com `schoolId`, `parents` restrito, `user/search` por escola, deleção GDPR revoga sessão.
4. **Fazer o cron funcionar e protegê-lo** (`CRON_SECRET` + whitelist no middleware) para os snapshots diários existirem em produção.
5. **Alinhar o Academic Health Score à spec 40/30/20/10** e centralizar num `score.ts` único com testes.
6. **Escrever testes de isolamento por tenant** (prioridade máxima de teste) antes de qualquer refactor.
7. **Aplicar `withCsrf` a todas as mutações** e corrigir o IP de rate limit.
8. **Corrigir o deploy CI** (docker-compose SSH ou commit k8s) e adicionar backup diário com restore drill.
9. **Paginagem/caps e índices** nas rotas de analytics (evitar timeouts em escala).
10. **Dívida de qualidade** (só depois): split de god components, es.ts, remover Redux/moment mortos, error boundaries, README real.

---

*A auditoria termina aqui. Nenhum ficheiro foi modificado; tudo acima é evidência verificada do repositório atual.*
