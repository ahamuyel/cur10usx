# Auditoria de Alinhamento — Cur10usX: Código vs. Visão

**Data:** 2026-08-19
**Auditor:** Auditor de Alinhamento Produto-Engenharia
**Escopo:** Codebase completo do Cur10usX (539 ficheiros TypeScript, 55 modelos Prisma, 167 rotas API, 83 páginas)

---

## SECÇÃO 1 — Inventário por Área Funcional

### A. Infraestrutura de Plataforma
- Multi-tenant SaaS (`schoolId` em todas as tabelas, `tenant-guard.ts`, isolamento por escola)
- Auth completa (NextAuth v5, 2FA TOTP, email verification, OAuth Google, CSRF, rate limiting)
- RBAC 5 roles (`super_admin`, `school_admin`, `teacher`, `student`, `parent`) com 14 permissões granulares por admin
- Feature flags (20 definições — nem todas usadas)
- i18n (4 idiomas: PT, EN, ES, FR — duas camadas de tradução)
- WebSocket server standalone com Redis pub/sub
- Docker Compose (5 serviços: nginx, app, db, redis, ws-server)
- CI/CD GitHub Actions
- Vercel deploy com cron jobs

### B. Gestão Escolar (CRUD completo)
- Entidades: School, User, Student, Teacher, Parent, Employee, Admin
- Estrutura académica: AcademicYear, Class, Course, Subject (global + local), EducationCycle
- Matrículas: Enrollment, Application, SchoolRegistration
- Grading: Exam, Assignment, AssignmentSubmission, Result, GradingConfig, GlobalGradingConfig
- Presença: Attendance, TeacherAttendance, StaffAttendance, Lesson, LessonRecord, Justification
- Avaliação final: Evaluation Engine (finalize, preview class/student), CycleCertificate
- Documentos: DocumentVerification (6 tipos de certificados/declarações), geração PDF
- Importação: ImportJob com validação, template, execução, limpeza, exportação
- Relatórios: 6 tipos de PDF (grades, class, student, teacher, attendance, institutional)

### C. Comunicação
- Messages (user-to-user, broadcast)
- Chat (conversation + messages)
- Announcements (targeted por class/course/user)
- Notifications (push + email)
- Support Tickets (com threading)
- Friends system

### D. Analytics & Inteligência (12 endpoints API, 12 componentes UI)
- Academic Health Score (escola — 0-100)
- Class Health (por turma)
- Student Risk Scoring (por aluno — classificado como Baixo/Moderado/Alto/Crítico)
- Preditores: abandono, absentismo, queda de desempenho, reprovação
- Auto-generated insights textuais
- Action recommendations for admins
- Executive dashboard + Executive briefing
- Historical health snapshots (cron job diário às 6h)
- Academic trends analysis

### E. Dashboard Estudante (6 tabs, 18+ sub-componentes)
- Hero com média, ranking, frase motivacional
- Daily Focus (prioridades do dia)
- Performance breakdown por disciplina (tendências trimestre-a-trimestre)
- Academic Journey (gráfico trimestral + análise de tendência improving/stable/dropping)
- Insights (distribuição de notas, histórico de faltas)
- Calendar com aula atual/próxima em tempo real
- Goals (meta numérica vs. atual)
- Academic History (histórico multi-anual, drill-down por disciplina/trimestre)
- Subjects, Attendance, Evaluations tabs

### F. Dashboard Professor (5 tabs, 12+ sub-componentes)
- Attention Center (alunos em risco)
- Class Performance, Assessment Center
- Upcoming Lessons, Student Insights (evolução %)
- Calendar, Announcements
- Página dedicada: `/dashboard/teacher/at-risk-students`

### G. Dashboard Admin Escola (5 tabs)
- School Health Overview, Attention Area
- Pedagogical Watch (com workflow de convocatória para pais)
- Academic Health History Chart
- Lesson Validation Queue, Event Calendar

