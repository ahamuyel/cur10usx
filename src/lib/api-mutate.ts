/**
 * API Mutation Helper
 *
 * Wrapper para mutações da API que emite eventos do domínio automaticamente.
 * Substitui o padrão `fetch().then(() => refetch())`.
 */

import { events } from "@/lib/events"

type MutationOptions = {
  method?: string
  body?: unknown
  headers?: Record<string, string>
}

type EventConfig = {
  event: Parameters<typeof events.emit>[0]
  payload: Record<string, unknown>
}

/**
 * Executa uma mutação na API e emite evento de domínio automaticamente.
 *
 * Uso:
 *   await apiMutate("/api/students", { body: {...} }, { event: "student:created", payload: { studentId } })
 */
export async function apiMutate<T = Record<string, unknown>>(
  url: string,
  options: MutationOptions = {},
  eventConfig?: EventConfig,
): Promise<T> {
  const { method = "POST", body, headers = {} } = options

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro na operação" }))
    throw new Error(err.error || `Erro ${res.status}`)
  }

  const result = (await res.json().catch(() => ({}))) as T

  if (eventConfig) {
    events.emit(
      eventConfig.event as Parameters<typeof events.emit>[0],
      eventConfig.payload as never,
    )
  }

  return result
}

/**
 * Atalhos para métodos HTTP comuns.
 */
export const api = {
  get: <T>(url: string) =>
    fetch(url).then((r) => {
      if (!r.ok) throw new Error("Erro na requisição")
      return r.json() as Promise<T>
    }),

  post: <T>(url: string, body?: unknown, eventConfig?: EventConfig) =>
    apiMutate<T>(url, { method: "POST", body }, eventConfig),

  put: <T>(url: string, body?: unknown, eventConfig?: EventConfig) =>
    apiMutate<T>(url, { method: "PUT", body }, eventConfig),

  patch: <T>(url: string, body?: unknown, eventConfig?: EventConfig) =>
    apiMutate<T>(url, { method: "PATCH", body }, eventConfig),

  delete: <T>(url: string, eventConfig?: EventConfig) =>
    apiMutate<T>(url, { method: "DELETE" }, eventConfig),
}
