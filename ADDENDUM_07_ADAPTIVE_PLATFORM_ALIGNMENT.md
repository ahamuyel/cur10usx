# Addendum 07 — Adaptive Learning Platform Alignment

**Data:** 2026-08-26
**Autor:** Head of Engineering + Product Manager + Technical Project Manager + Solution Architect
**Escopo:** Mudanças arquiteturais, de produto, roadmap e validação introduzidas pela reclassificação como Adaptive Learning Platform + School Operating System
**Referência:** Master Plan Partes 1–5, Addendum de CLI Findings, Addendum 06 (25/ago/2026), Auditoria de Alinhamento (19/ago/2026), Auditoria de Código (26/ago/2026)
**Estado:** PENDENTE DE DECISÃO — 3 pontos marcados `DECISION REQUIRED`

---

## 1. Executive Summary

O Cur10usX reclassificou-se de "School Management SaaS" para **"Adaptive Learning Platform + School Operating System"**. Este addendum determina o que muda no MVP 2.0 depois dessa reclassificação.

**Estado atual do código (26/ago/2026):**

| Métrica | Valor |
|---------|-------|
| Ficheiros TypeScript | 556 |
| Modelos Prisma | 68 |
| Enums Prisma | 24 |
| Rotas API | 214 |
| Páginas/UI | 83 |

O ADDENDUM_06 (25/ago) definiu o蓝图 para o EPIC07 — Learning Engine e propôs 13 novos modelos Prisma. **Esses modelos já foram implementados no schema.** O schema atual contém: `Curriculum`, `CurriculumCourse`, `CurriculumUnit`, `CurriculumTopic`, `Lesson` (conteúdo educativo), `LessonContent`, `Exercise`, `Answer`, `MasteryScore`, `StudentXP`, `XPEvent`, `StudentStreak`, `LearningPath`. Foram adicionadas 9 rotas API under `/api/learning/` e 8 rotas under `/api/curriculum/`.

**Este addendum não repete o ADDENDUM_06.** Completa-o com:

1. Análise atualizada do estado do código vs. plano
2. Três decisões em aberto com framework rigoroso de avaliação
3. Arquitetura do domínio de aprendizagem com separação content/state
4. Impacto real no roadmap e no marco de 09/set/2026
5. Plano de validação com utilizadores reais
6. Critérios go/no-go
7. Matriz de riscos por categoria

**Recomendação executiva de uma página:**

> **O que devemos construir agora:** Consolidar o schema existente, construir o loop mínimo testável (1 disciplina, 5-15 exercícios, 3-5 lições), validar com 1 turma piloto.
>
> **O que devemos adiar:** Gamificação completa (XP/streak), AI tutor, adaptive recommendation engine, marketplace, todos os tipos de exercício exceto multiple_choice/fill_in/true_false.
>
> **O que precisamos decidir antes de começar:** (1) Sequenciamento do Learning Loop no MVP, (2) Quem produz o conteúdo, (3) Escopo do motor de exercícios.

---

## 2. What Changes

### 2.1 Mudanças de Produto

| Área | Antes (School Management SaaS) | Depois (Adaptive Learning Platform + School OS) |
|------|-------------------------------|------------------------------------------------|
| **Identidade** | Ferramenta administrativa para escolas | Plataforma de desenvolvimento contínuo do estudante |
| **Valor principal** | Gestão eficiente (notas, presença, comunicação) | Aprendizagem adaptativa + gestão escolar |
| **Experiência do estudante** | Consulta de notas e calendário | Exercício, feedback imediato, progressão, mastery |
| **Dados gerados** | Notas, presença, beating rates | Mastery scores, learning paths, competency maps |
| **Narrativa de venda** | "Resolva a dor administrativa" (cavalo de troia) | "Desenvolva cada estudante" (líderes da narrativa) |
| **Diferenciação** | SIS com dashboards bonitos | Plataforma que nenhum SIS oferece |

### 2.2 Mudanças de Arquitetura