### H. Super Admin (5 tabs)
- Plataforma-wide stats, growth charts
- Schools/Users management
- Analytics, Security

### I. Landing Page (10 seções)
- Hero, Problem, Transformation, Ecosystem, Benefits, Features, Vision, Trust, CTA, Footer

---

## SECÇÃO 2 — Classificação

| Área | Categoria | Porquê |
|------|-----------|--------|
| **Multi-tenancy** | ✅ Alinhado | Fundação obrigatória para SaaS escolar. Implementação minimal (84 linhas no tenant-guard), proporcional. |
| **Auth + RBAC** | ✅ Alinhado | Necessário para multi-role. 2FA é upfront mas justificável para institutions. |
| **CRUD Gestão Escolar** (students, teachers, classes, subjects, enrollments) | ✅ Alinhado | A "porta de entrada" — qualquer escola precisa disto. |
| **Presença + Justificações** | ✅ Alinhado | Dados que alimentam o futuro perfil evolutivo. Essencial para a porta de entrada. |
| **Avaliação + Resultados (0-20)** | ✅ Alinhado | Motor de avaliação é a fundação. Os dados gerados (Result, GradingConfig) são a matéria-prima do coração. |
| **Year Transition + Evaluation Engine** | ✅ Alinhado | Funcionalidade core para fecho de ano letivo. Sem ela, a gestão escolar não funciona. |
| **Comunicação** (Messages, Chat, Announcements, Notifications) | ✅ Alinhado | Fundação necessária. Chat e messaging são pré-requisitos para o futuro Tutor AI. |
| **Certificados + Document Verification** | ✅ Alinhado | Parte do portfólio futuro do estudante. CycleCertificate e DocumentVerification são andaimes legítimos para o portfolio. |
| **Dashboard Estudante** | ⚠️ Fundação desproporcional | É sofisticado (18 componentes, análise de tendências) mas serve essencialmente como **painel de consulta de notas**. A "evolução" mostrada é comparativo quantitativo trimestre-a-trimestre — não há conceito de desenvolvimento holístico. Consumiu tempo de UX/UI que poderia ir para o coração. |
| **Dashboard Professor** | ⚠️ Fundação desproporcional | Inclui tracking de alunos em risco e insights de evolução, mas tudo isto é visão administrativa para o professor gerir a sua turma, não para capacitar o estudante. |
| **Analytics & Inteligência** (12 endpoints, 12 componentes, 4 preditores) | ⚠️ Fundação desproporcional | **Sistema robusto de analytics — 100% dedicado ao admin da escola.** O estudante nunca vê o seu próprio risk score, probability of failure, ou qualquer insight. O sistema gera "academic health" e "recommendations" que só o admin vê. O student-risk scoring classifica alunos como "Crítico" sem que o aluno saiba. Isto é gestionário puro — o tipo de coisa que um ERP escolar faz. |
| **Relatórios PDF** (6 tipos) | ⚠️ Fundação desproporcional | Gerar 6 tipos de relatório PDF (grades, class, student, teacher, attendance, institutional) para um produto que ainda não tem o "coração" é investir na camada de output administrativo antes da camada de valor estudantil. |
| **Support Tickets** | ⚠️ Fundação desproporcional | Helpdesk completo (tickets, messages, prioritization) para uma fase em que o produto ainda não tem users reais. |
| **Landing Page** | ❌ Desalinhado | Posiciona-se como "The Operating System for Modern Schools" — linguagem 100% de gestão escolar. Zero menção a "desenvolvimento do estudante", "evolução académica", "aprendizagem contínua". A secção Vision existe mas é aspiracional, não product-defining. |
| **Feature Flags ghost** (finances, inventory, globalCatalog, internalMessages) | ❌ Desalinhado | 4 flags com zero implementação. Code smell de scope creep. |
| **i18n (4 idiomas)** | ❌ Desalinhado | Duas camadas de tradução, ~1000 linhas de uiTranslations inline. Para um produto Angola/Moçambique, PT-first com EN opcional seria suficiente. 4 idiomas é maintenance burden sem user demand. |
| **Friends System** | ❌ Desalinhado | Modelo Friend + rotas API + UI de amigos — feature social genérica de SaaS que não serve nem a visão do estudante nem a gestão escolar. |

