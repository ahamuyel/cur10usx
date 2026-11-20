/**
 * Rotas que não exigem sessão autenticada.
 *
 * Partilhar esta lista entre o middleware e os testes evita que novas páginas
 * públicas (por exemplo, as da landing) fiquem acidentalmente protegidas.
 */
export const authPages = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/registar-escola",
] as const

export const alwaysAccessible = [
  "/reset-password",
  "/verify-email",
  "/signin/verify-2fa",
  "/accept-invite",
] as const

export const publicPaths = [
  "/",
  "/aplicacao",
  "/aplicacao/status",
  "/maintenance",
  "/termos",
  "/privacidade",
  "/para-escolas",
  "/para-estudantes",
  "/sobre",
] as const

/** Rotas públicas com segmentos dinâmicos. */
export const publicPathPrefixes = [
  "/verificar-documento/",
] as const

export function isAlwaysAccessible(pathname: string): boolean {
  return (alwaysAccessible as readonly string[]).some((path) =>
    pathname.startsWith(path)
  )
}

export function isPublicPath(pathname: string): boolean {
  return (
    (publicPaths as readonly string[]).includes(pathname) ||
    publicPathPrefixes.some((prefix) => pathname.startsWith(prefix))
  )
}