| Componente | Estado Anterior | Estado Novo |
|------------|----------------|-------------|
| **Schema Prisma** | 55 modelos (admin puro) | 68 modelos (+13 de learning engine) |
| **Domínio curricular** | Subject → Course (genérico) | Curriculum → CurriculumCourse → Unit → Topic → Lesson → Exercise |
| **Estado do estudante** | Result (nota final por disciplina) | Answer + MasteryScore + LearningPath (progressão granular) |
| **Gamificação** | Não existia | StudentXP + XPEvent + StudentStreak (implementados, não integrados em UI) |
| **APIs de aprendizagem** | Não existiam | 17 rotas novas (/api/learning/* + /api/curriculum/*) |
| **Conteúdo educativo** | Não existia | Lesson (conteúdo markdown) + LessonContent (auxiliar) + Exercise (7 tipos definidos) |

### 2.3 Mudanças de Roadmap

| Épico | Estado Anterior | Estado Novo |
|-------|----------------|-------------|
| EPIC01-04 | Fundação admin (em curso) | **Sem alteração** — mantêm-se como estão |
| EPIC05 | Não definido | **Não definido** — permanece vago |
| EPIC06 | "Heart" — StudentProfile, Portfolio, Feedback (backlog) | **Absorvido pelo EPIC07** — não faz sentido como épico separado |
| EPIC07 | Não existia | **Novo:** Learning Engine (24-32 dias estimados) |

---

## 3. What Does Not Change

Os seguintes pontos estão **decididos e fechados**. Não são reabertos, questionados oureattribuídos neste addendum.

### 3.1 Estratégia de Produto

| Decisão | Estado | Fonte |
|---------|--------|-------|
| Nova categoria: "Adaptive Learning Platform + School OS" | **FECHADO** | Decisão de produto |
| Estratégia Go-To-Market: "Cavalo de Troia" | **FECHADO** | Master Plan Parte 2 |
| Comparáveis conceptuais: Duolingo, Century Tech, Byju's + SIS | **FECHADO** | Enquadramento de produto |
| Student Experience mínima é P0 do MVP 2.0 | **FECHADO** | Master Plan Parte 3 |

### 3.2 Fundação Técnica

| Componente | Estado | Não reescrever? |
|------------|--------|-----------------|
| Authentication (NextAuth v5, 2FA TOTP, OAuth) | **Implementado** | Sim |
| Authorization (RBAC 5 roles, 14 permissões) | **Implementado** | Sim |
| Multi-tenancy (schoolId, tenant-guard) | **Implementado** | Sim |
| School management (CRUD completo) | **Implementado** | Sim |
| Student CRUD | **Implementado** | Sim |
| Teacher CRUD | **Implementado** | Sim |
| Classes, Subjects, EducationCycles | **Implementado** | Sim |
| Grading Engine (Exam, Assignment, Result) | **Implementado** | Sim |
| Attendance (student, teacher, staff) | **Implementado** | Sim |
| Communication (Messages, Chat, Announcements) | **Implementado** | Sim |
| Certificates (CycleCertificate, DocumentVerification) | **Implementado** | Sim |
| Analytics (12 endpoints, 4 preditores) | **Implementado** | Sim |

### 3.3 Marco

| Marco | Data | Estado |
|-------|------|--------|
| Fundação (EPIC01-04) | 09/set/2026 | **FIXO** — não assume-se que desliza |

### 3.4 Modelos que NÃO existem (e continuam a não existir)

| Modelo | Estado | Nota |
|--------|--------|------|
| StudentProfile | **Não existe** | Pertence ao domínio EPIC06/07-F |
| Competency | **Não existe** | Depende de dados do learning engine |
| Skill | **Não existe** | Depende de dados do learning engine |
| Project | **Não existe** | Funcionalidade futura |
| Goal | **Não existe** | Funcionalidade futura |
| Reflection | **Não existe** | Funcionalidade futura |
| Milestone | **Não existe** | Funcionalidade futura |

> **Nota:** Estes modelos são o objetivo final do Perfil Evolutivo. Não devem ser construídos antes de existirem dados do learning engine que os alimentem.

---

## 4. DECISION REQUIRED #1 — Sequencing do Learning Loop

> **O Student Learning Loop deve entrar como P0 do MVP 2.0, ficar como P1 pós-fundação, ou ser construído como vertical slice paralelo?**

### Contexto

O ADDENDUM_06 propôs que o schema do learning engine (+13 modelos) fosse adicionado à fundação antes de 09/set (+2 dias). O schema **já foi implementado**. A questão agora é sobre o **restante do learning loop**: API CRUD de conteúdos, student learning flow, UI de exercício, mastery score calculation, e gamificação.

A Student Experience mínima já é P0 do MVP 2.0 (decisão fechada). A questão é: **quanto do Adaptive Learning Loop precisa de existir nessa P0?**

### Opção A — P0 do MVP 2.0

O Learning Loop entra como parte central da Student Experience mínima. Antes de 09/set, o MVP inclui não só a fundação admin como também o loop funcional básico.

| Critério | Avaliação |
|----------|-----------|
| **Valor para estudante** | **Alto.** O estudante não só consulta notas como pratica, recebe feedback, e vê progressão. Diferenciação real vs. SIS. |
| **Risco técnico** | **Médio.** Schema já existe. Falta: API CRUD de conteúdos, student flow, UI. Risco: integrar dois domínios (admin + learning) na mesma sprint pode criar conflitos. |
| **Risco de produto** | **Médio.** Se o loop entra no P0 mas não está validado com utilizadores, pode ser construído errado. Não há evidência de que estudantes querem usar isto. |
| **Impacto no prazo** | **Alto.** Adicionar API + UI + mastery ao P0 antes de 09/set significa +7-10 dias na fundação. Marco desliza para ~19/set. |
| **Capacidade de validação** | **Alta.** Se estiver no P0, é testado imediatamente com o primeiro release. |
| **Diferenciação do Cur10usX** | **Máxima.** Lança como Adaptive Learning desde o dia 1. |

### Opção B — P1 pós-fundação

No MVP 2.0 inicial (09/set), existe apenas Student Dashboard, Student Profile, dados académicos, e Portfolio / Profile Evolutivo mínimo. O Adaptive Learning Engine fica para depois.

| Critério | Avaliação |
|----------|-----------|
| **Valor para estudante** | **Baixo.** O estudante continua a consultar notas. Sem exercício, sem feedback, sem progressão. |
| **Risco técnico** | **Baixo.** Fundação fica 100% como planeada. Sem cross-cutting concerns. |
| **Risco de produto** | **Baixo para o SIS, alto para a identidade.** Lança-se um SIS bonito, não uma Adaptive Learning Platform. A reclassificação fica no papel. |
| **Impacto no prazo** | **Nenhum.** Marco de 09/set mantido. |
| **Capacidade de validação** | **Baixa.** Só valida quando o EPIC07 estiver pronto (finais de setembro). |
| **Diferenciação do Cur10usX** | **Nula.** É mais um SIS no mercado. |

### Opção C — Vertical Slice Paralelo

Construir apenas um Learning Loop mínimo testável **em paralelo** à fundação, sem tentar construir o Learning Engine completo. Schema já existe. Foca-se em: 1 disciplina, 3-5 lições, 5-15 exercícios, 3 tipos de exercício, feedback imediato, progressão básica.

| Critério | Avaliação |
|----------|-----------|
| **Valor para estudante** | **Médio.** Experiência funcional mas limitada a 1 disciplina. |
| **Risco técnico** | **Médio-baixo.** Não interfere com a fundação. Pode ser desenvolvido por dev separado ou em sprint dedicado após 09/set. |
| **Risco de produto** | **Baixo.** Valida a hipótese antes de escalar. Se funcionar, investe-se mais. Se não, perdeu-se pouco. |
| **Impacto no prazo** | **Nulo se paralelo, +5-7 dias se sequencial.** Se dev separado: 0 impacto. Se dev solo: +1 sprint após fundação. |
| **Capacidade de validação** | **Alta.** Vertical slice funcional = dados reais de utilização em 2-3 semanas. |
| **Diferenciação do Cur10usX** | **Moderada.** Mostra a direção sem comprometer a fundação. |

### Tabela Comparativa

| Critério | A (P0 integrado) | B (P1 pós-fundação) | C (Vertical Slice paralelo) |
|----------|:-:|:-:|:-:|
| Valor para estudante | ★★★★★ | ★★ | ★★★ |
| Risco técnico | ★★★ (médio) | ★ (baixo) | ★★ (médio-baixo) |
| Risco de produto | ★★★ (médio) | ★★★★ (alto para identidade) | ★ (baixo) |
| Impacto no prazo | Desliza 10 dias | Nenhum | Nenhum (paralelo) |
| Capacidade de validação | Alta | Baixa | Alta |
| Diferenciação | Máxima | Nula | Moderada |

### Recomendação da Engenharia/Produto

**Recomendação: Opção C — Vertical Slice Paralelo.**

**Justificação:**

1. **O schema já existe.** Não é preciso adicionar modelos — são precisas APIs, UI, e conteúdo.
2. **Validar antes de escalar.** O learning engine não tem validação com utilizadores reais. Construir o P0 completo antes de validar é prematuro.
3. **Não deslizar o marco.** A fundação de 09/set é crítica para demonstrar traction. Adicionar learning engine ao P0 arrisca atrasar tudo.
4. **Vertical slice é suficiente para decisões.** Com 1 disciplina, 5 exercícios, e 15 estudantes, obtêm-se dados suficientes para go/no-go em 3 semanas.
5. **Identidade preservada.** O repositório já contém os modelos e rotas de learning engine — isto comunica claramente a direção do produto sem comprometer a fundação.

**Se a Opção C for escolhida:**

- Schema: **Já feito** (13 modelos, 17 rotas API)
- Próximo passo: UI de exercício + student flow (5-7 dias)
- Conteúdo: 1 professor parceiro cria 5 lições + 10 exercícios (1 semana paralela)
- Validação: 1 turma, 1 semana de uso (semana seguinte)
- Decisão go/no-go: 3 semanas após início

### DECISION REQUIRED

> **Encontram-se as três opções? Qual deve ser a escolha do Founding/Product Team?**
>
> - **A:** Learning Loop é P0 — desliza-se o marco se necessário
> - **B:** Learning Loop é P1 — fundação primeiro, learning depois
> - **C:** Vertical Slice paralelo — fundação sem deslizar, learning em sprint dedicado

---

## 5. DECISION REQUIRED #2 — Content Authorship

> **Quem deverá produzir o conteúdo educativo (lessons e exercícios) alinhados ao currículo?**

### Contexto

O produto depende de lessons e exercícios alinhados ao currículo angolano. Sem conteúdo real, o learning engine é uma casca vazia. O ADDENDUM_06 estimou ~20h de professor parceiro para o piloto. Este addendum avalia quatro modelos de autoria com critérios adicionais.

### Opção A — Equipa interna do Cur10usX

Devs + 1 professor parceiro criam todo o conteúdo para o piloto.

| Critério | Avaliação |
|----------|-----------|
| **Qualidade pedagógica** | Depende da competência do professor parceiro. Se for bom, alta. Se for genérica, média. |
| **Escalabilidade** | Baixa. Cada nova disciplina exige mais horas humanas. Não escala para 12 disciplinas. |
| **Custo** | ~20h professor + 10h dev (ferramentas de suporte). Custo controlado. |
| **Velocidade** | Rápida para o piloto (1 disciplina). Lenta para escala. |
| **Consistência curricular** | Média. Professor pode desviar-se do currículo real se não houver referência formal. |
| **Risco de conteúdo incorreto** | Baixo se professor revisar. Médio se dev criar sem revisão. |
| **Manutenção** | Difícil. Conteúdo hardcoded ou em JSON sem ferramenta de edição. |
| **Responsabilidade editorial** | Clara: professor parceiro é responsável. |
| **Personalização** | Baixa. Conteúdo único, não adaptável por escola. |

### Opção B — Professores parceiros / especialistas pedagógicos

Professores reais de escolas parceiras criam e revisam o conteúdo usando a ferramenta de criação.

| Critério | Avaliação |
|----------|-----------|
| **Qualidade pedagógica** | Alta. Conteúdo vem de quem ensina real. |
| **Escalabilidade** | Média. Depende do número de professores disponíveis. Cada professor cobre 1-2 disciplinas. |
| **Custo** | ~10h professor (após onboarding) + 5h suporte. Possível compensação ou parceria. |
| **Velocidade** | Média. Professor precisa de onboarding na ferramenta. Ritmo variável. |
| **Consistência curricular** | Alta. Professor conhece o currículo que ensina. |
| **Risco de conteúdo incorreto** | Baixo. Professor é expert na matéria. |
| **Manutenção** | Média. Professor pode atualizar o próprio conteúdo. |
| **Responsabilidade editorial** | Clara: professor autor + revisão par. |
| **Personalização** | Alta. Professor pode adaptar conteúdo à realidade da escola. |

### Opção C — Geração assistida por IA + revisão humana

IA gera exercícios e lições a partir do currículo. Humanos revisam antes de publicar.

| Critério | Avaliação |
|----------|-----------|
| **Qualidade pedagógica** | Variável. Depende do prompt e do modelo. Pode ser alta com bom engineering. |
| **Escalabilidade** | **Alta.** Uma tool gera conteúdo para múltiplas disciplinas. |
| **Custo** | ~8h Edgar (prompt engineering + tooling) + 5h professor (revisão). Custo fixo baixo. |
| **Velocidade** | **Muito alta.** Gera 50 exercícios em minutos. |
| **Consistência curricular** | Média-alta se o currículo estiver bem modelado no prompt. Risco: conteúdo genérico. |
| **Risco de conteúdo incorreto** | **Médio-alto.** IA pode gerar exercícios com erros subtileis. Revisão humana obrigatória. |
| **Manutenção** | **Baixa.** Tool pode regenerar conteúdo quando o currículo muda. |
| **Responsabilidade editorial** | Difusa: IA gera, humano revisa. Quem assina? |
| **Personalização** | Média. Tool pode gerar variantes, mas conteúdo é baseado em templates. |

### Opção D — Modelo híbrido

Combinação: IA gera primeira versão → professor revisa e adapta → dev integra na plataforma.

| Critério | Avaliação |
|----------|-----------|
| **Qualidade pedagógica** | Alta (melhor dos dois mundos). |
| **Escalabilidade** | **Alta.** IA escala, professor garante qualidade. |
| **Custo** | ~8h Edgar + ~10h professor + 5h dev. Custo moderado. |
| **Velocidade** | Alta. IA gera rápido, professor revisa mais rápido do que cria do zero. |
| **Consistência curricular** | Alta. IA alinhada ao currículo + professor valida. |
| **Risco de conteúdo incorreto** | Baixo. Duas camadas de validação. |
| **Manutenção** | Baixa. Tool regenera, professor adapta. |
| **Responsabilidade editorial** | Clara: professor é o editor final. IA é ferramenta. |
| **Personalização** | Alta. Professor adapta conteúdo gerado à realidade local. |

### Tabela Comparativa

| Critério | A (Interno) | B (Parceiros) | C (IA) | D (Híbrido) |
|----------|:-:|:-:|:-:|:-:|
| Qualidade pedagógica | ★★★ | ★★★★★ | ★★★ | ★★★★★ |
| Escalabilidade | ★★ | ★★★ | ★★★★★ | ★★★★★ |
| Custo | ★★★ | ★★★★ | ★★★★★ | ★★★ |
| Velocidade (piloto) | ★★★★★ | ★★★ | ★★★★★ | ★★★★ |
| Consistência curricular | ★★★ | ★★★★★ | ★★★ | ★★★★ |
| Risco conteúdo incorreto | ★★★ | ★★★★★ | ★★ | ★★★★ |
| Manutenção | ★★ | ★★★ | ★★★★★ | ★★★★ |
| Responsabilidade editorial | ★★★★★ | ★★★★★ | ★★ | ★★★★ |
| Personalização | ★★ | ★★★★★ | ★★★ | ★★★★★ |

### Recomendação da Engenharia/Produto

**Recomendação: Opção D — Modelo híbrido, com Opção B como tática imediata.**

**Estratégia em duas fases:**

**Fase 1 — Piloto (Opção B):** 1 professor parceiro cria conteúdo manualmente para 1 disciplina (Matemática, 7a classe). Isto serve dois objetivos:
- Conteúdo rápido para o piloto (2 semanas)
- Dogfooding: professor testa a ferramenta de criação como utilizador

**Fase 2 — Escala (Opção D):** Edgar desenvolve tool de geração IA alinhada ao currículo angolano. Professor revisa e adapta. Tool fica disponível para novas disciplinas.

**Porquê não Opção C pura?** A IA sozinha não tem responsabilidade editorial clara. Se um exercício gerado por IA tiver um erro, quem é responsável? O modelo híbrido resolve isto: o professor é sempre o editor final.

**Papel do Edgar:** Não assumir que esta responsabilidade já lhe foi atribuída. Se a Opção D for escolhida, o Edgar será convidado a desenvolver a tool de geração — mas isso requer uma decisão separada sobre priorização do seu tempo.

### DECISION REQUIRED

> **Qual modelo de autoria de conteúdo deve ser adotado?**
>
> - **A:** Equipa interna (devs + professor)
> - **B:** Professores parceiros (conteúdo manual)
> - **C:** IA + revisão humana (Edgar + professor)
> - **D:** Híbrido (IA gera, professor revisa) — **Recomendado**

---

## 6. DECISION REQUIRED #3 — Exercise Engine Scope

> **O MVP limita-se a 2-3 tipos de interação cobrindo 1-2 disciplinas, ou implementa o leque completo?**

### Contexto

O schema atual define 7 tipos de exercício no enum `ExerciseType`: `multiple_choice`, `fill_in`, `step_by_step`, `true_false`, `drag_and_drop`, `short_answer`, `listening`. Todos estão definidos no schema mas **nenhum está implementado na UI**. A questão é quais devem entrar no primeiro vertical slice.

### Porquê limitar o escopo no MVP

Antes de avaliar as opções, é importante explicar porquê esta limitação é **estratégica**, não apenas técnica:

1. **Validar a hipótese antes de construir o engine.** A pergunta central é: "Os estudantes realmente querem usar uma experiência de aprendizagem digital alinhada com o que estão a aprender na escola?" Esta pergunta pode ser respondida com multiple_choice e fill_in. Não precisa de drag-and-drop.

2. **Custo de implementação por tipo.** Cada tipo de exercício exige: (a) schema de options/answer, (b) UI de rendering, (c) UI de resposta, (d) lógica de validação, (e) cálculo de mastery. Tipos como drag-and-drop e listening adicionam dependências externas (drag library, áudio infrastructure).

3. **Risco de overengineering.** Construir um engine genérico que suporta 7 tipos desde o início é significativamente mais complexo do que construir para 3 tipos e extender depois.

4. **Conteúdo.** Cada tipo de exercício exige conteúdo diferente. Multiple_choice é trivial de criar. Drag-and-drop e listening são trabalhosos. Limitar tipos simplifica a criação de conteúdo para o piloto.

### Opção A — Restrito (MVP)

Apenas `multiple_choice`, `fill_in`, `true_false`. 1-2 disciplinas piloto.

| Critério | Avaliação |
|----------|-----------|
| **Cobertura curricular** | Cobre ~80% dos exercícios de Matemática e Português. Não cobre disciplinas práticas. |
| **Complexidade de UI** | Baixa. Três tipos simples, testados em múltiplas plataformas. |
| **Complexidade de validação** | Baixa. Resposta correta/errada direta. |
| **Custo de implementação** | 5-7 dias dev + 3 dias UI |
| **Conteúdo necessário** | ~10 exercícios por disciplina (viável com 1 professor) |
| **Experiência do estudante** | Funcional mas "básica". Comparação com Duolingo é inevitável. |
| **Validação da hipótese** | **Suficiente.** Studantes completam exercícios? Voltam? Aprendem? |

### Opção B — Intermediário

`multiple_choice`, `fill_in`, `true_false` + `step_by_step` e `short_answer`. 3-4 disciplinas.

| Critério | Avaliação |
|----------|-----------|
| **Cobertura curricular** | Cobre ~90% das disciplinas académicas. `step_by_step` é essencial para Matemática (resolução de equações). |
| **Complexidade de UI** | Média. `step_by_step` exige UI multi-step com validação parcial. |
| **Complexidade de validação** | Média. `step_by_step` pode ter múltiplos passos com erros parciais. |
| **Custo de implementação** | 8-11 dias dev + 4 dias UI |
| **Conteúdo necessário** | ~15 exercícios por disciplina |
| **Experiência do estudante** | Rica o suficiente para ser diferente de um questionário simples. |
| **Validação da hipótese** | **Fortalecida.** `step_by_step` é o tipo mais diferenciador vs. plataformas genéricas. |

### Opção C — Completo

Todos os 7 tipos: `multiple_choice`, `fill_in`, `step_by_step`, `true_false`, `drag_and_drop`, `short_answer`, `listening`. Todas as disciplinas.

| Critério | Avaliação |
|----------|-----------|
| **Cobertura curricular** | 100%. Inclui disciplinas práticas e de audição. |
| **Complexidade de UI** | **Alta.** Drag-and-drop exige lib externa (dnd-kit ou similar). Listening exige áudio infrastructure (upload, streaming, playback). |
| **Complexidade de validação** | **Alta.** Drag-and-drop: validação de ordenação/associação. Listening: validação de compreensão auditiva. |
| **Custo de implementação** | 20-27 dias dev + 7 dias UI |
| **Conteúdo necessário** | ~20 exercícios por disciplina, incluindo áudio e interações visuais |
| **Experiência do estudante** | **Completa.** Experiência rica desde o início. |
| **Validação da hipótese** | **Innecessariamente ampla.** Valida 7 tipos quando 3 bastam para provar o conceito. |

### Tabela Comparativa

| Critério | A (Restrito) | B (Intermediário) | C (Completo) |
|----------|:-:|:-:|:-:|
| Cobertura curricular | 80% | 90% | 100% |
| Complexidade UI | Baixa | Média | Alta |
| Custo implementação | 5-7 dias | 8-11 dias | 20-27 dias |
| Conteúdo necessário | Baixo | Médio | Alto |
| Experiência estudante | Básica | Rica | Completa |
| Validação hipótese | Suficiente | Fortalecida | Innecessariamente ampla |
| Risco de scope creep | Baixo | Baixo | **Alto** |

### Porquê a Opção A ou B pode ser importante

> **A limitação intencional do escopo protege contra scope explosion.**

O risco real não é技术 — é de produto. Se a equipa tentar implementar drag-and-drop, listening, e timeline no mesmo sprint que o learning loop básico, o resultado será:

1. Nenhum tipo funciona bem em vez de 3 tipos funcionarem perfeitamente
2. O piloto é adiado porque o conteúdo para tipos complexos é trabalhoso de criar
3. A validação com utilizadores reais fica para "depois de terminar tudo"
4. O "depois de terminar tudo" nunca chega

A Opção A ou B permite:
- Loop funcional em 1-2 semanas
- Conteúdo criável em 1 semana
- Validação com utilizadores em 3 semanas
- Decisão go/no-go com dados reais

### Recomendação da Engenharia/Produto

**Recomendação: Opção A para o piloto, evoluir para Opção B no EPIC07 completo.**

**Raciocínio:**

1. **Piloto = Opção A.** `multiple_choice`, `fill_in`, `true_false` são suficientes para validar se estudantes querem exercitar online. Matemática 7a classe é a disciplina ideal — exercícios de múltipla escolha e preenchimento são naturais.

2. **EPIC07 completo = Opção B.** Adicionar `step_by_step` (essencial para Matemática — resolução de equações passo a passo) e `short_answer` (essencial para Português e História). Isto dá cobertura para 3-4 disciplinas.

3. **Opção C fica para iterações futuras.** Drag-and-drop e listening são features de produto maduro. Não precisam de MVP. Podem ser adicionadas quando o produto tiver validação e utilizadores ativos.

4. **O schema já suporta todos os 7 tipos.** Não é preciso alterar o Prisma. A decisão é sobre **implementação na UI e lógica de validação**, não sobre o modelo de dados.

### DECISION REQUIRED

> **Qual o escopo do motor de exercícios no MVP?**
>
> - **A:** Restrito — 3 tipos, 1-2 disciplinas — **Recomendado para piloto**
> - **B:** Intermediário — 5 tipos, 3-4 disciplinas — **Recomendado para EPIC07 completo**
> - **C:** Completo — 7 tipos, todas as disciplinas — **Adiado para iterações futuras**

---

## 7. Adaptive Learning Domain

### 7.1 Arquitetura Conceptual

```text
School
  ↓
EducationCycle
  ↓
Subject (existente — âncora curricular)
  ↓
Curriculum (template curricular nacional)
  ↓
CurriculumCourse (mapeamento Course → Curriculum)
  ↓
CurriculumUnit (unidades temáticas)
  ↓
CurriculumTopic (tópicos dentro de uma unidade)
  ↓
Lesson (conteúdo educativo)
  ↓
Exercise (exercícios)
  ↓
Answer (respostas do estudante)
  ↓
Feedback (explicação pós-resposta)
  ↓
MasteryScore (domínio por tópico)
  ↓
LearningPath (progressão do estudante)
```

### 7.2 Princípio Fundamental: Subject é a Âncora

O Learning Engine **estende o domínio existente**, não cria um segundo sistema curricular.

```text
NÃO criar:
  LearningSubject
  CourseSubject (já existe — é a junção Course-Subject)
  AcademicSubject
  LearningCourse
```

A entidade `Subject` (schema:244) continua a ser a âncora. O `MasteryScore` referencia diretamente `Subject`. O `CurriculumCourse` é um template curricular que **não substitui** `Course` — é uma camada de referência acima.

### 7.3 Duas Camadas: Curriculum (Template) vs. School (Execução)

| Camada | Modelos | Responsabilidade | Quem cria |
|--------|---------|-----------------|-----------|
| **Curriculum** (template) | Curriculum, CurriculumCourse, CurriculumUnit, CurriculumTopic | Framework curricular nacional. Define o "o que ensinar". | Admin da plataforma ou seed data |
| **School** (execução) | Subject, Class, Course, Enrollment, Lesson, Exercise | Implementação local. Define o "como ensinar na escola X". | Admin da escola + professores |

**Relação entre camadas:** `CurriculumCourse` mapeia semanticamente para `Course` + `Subject` (mesmo nome, mesma disciplina). Não há FK física — a ligação é por nome e ciclo educacional. Isto permite:
- Múltiplas escolas usarem o mesmo curriculum com implementações locais diferentes
- Escolas personalizarem lessons/exercícios sem afetar o template curricular
- O curriculum evoluir (versão 2024 → 2025) sem destruir dados históricos

---

## 8. Prisma Model Additions

### 8.1 Modelos implementados (já no schema)

Todos os 13 modelos propostos no ADDENDUM_06 **já foram implementados** no schema Prisma. Estado atual:

| Modelo | Linha no schema | Estado | Responsabilidade |
|--------|----------------|--------|-----------------|
| `Curriculum` | 1233 | ✅ Implementado | Framework curricular (nome, país, versão) |
| `CurriculumCourse` | 1244 | ✅ Implementado | Mapeamento curso-curriculum (nome, grade, ciclo) |
| `CurriculumUnit` | 1257 | ✅ Implementado | Unidades temáticas (título, ordem, peso) |
| `CurriculumTopic` | 1271 | ✅ Implementado | Tópicos dentro de uma unidade (título, ordem) |
| `Lesson` | 1283 | ✅ Implementado | Conteúdo educativo (markdown, tipo, ordem) |
| `LessonContent` | 1303 | ✅ Implementado | Conteúdo auxiliar (vídeo, PDF, link) |
| `Exercise` | 1313 | ✅ Implementado | Exercícios (tipo, questão, opções, resposta) |
| `Answer` | 1334 | ✅ Implementado | Respostas do estudante (resposta, corretude, pontos) |
| `MasteryScore` | 1349 | ✅ Implementado | Domínio por tópico (score 0-1, disciplina, tópico) |
| `StudentXP` | 1362 | ✅ Implementado | XP total do estudante (total, nível) |
| `XPEvent` | 1371 | ✅ Implementado | Histórico de eventos de XP (quantia, fonte, referência) |
| `StudentStreak` | 1383 | ✅ Implementado | Sequência diária (current, longest, lastActive) |
| `LearningPath` | 1393 | ✅ Implementado | Progressão do estudante (curso, unidade, status) |

### 8.2 Enums implementados

| Enum | Valores | Estado |
|------|---------|--------|
| `ContentType` | `teorico`, `pratico`, `video`, `misto` | ✅ Implementado |
| `ExerciseType` | `multiple_choice`, `fill_in`, `step_by_step`, `true_false`, `drag_and_drop`, `short_answer`, `listening` | ✅ Implementado |

### 8.3 Rotas API implementadas

| Grupo | Rotas | Estado |
|-------|-------|--------|
| `/api/curriculum/*` | 8 rotas (CRUD curriculum, courses, units, topics) | ✅ Implementado |
| `/api/learning/lessons` | GET list, GET by ID | ✅ Implementado |
| `/api/learning/lessons/[id]/exercises` | GET exercises for lesson | ✅ Implementado |
| `/api/learning/exercises/[id]` | GET exercise | ✅ Implementado |
| `/api/learning/exercises/[id]/submit` | POST submit answer | ✅ Implementado |
| `/api/learning/progress` | GET student progress | ✅ Implementado |
| `/api/learning/xp` | GET student XP | ✅ Implementado |
| `/api/learning/streak` | GET student streak | ✅ Implementado |
| `/api/learning/mastery` | GET mastery scores | ✅ Implementado |

**Total: 17 rotas novas** (8 curriculum + 9 learning)

### 8.4 Por que existe cada modelo

| Modelo | Por que existe? | Que dado NÃO duplica? |
|--------|----------------|----------------------|
| `Curriculum` | Modelar o framework curricular como entidade permite suportar múltiplos países e versões. | Não substitui `Subject` — Subject é a âncora escolar. |
| `CurriculumCourse` | Mapear cursos do currículo para a estrutura escolar. | Não substitui `Course` — Course é a entidade da escola. |
| `CurriculumUnit` | Organizar conteúdo em unidades temáticas com ordem e peso. | Não substitui `Assignment` — Unit é estrutura, Assignment é tarefa. |
| `CurriculumTopic` | Subdividir unidades em tópicos para granularidade de mastery. | Não substitui `Subject` — Topic é uma subdivisão de Unit, não de Subject. |
| `Lesson` | Conteúdo educativo que o estudante lê/estuda antes de exercitar. | Não substitui `ScheduleSlot` (antigo Lesson de agendamento). |
| `LessonContent` | Conteúdo auxiliar (vídeo, PDF) vinculado a uma Lesson. | Não substitui `AssignmentSubmission` — é material de estudo, não submissão. |
| `Exercise` | Interacción que gera dados de performance do estudante. | Não substitui `Exam` — Exercise é pratic, Exam é avaliativo. |
| `Answer` | Dado bruto de performance: o que o estudante respondeu. | Não substitui `Result` — Answer é por exercício, Result é por disciplina/trimestre. |
| `MasteryScore` | Agregação de performance por tópico. Alimenta o Perfil Evolutivo. | Não substitui `Result` — MasteryScore é granular (por tópico), Result é agregado (por disciplina). |
| `StudentXP` | Gamificação: recompensa por atividade. | Não substitui nada existente — é novo. |
| `XPEvent` | Histórico de recompensas para analytics e trends. | Não duplica `StudentXP` — XPEvent é o log, StudentXP é o saldo. |
| `StudentStreak` | Engajamento: sequência diária de atividade. | Não duplica nada — é novo. |
| `LearningPath` | Progressão do estudante no currículo. | Não substitui `Enrollment` — Enrollment é matrícula na escola, LearningPath é progressão no conteúdo. |

---

## 9. Existing Model Integration

### 9.1 Mapa de Relações

```text
EducationCycle ──> GlobalClass ──> Class ──> Enrollment ──> Student ──> User
                                                |
Course ──> CourseSubject ──> Subject ──────────> MasteryScore
                                    |                |
                                    |                └── Answer <── Exercise <── Lesson
                                    |                                   |
                                    └── teacherSubjects                └── LessonContent
                                    |
                              [semantic link]
                                    |
                            CurriculumCourse ──> Curriculum
                                    |
                            CurriculumUnit
                                    |
                            CurriculumTopic
                                    |
                            LearningPath (per student)
```

### 9.2 Relações com modelos existentes

| Modelo existente | Como se liga ao Learning Engine | Tipo de ligação |
|-----------------|-------------------------------|-----------------|
| **Subject** (schema:244) | `MasteryScore.subjectId` → `Subject.id` | FK direta |
| **Class** (schema:287) | Indireta via `Enrollment` → `Student` → `Answer/MasteryScore` | Via Student |
| **EducationCycle** (schema:829) | Indireta via `CurriculumCourse.cycleLevel` | Semântica (enum) |
| **Student** (schema:192) | `Answer.studentId`, `MasteryScore.studentId`, `StudentXP.studentId`, `StudentStreak.studentId`, `LearningPath.studentId` | FKs diretas |
| **Teacher** (schema:171) | Indireta. Professor cria conteúdo via API, não FK no schema. | Via API/auth |
| **School** (schema:11) | `Lesson.schoolId` → `School.id` | FK direta (multi-tenancy) |
| **Course** (schema:262) | Semântica com `CurriculumCourse` (mesmo nome, mesmo ciclo). Sem FK. | Semantic match |
| **Enrollment** (schema:675) | Indireta. Student matriculado → pode aceder a Learning Paths. | Via Student |

### 9.3 Regra: Não criar entidades paralelas

O Learning Engine **não cria**:

| Entidade paralela evitada | Porquê |
|--------------------------|--------|
| `LearningSubject` | `Subject` já existe e é a âncora |
| `LearningClass` | `Class` já existe via Enrollment |
| `LearningCourse` | `Course` já existe; `CurriculumCourse` é template, não execução |
| `AcademicSubject` | `Subject` já existe |
| `StudentLearningRecord` | `Answer` + `MasteryScore` cobrem esta necessidade |

---

## 10. Student Learning State

### 10.1 Separação Content vs. Student State

A arquitetura separa rigorosamente duas camadas:

#### Content (partilhado por todos os estudantes)

```text
Curriculum → CurriculumCourse → CurriculumUnit → CurriculumTopic → Lesson → Exercise
```

| Modelo | Responsabilidade | Partilhado? |
|--------|-----------------|-------------|
| `Curriculum` | Framework curricular | Sim (global) |
| `CurriculumCourse` | Template do curso | Sim (global) |
| `CurriculumUnit` | Estrutura de unidades | Sim (global) |
| `CurriculumTopic` | Tópicos | Sim (global) |
| `Lesson` | Conteúdo educativo | Sim (por escola) |
| `LessonContent` | Conteúdo auxiliar | Sim (por lesson) |
| `Exercise` | Exercício | Sim (por lesson) |

> **Uma mesma Lesson/Exercise é reutilizada por milhares de estudantes sem duplicar conteúdo.**

#### Student State (individual por estudante)

```text
Answer → MasteryScore → LearningPath → StudentXP → StudentStreak
```

| Modelo | Responsabilidade | Individual? |
|--------|-----------------|-------------|
| `Answer` | Resposta do estudante a um exercício | Sim (1 por exercise por student) |
| `MasteryScore` | Domínio do estudante num tópico | Sim (1 por student por topic) |
| `LearningPath` | Progressão do estudante no currículo | Sim (1 por student por course) |
| `StudentXP` | Saldo de XP do estudante | Sim (1 por student) |
| `XPEvent` | Histórico de eventos de XP | Sim (log por student) |
| `StudentStreak` | Sequência diária | Sim (1 por student) |

### 10.2 Como o estado individual é persistido

```text
Estudante abre Lesson
       ↓
Estudante lê conteúdo (Lesson.content — partilhado)
       ↓
Estudante resolve Exercise (Exercise — partilhado)
       ↓
Estudante submete Answer (Answer — individual)
       ↓
Sistema valida resposta (Exercise.correctAnswer — partilhado)
       ↓
Sistema calcula MasteryScore (MasteryScore — individual)
       ↓
Sistema atualiza LearningPath (LearningPath — individual)
       ↓
Sistema atribui XP (XPEvent + StudentXP — individual)
       ↓
Sistema atualiza streak (StudentStreak — individual)
```

### 10.3 Exemplo de persistência

| Operação | Modelo escrito | Dado partilhado? |
|----------|---------------|-----------------|
| Estudante A responde exercício 1 de "Números Inteiros" | `Answer { exerciseId: "ex1", studentId: "A", answer: "42", isCorrect: true }` | Não — é individual |
| Estudante B responde exercício 1 de "Números Inteiros" | `Answer { exerciseId: "ex1", studentId: "B", answer: "37", isCorrect: false }` | Não — é individual |
| Exercise 1 em si | `Exercise { id: "ex1", question: "Quanto é 6×7?", correctAnswer: "42" }` | Sim — partilhado |
| MasteryScore de A em "Números Inteiros" | `MasteryScore { studentId: "A", subjectId: "math", topicTitle: "Números Inteiros", score: 0.85 }` | Não — é individual |

### 10.4 Nota sobre gamificação

`StudentXP`, `XPEvent`, e `StudentStreak` são **parte do Student State**, não do Content. Estes modelos:

- **Já estão implementados** no schema
- **Não estão integrados** na UI (nenhuma página mostra XP ou streak)
- **Não entram** no piloto mínimo (Decision Required #3, Opção A)
- **Ficam para EPIC07-D** (gamificação completa)

O piloto funciona sem gamificação. XP e streak são engagement layers — melhoram retenção mas não são essenciais para validar se o learning loop funciona.

---

## 11. Relationship with Student Profile / EPIC06

### 11.1 O que é o EPIC06

O EPIC06 foi identificado na Auditoria de Alinhamento (19/ago) como o backlog do "coração" do estudante:

- StudentProfile (perfil evolutivo)
- Portfolio (trabalhos, projetos, conquistas)
- Feedback Loop (reflexão, metas, milestones)

O ADDENDUM_06 propôs que o EPIC07 **absorva** o EPIC06, porque o Perfil Evolutivo é consequência natural dos dados gerados pelo Learning Engine — não uma funcionalidade independente.

### 11.2 Relação entre Learning Engine e Perfil Evolutivo

```text
Learning Activity (Exercise → Answer → MasteryScore)
      ↓
Performance Data (accuracy, time, streak, XP)
      ↓
Mastery Aggregation (score por tópico, por disciplina)
      ↓
Competency / Skill (futuro — modelar o que o estudante sabe)
      ↓
Student Profile (síntese do desenvolvimento)
      ↓
Portfolio / Goals / Opportunities (apresentação ao mundo)
```

### 11.3 O que é P0, o que é futuro, o que depende do EPIC06

| Camada | Estado | P0? | Depende de EPIC06? |
|--------|--------|-----|-------------------|
| Learning Activity (Exercise, Answer) | Implementado (schema + API) | **Sim** (piloto) | Não |
| MasteryScore | Implementado (schema + API) | **Sim** (piloto) | Não |
| LearningPath | Implementado (schema + API) | **Parcial** (进度 básico) | Não |
| StudentXP / StudentStreak | Implementado (schema) | **Não** (piloto sem gamificação) | Não |
| Competency / Skill | **Não existe** | **Não** | Sim — depende de dados de mastery |
| StudentProfile | **Não existe** | **Não** | Sim — depende de competency/skill |
| Portfolio | **Não existe** | **Não** | Sim — depende de StudentProfile |
| Goal | **Não existe** | **Não** | Sim — depende de StudentProfile |
| Reflection | **Não existe** | **Não** | Sim — depende de StudentProfile |
| Milestone | **Não existe** | **Não** | Sim — depende de StudentProfile |

### 11.4 Conclusão

> **O Learning Engine (EPIC07) é o primeiro passo. O Perfil Evolutivo (EPIC06-F) é o segundo.**

Não se pode construir o Perfil Evolutivo sem dados do Learning Engine. A ordem é:

1. **EPIC07-A/B/C:** Schema + API + Student Learning Loop → gera dados
2. **EPIC07-D:** Gamificação → engajamento
3. **EPIC07-F:** StudentProfile + Portfolio → apresenta dados ao mundo

O EPIC06 não é eliminado — é **deferido para EPIC07-F**, com a dependência correta estabelecida.

---

## 12. Epic / Roadmap Impact

### 12.1 Roadmap de Épicos Atualizado

| Épico | Escopo | Dependências | Estado | Estimativa |
|-------|--------|-------------|--------|------------|
| **EPIC01** | Auth, Multi-tenancy, Fundação de dados | Nenhuma | Em curso → 09/set | Conforme Master Plan |
| **EPIC02** | CRUD Gestão Escolar | EPIC01 | Paralelo | Conforme Master Plan |
| **EPIC03** | Grading Engine, Results, Year Transition | EPIC02 | Sequencial | Conforme Master Plan |
| **EPIC04** | Analytics, Dashboards por role | EPIC01, EPIC02 | Paralelo | Conforme Master Plan |
| **EPIC05** | (Não definido) | — | — | — |
| **EPIC06** | ~~StudentProfile, Portfolio, Feedback~~ | — | **Absorvido pelo EPIC07-F** | — |
| **EPIC07** | Adaptive Learning Engine | EPIC01 | **Novo** | 24-32 dias |

### 12.2 EPIC07 — Decomposição

| Fase | Escopo | Dependências | Estimativa |
|------|--------|-------------|------------|
| **EPIC07-A** | Schema + Migrations + Seed | EPIC01 | ✅ **Já feito** |
| **EPIC07-B** | API CRUD conteúdos (professor cria/edita Lessons e Exercises) | EPIC07-A | 4-5 dias |
| **EPIC07-C** | Student Learning Flow (exercitar → submeter → ver resultado → mastery) | EPIC07-B | 5-7 dias |
| **EPIC07-D** | Gamificação (XP, Streak) + Dashboard com Progressão | EPIC07-C | 3-4 dias |
| **EPIC07-E** | Curriculum Seed Tool (importar conteúdo do currículo) | EPIC07-A | 5-7 dias |
| **EPIC07-F** | StudentProfile / Portfolio / Feedback Loop (usa dados do EPIC07-C/D) | EPIC07-C/D | 4-5 dias |

### 12.3 O EPIC07 é um novo épico ou extensão do EPIC06?

**Opção A:** EPIC06 absorve o Learning Engine

```text
EPIC06 — Student Development / Heart
        │
        └── Learning Engine
```

**Opção B:** EPIC06 e EPIC07 são bounded contexts separados

```text
EPIC06 — Student Development / Heart (Profile, Portfolio, Goals)

EPIC07 — Adaptive Learning Engine (Content, Exercises, Mastery)
```

**Análise:**

| Critério | Opção A (absorção) | Opção B (separação) |
|----------|:-:|:-:|
| São o mesmo domínio? | Sim — ambos são "desenvolvimento do estudante" | Não — um é apresentação (profile), outro é conteúdo (learning) |
| Dependências? | Learning Engine alimenta Profile | Learning Engine alimenta Profile |
| Pode construir Profile sem Learning? | Não | Não |
| Pode construir Learning sem Profile? | Sim | Sim |
| Bounded contexts? | 1 contexto: "Student Development" | 2 contextos: "Learning Content" + "Student Presentation" |

**Recomendação: Opção B — Dois épicos separados.**

Justificação:
1. **Bounded contexts distintos.** Learning Content (criar/exercitar/mastery) e Student Presentation (profile/portfolio/goals) são responsabilidades diferentes.
2. **Ordem de construção.** Learning vem primeiro (gera dados). Profile vem depois (apresenta dados). Separar facilita o sequenciamento.
3. **Equipa.** Se houver 2 devs, um pode fazer EPIC07 (learning) e outro EPIC06 (profile) em paralelo, desde que o EPIC07 esteja avançado o suficiente para gerar dados.
4. **O ADDENDUM_06 já definiu EPIC07 como separado.** Manter a consistência.

---

## 13. Dependencies

### 13.1 Mapa de Dependências

```text
EPIC01 (Auth + Multi-tenancy + Fundação)
   │
   ├──> EPIC02 (CRUD Gestão Escolar) ──> EPIC03 (Grading)
   │                                    ──> EPIC04 (Analytics)
   │
   └──> EPIC07 (Adaptive Learning Engine)
            │
            ├── EPIC07-A: Schema + Migrations ──> EPIC07-B: API CRUD
            │                                          │
            │                                          └──> EPIC07-C: Student Flow
            │                                                    │
            │                                                    ├──> EPIC07-D: Gamificação
            │                                                    │
            │                                                    └──> EPIC07-F: Profile/Portfolio
            │
            └── EPIC07-E: Curriculum Seed Tool (paralelo ao B/C)

EPIC02 corre em paralelo ao EPIC07.
```

### 13.2 Dependências do Learning Engine com a fundação existente

| Modelo do Learning Engine | Depende de | Tipo de dependência |
|--------------------------|-----------|---------------------|
| `Curriculum` | Nenhuma | Independente |
| `CurriculumCourse` | `Curriculum` | FK interna |
| `CurriculumUnit` | `CurriculumCourse` | FK interna |
| `CurriculumTopic` | `CurriculumUnit` | FK interna |
| `Lesson` | `CurriculumTopic`, `School` | FK interna + `School` (existente) |
| `Exercise` | `Lesson` | FK interna |
| `Answer` | `Exercise`, `Student` | FK interna + `Student` (existente) |
| `MasteryScore` | `Student`, `Exercise`, `Subject` | FKs para entidades existentes |
| `StudentXP` | `Student` | FK para `Student` (existente) |
| `StudentStreak` | `Student` | FK para `Student` (existente) |
| `LearningPath` | `Student`, `CurriculumCourse` | FKs mistas |

### 13.3 Partes do Learning Engine que dependem da fundação

| Componente | Depende de | Pode construir sem? |
|------------|-----------|---------------------|
| Schema Prisma | `School`, `Student`, `Subject` | **Não** — FKs diretas |
| API CRUD conteúdos | Auth, Multi-tenancy | **Não** — precisa de autenticação |
| Student Learning Flow | Auth, Student session | **Não** — precisa de saber quem é o estudante |
| Mastery calculation | `Subject` | **Não** — MasteryScore referencia Subject |
| Gamificação | `Student` | **Não** — XP/Streak são por student |
| Curriculum Seed Tool | Nenhuma (pode rodar standalone) | **Sim** — tool de importação |

### 13.4 Partes que podem ser construídas de forma independente

| Componente | Independent de | Nota |
|------------|---------------|------|
| Curriculum Seed Tool (EPIC07-E) | UI, Auth | Pode ser script standalone |
| Seed data (1 disciplina piloto) | Tudo | Pode ser feito antes da migration |
| Conteúdo (lições + exercícios) | Código | Professor pode criar em paralelo |

---

## 14. 09/09/2026 Impact Analysis

### 14.1 Premissas de estimativa

- **Equipa:** 1 dev full-time (premissa conservadora)
- **Horas por dia:** 6h produtivas
- **Fim de semana:** Não contabilizado
- **Buffer:** +20% para imprevistos

### 14.2 Classificação por item

#### Fundação técnica (EPIC01-04)

| Item | Cabe antes de 09/set? | Nota |
|------|----------------------|------|
| Auth completa | ✅ Sim | Implementado |
| Multi-tenancy | ✅ Sim | Implementado |
| CRUD Gestão Escolar | ✅ Sim | Implementado |
| Grading Engine | ✅ Sim | Implementado |
| Attendance | ✅ Sim | Implementado |
| Communication | ✅ Sim | Implementado |
| Analytics | ✅ Sim | Implementado |
| Certificates | ✅ Sim | Implementado |

**Conclusão:** Fundação admin está pronta. Não precisa de trabalho adicional antes de 09/set.

#### Learning Engine — Schema

| Item | Cabe antes de 09/set? | Nota |
|------|----------------------|------|
| 13 modelos Prisma | ✅ **Já feito** | Schema implementado |
| 2 enums novos | ✅ **Já feito** | ContentType, ExerciseType |
| Migration Prisma | ⚠️ **Pode correr em paralelo** | Depende de migrações pendentes do EPIC01-04 |
| Seed data (1 curriculum) | ⚠️ **Pode correr em paralelo** | Script TS, 1 dia |

#### Learning Engine — API + UI

| Item | Cabe antes de 09/set? | Nota |
|------|----------------------|------|
| API CRUD Lessons/Exercises (EPIC07-B) | ❌ **Deve ficar pós-09/set** | Depende de schema migrated + auth |
| Student Learning Flow (EPIC07-C) | ❌ **Deve ficar pós-09/set** | Depende de API + UI |
| Gamificação (EPIC07-D) | ❌ **Deve ficar pós-09/set** | Feature completa, não bloqueia piloto |
| Curriculum Seed Tool (EPIC07-E) | ❌ **Deve ficar pós-09/set** | Ferramenta de conteúdo |
| Profile/Portfolio (EPIC07-F) | ❌ **Deve ficar pós-09/set** | Depende de dados do learning engine |

#### Conteúdo

| Item | Cabe antes de 09/set? | Nota |
|------|----------------------|------|
| Lições reais (Matemática 7a classe) | ⚠️ **Pode correr em paralelo** | Professor parceiro cria em paralelo |
| Exercícios reais | ⚠️ **Pode correr em paralelo** | Dependem da UI estar pronta para testar |
| Curriculum mapping (currículo angolano) | ❌ **Bloqueado por decisão** | Depende de Decision #2 (autoria) |

### 14.3 Resumo de impacto

```text
Antes de 09/set:
  ✅ Fundação admin (EPIC01-04) — PRONTA
  ✅ Schema Learning Engine — IMPLEMENTADO
  ⚠️ Migration Prisma — PODE CORRER EM PARALELO
  ⚠️ Conteúdo piloto — PODE CORRER EM PARALELO (professor)

Depois de 09/set:
  ❌ API CRUD conteúdos (EPIC07-B) — 4-5 dias
  ❌ Student Learning Flow (EPIC07-C) — 5-7 dias
  ❌ Loop mínimo testável — 26/set (se schema migrado antes)

Bloqueado por decisão:
  ❌ Escopo de exercícios (Decision #3)
  ❌ Modelo de autoria (Decision #2)
  ❌ Sequenciamento (Decision #1)
```

### 14.4 O marco de 09/set desliza?

**Não necessariamente.**

A fundação admin (EPIC01-04) está pronta. O schema do learning engine já está implementado. O que falta (API + UI + conteúdo) é **trabalho do EPIC07**, não da fundação.

**Se a Opção C (Vertical Slice Paralelo) for escolhida:**
- Marco de 09/set mantido
- EPIC07-B/C começa em 10/set
- Loop mínimo testável: ~26/set
- Nenhum deslizamento

**Se a Opção A (P0 integrado) for escolhida:**
- Marco de 09/set desliza para ~19/set (+10 dias)
- Risco: fundação admin atrasada por dependência cruzada

**Recomendação:** Manter 09/set como marco da fundação. EPIC07-B/C começa em 10/set. Loop mínimo em 26/set.

---

## 15. Minimum Testable Learning Loop

### 15.1 Objetivo

> **Provar a hipótese de produto antes de construir o Learning Engine completo.**

A hipótese central:

> **"Os estudantes realmente querem usar uma experiência de aprendizagem digital alinhada com o que estão a aprender na escola?"**

### 15.2 Escopo do Vertical Slice

```text
1 Subject (Matemática)
    ↓
1 Curriculum (Curriculo Nacional Angola 2024)
    ↓
1 CurriculumCourse (7a Classe - Matematica)
    ↓
1 CurriculumUnit (Numeros Inteiros)
    ↓
3-5 CurriculumTopics (Adição, Subtração, Multiplicação, Divisão, Propriedades)
    ↓
3-5 Lessons (1 por tópico, conteúdo markdown)
    ↓
5-15 Exercises (2-3 por lesson)
    ↓
Student answers → Immediate feedback → Progress stored → Basic mastery calculated
```

### 15.3 O que inclui

| Componente | Escopo | Detalhe |
|------------|--------|---------|
| **Disciplina** | 1: Matemática | Uma única disciplina para validação |
| **Unidade** | 1: "Números Inteiros" | Conteúdo concreto e mensurável |
| **Lições** | 3-5 | Uma por tópico, conteúdo markdown |
| **Exercícios** | 5-15 | 2-3 por lição |
| **Tipos de exercício** | `multiple_choice`, `fill_in`, `true_false` | Tipos simples, sem UI complexa |
| **Submissão** | 1 tentativa por exercício | Resultado imediato (correto/errado + explicação) |
| **Mastery Score** | Cálculo por exercício (0/1), agregado por tópico | Sem algoritmo adaptativo |
| **Dashboard** | Página simples: "Completaste 3/5 lições. Dominas 60% de Números Inteiros" | Sem visualização avançada |
| **Autoria** | Conteúdo criado por 1 professor parceiro | Sem Curriculum Seed Tool |
| **Multi-tenancy** | 1 escola piloto | Uma única escola |

### 15.4 O que NÃO inclui

| Componente | Porquê |
|------------|--------|
| XP / Streak | Gamificação é engagement layer, não essencial para validar learning loop |
| AI Tutor | Funcionalidade futura, não valida hipótese central |
| Adaptive Recommendation Engine | Prematuro — primeiro valida que o loop básico funciona |
| Drag & Drop / Listening / Speaking | Tipos complexos de exercício — ficam para EPIC07 completo |
| Marketplace | Funcionalidade de produto maduro |
| Career Matching | Funcionalidade futura |
| Social Learning | Funcionalidade futura |
| Leaderboards globais | Gamificação avançada |
| Múltiplas disciplinas | Uma basta para validar |
| Múltiplas escolas | Uma basta para validar |

### 15.5 Modelos Prisma utilizados

Apenas 8 dos 13 modelos novos são necessários:

| # | Modelo | Utilizado? | Nota |
|---|--------|-----------|------|
| 1 | `Curriculum` | ✅ Sim | 1 registro seed |
| 2 | `CurriculumCourse` | ✅ Sim | 1: Matemática 7a classe |
| 3 | `CurriculumUnit` | ✅ Sim | 1: Números Inteiros |
| 4 | `CurriculumTopic` | ✅ Sim | 3-5 tópicos |
| 5 | `Lesson` | ✅ Sim | 3-5 lições |
| 6 | `Exercise` | ✅ Sim | 5-15 exercícios |
| 7 | `Answer` | ✅ Sim | Submissões do estudante |
| 8 | `MasteryScore` | ✅ Sim | Agregação por tópico |
| 9 | `LessonContent` | ❌ Não | Conteúdo auxiliar — opcional |
| 10 | `StudentXP` | ❌ Não | Gamificação — futura |
| 11 | `XPEvent` | ❌ Não | Gamificação — futura |
| 12 | `StudentStreak` | ❌ Não | Gamificação — futura |
| 13 | `LearningPath` | ⚠️ Parcial | Progressão básica (status: in_progress/completed) |

### 15.6 Fluxo do utilizador

```text
1. Estudante faz login
2. Estudante vê "Matemática — Números Inteiros"
3. Estudante vê lista de lições: "Adição", "Subtração", "Multiplicação"
4. Estudante clica numa lição
5. Estudante lê o conteúdo (markdown)
6. Estudante resolve os exercícios (2-3 por lição)
7. Estudante submete resposta
8. Sistema mostra: "Correto! +10 pontos" ou "Incorreto. A resposta certa é X. Explicação: Y"
9. Estudante avança para próximo exercício
10. Quando termina a lição, vê: "Completaste 1/3 lições"
11. Quando termina todas as lições, vê: "Completaste 3/3 lições. Dominas 72% de Números Inteiros"
```

---

## 16. User Validation Plan

### 16.1 Participantes

| Perfil | Quantidade | Justificação |
|--------|-----------|--------------|
| **Estudantes** | 15-20 | 1 turma inteira de 7a classe — suficiente para dados quantitativos |
| **Professor** | 1-2 | 1 professor de Matemática que cria conteúdo e observa utilização |
| **Admin da escola** | 1 | Observa dashboard e percebe valor para a escola |

**Perfil dos estudantes:**
- 7a classe (alinhado ao conteúdo piloto)
- Mix de níveis de desempenho (bons, médios, fracos)
- Acesso a telemóvel ou computador (browser)
- Disponibilidade para 1 semana de uso

### 16.2 Duração

| Fase | Duração | Atividade |
|------|---------|-----------|
| **Preparação** | 3 dias | Configurar turma, criar seed data, professor cria conteúdo |
| **Piloto** | 5 dias (1 semana letiva) | Estudantes usam diariamente |
| **Recolha** | 2 dias | Entrevistas, análise de dados, questionário |
| **Análise** | 2 dias | Processar dados, decidir go/no-go |
| **Total** | ~12 dias | Do início da preparação à decisão |

### 16.3 Métricas a medir

#### Métricas quantitativas (automáticas)

| Métrica | Como medir | Target mínimo |
|---------|-----------|---------------|
| **Lesson completion rate** | % de lições completadas vs. iniciadas | > 60% |
| **Exercise completion rate** | % de exercícios submetidos vs. iniciados | > 80% |
| **Accuracy** | % de respostas corretas | > 50% (indica que conteúdo é acessível) |
| **Return rate** | % de estudantes que retornam após 1ª sessão | > 50% |
| **Session frequency** | Média de sessões por semana por estudante | > 2 |
| **Time per lesson** | Tempo médio por lição | 5-15 minutos (aceitável) |
| **Drop-off points** | Em que lição/exercício os estudantes abandonam | Identificar padrões |

#### Métricas qualitativas (entrevistas)

| Métrica | Como medir | Target |
|---------|-----------|--------|
| **Perceived usefulness** | "Isto ajuda-te a aprender Matemática?" (1-5) | > 3.5 |
| **Perceived difficulty** | "Foi fácil de usar?" (1-5) | > 3.5 |
| **Willingness to continue** | "Querias continuar a usar?" (sim/não) | > 70% sim |
| **Teacher perception** | "Recomendarias a outras escolas?" (1-5) | > 3.5 |
| **Content quality** | "O conteúdo está alinhado com o que aprendes na aula?" (1-5) | > 3.5 |

### 16.4 Instrumentos de recolha

| Instrumento | Responsável | Timing |
|-------------|-------------|--------|
| **Dashboard de analytics** | Automático (API /api/learning/progress) | Contínuo durante piloto |
| **Logs de resposta** | Automático (tabela Answer) | Contínuo |
| **Entrevista semiestruturada** | Equipa Cur10usX | Dia 5 do piloto |
| **Questionário curto** | Equipa Cur10usX | Dia 5 do piloto |
| **Observação em sala** | Professor | Durante o piloto |

### 16.5 Riscos da validação

| Risco | Mitigação |
|-------|-----------|
| Studantes não têm acesso a dispositivo | Verificar antes; ter devices de backup na escola |
| Professor não cria conteúdo a tempo | Criar conteúdo de backup com a equipa |
| Turma é pequeña (15 alunos) | Complementar com entrevistas qualitativas |
| Studantes não usam espontaneamente | Professor integra no plano de aula (não é opt-in) |
| Dados insuficientes para decisão | Estender piloto mais 1 semana se necessário |

---

## 17. Go / No-Go Criteria

### 17.1 Critérios GO (investir mais no Learning Engine)

O Learning Engine deve receber investimento adicional se **pelo menos 4 dos 6 critérios** forem cumpridos:

| # | Critério | Métrica | Threshold |
|---|----------|---------|-----------|
| 1 | **Estudantes completam lições** | Lesson completion rate | > 60% |
| 2 | **Estudantes retornam espontaneamente** | Return rate (após 1ª sessão) | > 50% |
| 3 | **Estudantes demonstram interesse** | Willingness to continue (questionário) | > 70% "sim" |
| 4 | **Estudantes conseguem aprender/praticar** | Accuracy > 50% + perceived usefulness > 3.5 | Ambos |
| 5 | **Professores consideram útil** | Teacher perception (questionário) | > 3.5/5 |
| 6 | **Existe evidência de melhoria** | Correlação mastery score vs. performance real | > 0.5 (Pearson) |

### 17.2 Critérios NO-GO / ITERATE (reavaliar antes de investir)

O Learning Engine deve ser reavaliado se **qualquer 2 dos seguintes** ocorrerem:

| # | Critério | Sinal de alerta |
|---|----------|-----------------|
| 1 | **Estudantes abandonam rapidamente** | Return rate < 30% |
| 2 | **Conteúdo não está alinhado** | Perceived usefulness < 2.5 |
| 3 | **UX gera fricção** | Perceived difficulty < 2.5 |
| 4 | **Professores não percebem valor** | Teacher perception < 2.5 |
| 5 | **Custo de conteúdo é insustentável** | > 4h por lição para criar |
| 6 | **Dados não mostram aprendizagem** | Accuracy < 30% (conteúdo inacessível) ou correlação mastery vs. real < 0.3 |

### 17.3 O que fazer em caso de NO-GO

Um NO-GO não significa eliminar o Learning Engine. Significa:

1. **Iterar no design.** O problema pode ser UX, não conceito.
2. **Reavaliar o conteúdo.** O problema pode ser o professor, não os estudantes.
3. **Testar com outra turma.** A amostra pode não ser representativa.
4. **Simplificar.** Talvez o loop mínimo seja demasiado complexo — reduzir para 1 lição, 3 exercícios.
5. **Adiar 1 mês.** Dar tempo para resolver problemas identificados.

### 17.4 Thresholds falsos de precisão

> **Nota importante:** Estes thresholds são **indicativos**, não definitivos. Com 15 estudantes, os dados são qualitativos mais do que quantitativos. O objetivo não é atingir um número mágico — é ter evidência suficiente para tomar uma decisão informada.

Uma decisão go/no-go deve ser tomada em conjunto (Product + Engineering + Professor parceiro), não apenas por números.

---

## 18. Out of Scope

Funcionalidades que parecem tentadoras mas que **não devem entrar** no primeiro vertical slice.

### Explicitamente excluídas do piloto e do EPIC07 inicial

| Funcionalidade | Porquê excluída | Quando pode entrar |
|---------------|----------------|-------------------|
| **AI Tutor completo** | Não valida a hipótese central. Custo de desenvolvimento alto. Risco de conteúdo incorreto. | Pós-validação, quando o learning loop estiver provado |
| **Adaptive Recommendation Engine** | Prematuro. Primeiro precisa de dados de utilização para saber o que recomendar. | Quando houver >100 estudantes ativos com dados históricos |
| **Centenas de tipos de exercício** | 3 tipos bastam para validar. Cada tipo adicional exige UI + validação + conteúdo. | EPIC07 completo (após validação) |
| **Marketplace de conteúdo** | Funcionalidade de produto maduro. Requer ecossistema de professores + conteúdo validado. | Produto maduro, >1000 utilizadores |
| **Career matching** | Funcionalidade futura. Depende de dados de competências que ainda não existem. | Após StudentProfile e Competency model |
| **Simulações complexas** | Custo de desenvolvimento alto. Não é essencial para validar learning loop. | Produto maduro |
| **Social learning completo** | Funcionalidade de engajamento, não de validação. Adiciona complexidade sem validar hipótese. | Após validação do loop básico |
| **Leaderboards globais** | Gamificação avançada. Pode criar pressão negativa em estudantes com baixo desempenho. | Quando o produto tiver massa crítica |
| **Sistema de gamificação extremamente complexo** | XP e streak são suficientes para MVP. Níveis, badges, recompensas são engagement layers. | Após validação |
| **Drag & Drop exercises** | UI complexa em mobile. Exige lib externa. Não é essencial para validação. | EPIC07 completo |
| **Listening exercises** | Exige infraestrutura de áudio (upload, streaming, playback). Não é essencial para Matemática piloto. | Disciplinas de línguas |
| **Timeline exercises** | Tipo especializado. Não é essencial para validação. | Disciplinas de História |
| **Múltiplas disciplinas no piloto** | Uma disciplina basta para validar. Adicionar disciplinas multiplica conteúdo necessário. | Após validação bem-sucedida |
| **Múltiplas escolas no piloto** | Uma escola basta. Multi-tenancy já está provado no SIS. | Após validação |
| **Curriculum completo angolano** | Seed data manual para 1 unidade basta. Mapear 12 disciplinas é trabalho de meses. | EPIC07-E (Curriculum Seed Tool) |

### O que proteger contra

> **Scope explosion** é o maior risco de produto. A equipa deve proteger-se contra:

1. **"E se também fizéssemos..."** — Cada adição ao escopo deve ser justificada pela validação, não pela imaginação.
2. **"Os alunos vão querer..."** — Não sabemos o que os alunos querem até testarmos.
3. **"Mas o Duolingo tem..."** — O Duolingo tem 10 anos e 500M utilizadores. Nós temos 0.
4. **"É só mais uma feature..."** — Cada feature tem custo de manutenção, suporte, e complexidade.

---

## 19. Risks

### 19.1 Product Risk

| Risco | Probabilidade | Impacto | Mitigação |
|-------|:------------:|:-------:|-----------|
| **Estudantes não querem exercitar online** | Média | Crítico | Validar com piloto antes de investir. Vertical slice minimiza perda. |
| **Comparação com Duolingo cria expectativas irrealistas** | Alta | Médio | Posicionar como "primeira versão". Comunicar roadmap. Focar no alinhamento curricular (diferencial). |
| **Professores não adotam a ferramenta de criação** | Média | Alto | Dogfooding desde o início. 1 professor parceiro como co-criador. |
| **Conteúdo não está alinhado ao currículo** | Média | Alto | Professor revisa todo o conteúdo. Curriculum mapping manual no piloto. |
| **Produto parece "básico" vs. concorrência** | Alta | Médio | MVP é intencionalmente básico. Focar no que funciona, não no que falta. |

### 19.2 Technical Risk

| Risco | Probabilidade | Impacto | Mitigação |
|-------|:------------:|:-------:|-----------|
| **MasteryScore calculation é lenta com muitos exercises** | Baixa | Médio | Indexar por studentId + subjectId. Calcular em batch se necessário. |
| **Schema cria conflito com migrações pendentes** | Baixa | Alto | Adicionar schema no final da cadeia. Usar `prisma migrate dev` com cuidado. |
| **UI de exercício não funciona em mobile** | Média | Alto | Testar mobile desde o início. Usar componentes responsive. |
| **API de submissão tem race conditions** | Baixa | Médio | @@unique por exercise+student previne submissões duplicadas. |
| ** Conteúdo markdown é difícil de renderizar** | Baixa | Baixo | Usar biblioteca existente (react-markdown). Não inventar renderer. |

### 19.3 Content Risk

| Risco | Probabilidade | Impacto | Mitigação |
|-------|:------------:|:-------:|-----------|
| **Falta de conteúdo para o piloto** | Média | Crítico | Professor parceiro cria em paralelo. Conteúdo de backup pela equipa. |
| **Conteúdo desalinhado ao currículo angolano** | Média | Alto | Professor valida. Curriculum mapping manual. |
| **Conteúdo é demasiado fácil ou difícil** | Média | Médio | Ajustar dificuldade após feedback do piloto. |
| **Custo de criação de conteúdo é insustentável** | Média | Alto | Medir tempo de criação no piloto. Se >4h/lição, simplificar. |
| **Conteúdo não é reutilizável entre escolas** | Baixa | Médio | Lesson tem schoolId — permite customização local. |

### 19.4 Delivery Risk

| Risco | Probabilidade | Impacto | Mitigação |
|-------|:------------:|:-------:|-----------|
| **Marco de 09/set desliza por EPIC07** | Baixa | Alto | EPIC07-B/C começa após 09/set. Schema já implementado. |
| **Equipa não tem capacity para EPIC07** | Média | Alto | EPIC07 pode ser adiado sem impacto na fundação. |
| **Professor parceiro não está disponível** | Média | Crítico | Identificar backup. Conteúdo de emergência pela equipa. |
| **Escola piloto não está disponível** | Baixa | Alto | Usar turma existente se houver. |
| **Validação produz dados insuficientes** | Média | Médio | Estender piloto mais 1 semana. Complementar com entrevistas. |
| **Dependência do EPIC06 para dados** | Baixa | Médio | EPIC07-F (profile) vem depois de EPIC07-C/D. Não bloqueia piloto. |

### 19.5 Resumo por categoria

| Categoria | Risco mais alto | Mitigation principal |
|-----------|----------------|---------------------|
| **Product** | Studantes não querem exercitar online | Validar antes de investir |
| **Technical** | UI mobile não funciona | Testar desde o início |
| **Content** | Falta de conteúdo | Professor parceiro + backup |
| **Delivery** | Professor parceiro não disponível | Identificar backup cedo |

---

## 20. Recommended Architecture

### 20.1 Architecture Pattern

```text
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                     │
├─────────────────────────────────────────────────────────┤
│  (auth)    (dashboard)    (minha-area)    (admin)        │
│  Signin    Admin UI        Student UI      SuperAdmin     │
├─────────────────────────────────────────────────────────┤
│                    API Routes                             │
│  /api/curriculum/*    /api/learning/*    /api/students/*  │
│  (CRUD template)      (learning flow)    (admin CRUD)    │
├─────────────────────────────────────────────────────────┤
│                    Prisma ORM                             │
│  Content Models ──── Student State Models ──── Admin     │
│  Curriculum          Answer, MasteryScore    Student      │
│  Lesson, Exercise    XP, Streak             Teacher      │
├─────────────────────────────────────────────────────────┤
│                    PostgreSQL                             │
│  Multi-tenant (schoolId)                                 │
└─────────────────────────────────────────────────────────┘
```

### 20.2 Princípios arquiteturais

1. **Subject é a âncora.** Não criar entidades paralelas.
2. **Content vs. Student State.** Separar rigorosamente.
3. **Extensão, não substituição.** Learning Engine estende o domínio existente.
4. **Multi-tenancy primeiro.** Todo o novo modelo respeita `schoolId`.
5. **Schema first, UI depois.** Schema já está pronto. API e UI vêm a seguir.

---

## 21. Recommended Sequencing

### 21.1 Sequência recomendada

```text
AGOSTO 2026
├── 26/ago ── Addendum 07 produzido
├── 27-28/ago ── DECISÕES 1, 2, 3 tomadas pelo Founding Team
├── 29-31/ago ── Migration Prisma executada + seed data

SETEMBRO 2026
├── 09/set ── EPIC01-04 (Fundação) CONCLUÍDO ✅
├── 10-14/set ── EPIC07-B: API CRUD conteúdos (professor cria Lessons + Exercises)
├── 15-19/set ── EPIC07-C: Student Learning Flow (exercitar → submeter → mastery)
├── 20-21/set ── Professor cria conteúdo piloto (5 lições + 10 exercícios)
├── 22-26/set ── PILOTO: 1 turma, 5 dias de uso
├── 27-28/set ── Análise de dados + entrevistas
├── 29/set ── DECISÃO GO/NO-GO

OUTUBRO 2026 (se GO)
├── 01-05/out ── EPIC07-D: Gamificação (XP, Streak)
├── 06-12/out ── EPIC07-E: Curriculum Seed Tool (com Edgar)
├── 13-17/out ── EPIC07-F: StudentProfile + Portfolio
├── 20/out ── EPIC07 COMPLETO
```

### 21.2 Marcos

| Marco | Data | Dependências |
|-------|------|-------------|
| Decisões tomadas | 28/ago | Founding Team |
| Migration executada | 31/ago | EPIC01-04 concluídos |
| Fundação completa | 09/set | EPIC01-04 |
| API CRUD pronta | 14/set | Migration |
| Student flow pronto | 19/set | API CRUD |
| Piloto iniciado | 22/set | Conteúdo pronto |
| Decisão go/no-go | 29/set | Dados do piloto |
| EPIC07 completo (se GO) | 20/out | Decisão go |

---

## 22. Final Decision Log

### 22.1 Decisões tomadas (FECHADAS)

| # | Decisão | Estado | Fonte |
|---|---------|--------|-------|
| D0 | Nova categoria: "Adaptive Learning Platform + School OS" | **FECHADO** | Decisão de produto |
| D1 | Estratégia Go-To-Market: "Cavalo de Troia" | **FECHADO** | Master Plan Parte 2 |
| D2 | Student Experience mínima é P0 | **FECHADO** | Master Plan Parte 3 |
| D3 | Schema do Learning Engine implementado | **FECHADO** | ADDENDUM_06 + código |
| D4 | EPIC07 absorve EPIC06 | **FECHADO** | ADDENDUM_06 |
| D5 | Subject é a âncora curricular | **FECHADO** | Este addendum, secção 7 |
| D6 | Content vs. Student State separados | **FECHADO** | Este addendum, secção 10 |
| D7 | Marco de fundação: 09/set/2026 | **FECHADO** | Master Plan Parte 5 |

### 22.2 Decisões pendentes (DECISION REQUIRED)

| # | Decisão | Opções | Recomendação | Precisa de |
|---|---------|--------|-------------|------------|
| **DR1** | Sequenciamento do Learning Loop | A: P0 integrado / B: P1 pós-fundação / C: Vertical Slice paralelo | **C** | Decisão do Founding Team |
| **DR2** | Autoria de conteúdo | A: Interno / B: Parceiros / C: IA / D: Híbrido | **D** (com B para piloto) | Decisão do Founding Team |
| **DR3** | Escopo do motor de exercícios | A: Restrito (3 tipos) / B: Intermediário (5) / C: Completo (7) | **A** para piloto, **B** para EPIC07 | Decisão do Founding Team |

### 22.3 Próximos passos imediatos

| # | Ação | Responsável | Prazo |
|---|------|-------------|-------|
| 1 | Tomar decisão DR1 (sequenciamento) | Founding Team | 28/ago |
| 2 | Tomar decisão DR2 (autoria) | Founding Team | 28/ago |
| 3 | Tomar decisão DR3 (escopo exercícios) | Founding Team | 28/ago |
| 4 | Executar migration Prisma (13 modelos) | Engenharia | 31/ago |
| 5 | Seed data: 1 Curriculum + 1 CurriculumCourse + 1 CurriculumUnit | Engenharia | 31/ago |
| 6 | Identificar professor parceiro | Produto | 02/set |
| 7 | Identificar escola piloto | Produto | 02/set |
| 8 | Iniciar EPIC07-B (API CRUD conteúdos) | Engenharia | 10/set |

---

## 23. Guiding Principle

Todo este addendum é guiado por esta pergunta:

> **Como transformamos o Cur10usX de um School OS com Student Experience numa verdadeira Adaptive Learning Platform sem comprometer a fundação existente, o marco de 09/set/2026 e sem construir funcionalidades de aprendizagem que ainda não foram validadas?**

A resposta não é "adicionar Learning Paths, Lessons, Exercises, XP e Streak."

A resposta é:

> **Construir o menor loop possível que prove que estudantes querem exercitar online, validar com dados reais, e só depois escalar.**

O repositório já contém os modelos e APIs base. O que falta é: UI, conteúdo, e validação. Estas três coisas são o próximo passo — não mais modelos, não mais features, não mais abstração.

---

*Fim do Addendum 07 — Adaptive Learning Platform Alignment*