---

## SECÇÃO 3 — Sinais de Desvio Encontrados

### 1. O schema Prisma não modela o "coração" do estudante

**Evidência:** `prisma/schema.prisma` — 55 modelos, nenhum dedicado a "perfil evolutivo", "competência", "habilidade", "projeto", "participação", ou "desenvolvimento pessoal".

O model `Student` (linhas 191-219) é: name, email, phone, address, foto, gender, dateOfBirth, documentType, documentNumber, classId, userId, schoolId, **targetAverage**. O único campo que aponta para desenvolvimento é `targetAverage` — e é um número.

O mais próximo de "história contínua" é `AcademicHistory` — mas é um snapshot administrativo por ano letivo (finalAverage, status, failedSubjects) com um blob JSON `subjectResults`. Não é um timeline, não é um perfil, não é uma narrativa.

**Não existe:** StudentProfile, StudentCompetency, StudentSkill, StudentProject, StudentGoal, StudentReflection, StudentMilestone, ou qualquer modelo que capture o desenvolvimento do estudante para além de notas numéricas.

### 2. O dashboard do estudante é um painel de consulta, não uma ferramenta de desenvolvimento

**Evidência:** `src/components/ui/StudentDashboard.tsx` — 18 sub-componentes, nenhum com conceito de "onde estou a caminhar" ou "o que isto significa para o meu futuro".

- `StudentAcademicJourney` mostra gráfico de barras trimestral + frase "Estás a progredir". Isto é comparativo quantitativo, não narrativa de desenvolvimento.
- `StudentInsights` mostra distribuição de notas e histórico de faltas — métricas, não insights de crescimento.
- A aba "Goals" permite definir `targetAverage` — um único número. Não há goal-setting interativo, nem milestones, nem self-reflection.
- A aba "History" (`AcademicHistoryTab`) mostra dados multi-anuais mas sem narrativa: "Em 7o ano tinhas 11.2, agora em 9o ano tens 14.8" — o aluno tem de montar a história manualmente.

### 3. O sistema de analytics é inteiramente admin-facing — o estudante é sujeito, não agente

**Evidência:** Todos os 12 endpoints de analytics em `src/app/api/analytics/` requerem `requireRole(["school_admin", "super_admin"])`. Nenhum é acessível ao student.

- `student-risk.ts` classifica cada aluno como "Baixo Risco", "Moderado", "Alto Risco" ou "Crítico". O aluno **nunca vê** esta classificação.
- Os 4 preditores (abandono, absentismo, queda de desempenho, reprovação) geram previsões que só o admin vê.
- O `PedagogicalWatch` component gera workflow de convocatória: admin identifica risco → convoca pais. O aluno recebe a convocatória mas **nunca vê os dados que a despoletaram**.
- O Academic Health Score é **escolar** (0-100), não individual. Não existe "Student Health Score" ou "Student Development Index".

**Isto é a arquitetura de um ERP escolar:** dados são recolhidos, processados, e servem decisões administrativas top-down. O estudante é monitorizado, não capacitado.

### 4. O portfólio é um dump de dados, não um portfólio

**Evidência:** `src/app/api/students/[id]/portfolio/route.ts` retorna: info pessoal + todos os results raw + resumo de attendance (4 números). Sem médias, sem tendências, sem evolução, sem narrativa.

O `CycleCertificate` existe no schema (com `certificateData` JSON) mas não é apresentado no dashboard do estudante. O feature flag `portfolio` existe em `features.ts` mas não está mapeado a nenhum menu no sidebar.

### 5. A landing page revela a identidade real do produto

**Evidência:** `src/components/landing/HeroSection.tsx` — headline: "The Operating System for Modern Schools". Sub-headline: "digital infrastructure that connects every process of your institution".

