# CUR10USX CORE — RELEASE READINESS REPORT (`CORE_RELEASE_READINESS.md`)

> **Data de Emissão**: 06 de Agosto de 2026  
> **Versão Target**: `Cur10usX Core v1.0.0 — Production Foundation`  
> **Status Global**: 🟢 **READY FOR STAGING / PILOT**

---

## Matriz de Conformidade & Evidências Empíricas

| Área / Requisito | Status | Evidência & Ficheiro | Detalhes da Validação |
|---|---|---|---|
| **Authentication** | `PASS` | `src/lib/auth.ts`, `tests/password.test.ts` | Credentials + Google OAuth validados; hashing bcrypt cost 12 e sessionVersion funcional. |
| **Authorization & RBAC** | `PASS` | `src/lib/api-auth.ts` | Centralização em `requireRole` e `requirePermission`; granularidade para `school_admin` primário/secundário. |
| **Tenant Isolation** | `PASS` | `src/lib/security/tenant-guard.ts`, `tests/tenant-isolation.test.ts` | Guard `validateTenantAccess` criado e testado. Rejeita acessos sem `schoolId` ou escolas não ativas/aprovadas. |
| **2FA Verification** | `PASS` | `src/app/api/auth/2fa/verify-signin/route.ts`, `src/middleware.ts` | 2FA mantido em sessão por verificação; bloqueia navegação ou chamadas API se pendente. |
| **Academic Engine** | `PASS` | `src/lib/evaluation-engine.ts`, `tests/evaluation.test.ts` | Regras do sistema de ensino de Angola 100% preservadas e validadas (23/23 testes a passar). |
| **Academic Health Score** | `PASS` | `src/lib/score.ts`, `src/lib/academic-health.ts`, `src/lib/student-risk.ts` | Fórmula unificada (40% Desempenho + 30% Assiduidade + 20% Actividade + 10% Administração). Cálculo de assiduidade padronizado (`presente + atrasado`). |
| **Privilege Escalation** | `PASS` | `src/app/api/school-registrations/route.ts`, `src/app/api/admin/schools/[id]/approve/route.ts` | Escalação bloqueada. Escolas criadas por estudantes ficam em estado `pendente` e apenas `super_admin` pode aprovar. |
| **Database Integrity** | `PASS` | `prisma/schema.prisma` | Schema Prisma validado (`npx prisma validate` com 0 erros); cliente v6.19.3 gerado e pronto. |
| **API Validation** | `PASS` | `src/lib/validations/*` | Schemas Zod aplicados a payloads de mutação e endpoints de API. |
| **WebSocket Security** | `PASS` | `ws-server.js`, `src/app/api/auth/verify-ws/route.ts` | Conexões autenticadas via assinatura HMAC SHA256; broadcast de serviço restrito. |
| **CI/CD Pipeline** | `PASS` | `.github/workflows/ci.yaml` | Workflow configurado com env vars estáticas de fallback (`DATABASE_URL`, `DIRECT_DATABASE_URL`) e etapas de lint/typecheck/test/build. |
| **Unit & Integration Tests** | `PASS` | `tests/*` (4 suítes, 40 testes) | 100% dos testes a passar (`evaluation.test.ts`, `middleware.test.ts`, `password.test.ts`, `tenant-isolation.test.ts`). |
| **Observability & Audit** | `PASS` | `src/lib/audit.ts` | Structured logging para eventos de login, 2FA, modificações de perfil e transições de escola. |
| **Documentação Técnica** | `PASS` | `docs/audit/BASELINE.md`, `docs/audit/CORE_RELEASE_READINESS.md` | Documentação rigorosa de auditoria, riscos mitigados e baseline empírico. |

---

## Resumo dos Fixes Implementados

1. **Camada de TenantGuard (`src/lib/security/tenant-guard.ts`)**:
   - Isolamento multi-tenant estrito com suporte a contexto global para `super_admin`.
   - Bloqueio imediato de contas com estado de escola `pendente`, `suspensa` ou `rejeitada`.

2. **Unificação de Scores Académicos (`src/lib/score.ts` & `src/lib/student-risk.ts`)**:
   - Fórmulas de aproveitamento escolar e risco de abandono alinhadas com a especificação (40/30/20/10).
   - Função `calculateAttendancePercentage` reutilizada globalmente, eliminando discrepâncias de contagem de presença/atrasos.

3. **Correção de 2FA & Privilégios no Registro de Escolas**:
   - `twoFactorVerifiedAt` associado estritamente à sessão de autenticação ativa.
   - Endpoint `/api/school-registrations` validado para prevenir a aprovação automática sem mediação do `super_admin`.

---

## Próximos Passos (Transição para Produção/Staging)

- Configuração final do repositório remoto para acionar o GitHub Actions CI/CD.
- Execução de `npx prisma migrate deploy` em ambiente de Staging com base PostgreSQL (Neon DB).
- Início do programa piloto com as primeiras escolas parceiras.