Zero aparição de: "student development", "evolution", "learning journey", "continuous growth", "portfolio", "career alignment", "empowerment".

A secção Benefits menciona para students: "Visible progress, early intervention, personalized support" — mas estas são descritas como *consequências* de melhor gestão escolar, não como identidade do produto.

**O "Cavalo de Troia" está a funcionar ao contrário:** em vez de entrar como ERP e entregar coração, está a entrar como ERP e **a parecer ERP** — até na linguagem pública.

### 6. Nomenclatura: gestão escolar everywhere, linguagem de evolução nowhere

**Evidência no código:**
- "nota", "turma", "matrícula", "avaliação", "disciplina", "presença" — abundantes em modelos, rotas e UI
- "perfil", "evolução", "jornada", "portfolio", "competência", "habilidade", "crescimento" — zero no schema, zero nos modelos, zero nas rotas

Os únicos sinais de linguagem de visão no código são:
- A feature flag `academicHistory`
- A feature flag `portfolio`
- O componente `StudentAcademicJourney` (mas é um gráfico de barras, não uma jornada)

---

## SECÇÃO 4 — Veredito

### **A começar a desviar-se — com risco claro de se tornar indistinguível de um ERP escolar.**

O Cur10usX hoje é uma **plataforma de gestão escolar bem construída** com:
- 55 modelos de dados (todos administrativos)
- 167 rotas de API (a esmagadora maioria CRUD de gestão)
- 83 páginas (a maioria listas/formulários de administração)
- 4 dashboards por role (todos orientados a gestão)
- Sistema de analytics robusto (100% admin-facing)
- 0 (zero) funcionalidades do "coração" do estudante

**O que está construído:** uma porta de entrada proporcional e funcional — auth, multi-tenancy, CRUD completo, grading engine, attendance, year transition, analytics escolar. Isto é legítimo como fundação.

**O problema:** a fundação já está **acima** do que a porta de entrada precisa:
- 12 endpoints de analytics com 4 preditores preditivos — é sophistication de produto maduro, não de MVP
- 6 tipos de relatório PDF — output administrativo avançado
- 18 componentes no dashboard do estudante que mostram dados, não desenvolvimento
- 4 idiomas com sistema i18n dual-layer
- Friends system, Support tickets, Chat completo
- Feature flags para financas e inventário que não existem

**O risco concreto:** quando a equipa chegar ao ponto de avançar para o "coração", vai encontrar uma codebase com uma identidade entranhada de ERP escolar — nomes, estruturas, expectativas de UI, padrões de dados — que tornará o pivô para "plataforma de desenvolvimento do estudante" significativamente mais difícil do que se tivesse começado greenfield.

**O "coração" não está atrasado — está ausente.** Não há nenhum andaime no código (schema, rotas, UI) preparado para Perfil Evolutivo, Tutor AI, Portfolio dinâmico, ou Alinhamento de carreira. É greenfield total.

---

## SECÇÃO 5 — 5 Ações Recomendadas (Priorizadas)

### 1. DEFINIR O "STUDENT EVOLUTION PROFILE" NO SCHEMA — AGORA

Criar o primeiro modelo do "coração" no Prisma schema: `StudentProfile` ou `StudentEvolution`.

Campos sugeridos:
- `studentId` (FK → Student)
- `academicYearId` (FK → AcademicYear)
- `competencies` (JSON — framework de competências por disciplina)
- `goals` (JSON — objetivos pessoais do estudante)
- `narrative` (text — resumo narrativo do percurso)
- `milestones` (JSON — marcos alcançados)
- `teacherNotes` (aggregated — notas qualitativas dos professores)
- `participationScore` (number — participação/engajamento)
- `selfReflection` (text — reflexão do próprio estudante)
- `updatedAt`

Mesmo que vazio, o schema cria a âncora conceptual — força o código a pensar no estudante como sujeito de desenvolvimento, não objeto de gestão.

**Porquê primeiro:** schema define identidade. Sem isto, todas as decisões seguintes continuam a reforçar a identidade de ERP.

### 2. REDIRECIONAR O PORTFOLIO PARA ALÉM DE NOTAS

Reescrever `GET /api/students/[id]/portfolio` para ser um endpoint rico:
- Academic history narrative (não apenas finalAverage, mas "progressão de 11.2 para 14.8 em 2 anos")
- Teacher observations aggregated e surfadas
- Cycle certificates apresentados
- Goal progression ao longo do tempo
- Milestones achieved

Criar uma UI de portfolio dedicada no sidebar do estudante (feature flag `portfolio` já existe — mapeá-la ao menu).

**Porquê:** o portfolio é a ponte natural entre gestão escolar (dados que já existem) e coração (narrativa de desenvolvimento). É a feature mais barata de construir porque os dados já estão na base.

### 3. FEEDBACK LOOP: STUDENT VERSUS OS SEUS PRÓPRIOS DADOS DE RISCO

Expor ao estudante, de forma construtiva e motivacional, os dados que o analytics já calcula:

- "Estás com tendência de queda em Matemática — sugestão: dedica mais 30min/semana"
- "A tua assiduidade melhorou 15% este trimestre — continua assim!"
- "Estás a atingir 80% da tua meta — falta 1.2 pontos na média geral"

Não expor o risk score literal ("Alto Risco"), mas traduzir os preditores em ações acionáveis para o estudante.

**Porquê:** o sistema de analytics (4 preditores, insights, recommendations) já existe e é sofisticado. O custo incremental é expor uma fração destes dados ao estudante. Isto transforma analytics de ferramenta admin em ferramenta de empowerment.

### 4. MIGRAR A LANDING PAGE PARA POSICIONAMENTO DE CORAÇÃO

Alterar o Hero de "The Operating System for Modern Schools" para algo que reflicte "A escola gere. Tu evoluis." — a tagline que já existe mas que o landing page nunca usa.

Reescrever a secção Features para incluir:
- Perfil evolutivo do estudante
- Portfolio dinâmico com credenciais reais
- Insights pessoais de desenvolvimento
- Não apenas "gestão de alunos" e "notas e avaliações"

Reescrever a secção Benefits para student como: "O teu percurso, visível. As tuas credenciais, verificáveis. O teu futuro, orientado."

**Porquê:** o posicionamento público define a identidade do produto para a equipa, investidores, e mercado. Enquanto o site disser "school OS", a equipa vai construir school OS.

### 5. MATAR OU SIMPLIFICAR: FEATURES GHOST + i18n

- Remover feature flags `finances`, `inventory`, `globalCatalog` do código (são dead code)
- Simplificar i18n para PT-first + EN opcional (remover FR e ES, colapsar as duas camadas de tradução numa só)
- Usar o tempo ganho para as ações 1-4

**Porquê:** cada feature ghost e cada camada de i18n é manutenção que drena foco do coração. Num produto que ainda não tem o "coração", não faz sentido manter infraestrutura para features que não existem ou idiomas que não há users a usar.

---

## RESUMO EXECUTIVO

O Cur10usX construiu uma fundação sólida e proporcional (auth, multi-tenancy, CRUD, grading), mas começou a investir pesadamente em camadas de sophistication admin (analytics com 4 preditores, 18 componentes no dashboard estudante, 6 relatórios PDF, 4 idiomas, friends system) sem ter construído **nenhuma** feature do "coração" do estudante.

A landing page posiciona-se publicamente como "The Operating System for Modern Schools". O código tem zero modelos, zero rotas, e zero UI dedicados a perfil evolutivo, portfolio dinâmico, tutor AI, ou alinhamento de carreira.

O desalinhamento não é catastrófico — a fundação é legítima — mas a trajectória é de aceleração na direção errada. A action mais urgente é criar o primeiro schema do "coração" (StudentProfile/Evolution) antes de continuar a polir a gestão escolar.

**Classificação final: A começar a desviar-se.**
