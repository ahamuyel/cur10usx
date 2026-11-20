"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type CacheEntry<T> = {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()
const pendingFetches = new Map<string, Promise<unknown>>()
const TTL = 30000 // 30s default

/**
 * Hook de data fetching com cache em memória e revalidação por eventos.
 *
 * - Evita re-fetches desnecessários se os dados ainda são recentes.
 * - Permite invalidação manual por cache key.
 * - Mantém estado, scroll e filtros.
 */
export function useDataFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttl?: number; enabled?: boolean },
) {
  const { ttl = TTL, enabled = true } = options ?? {}
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const mountedRef = useRef(true)
  const keyRef = useRef(key)
  keyRef.current = key

  const fetchData = useCallback(async () => {
    const cached = cache.get(keyRef.current) as CacheEntry<T> | undefined
    if (cached && Date.now() - cached.timestamp < ttl) {
      setData(cached.data)
      setLoading(false)
      return cached.data
    }

    if (pendingFetches.has(keyRef.current)) {
      const result = await pendingFetches.get(keyRef.current)!
      if (mountedRef.current) {
        setData(result as T)
        setLoading(false)
      }
      return result as T
    }

    const promise = fetcher()
      .then((result) => {
        cache.set(keyRef.current, { data: result, timestamp: Date.now() })
        pendingFetches.delete(keyRef.current)
        return result
      })
      .catch((err: Error) => {
        pendingFetches.delete(keyRef.current)
        throw err
      })

    pendingFetches.set(keyRef.current, promise)

    try {
      const result = await promise
      if (mountedRef.current) {
        setData(result as T)
        setLoading(false)
        setError("")
      }
      return result
    } catch {
      if (mountedRef.current) {
        if (!data) {
          setError("Erro ao carregar dados")
        }
        setLoading(false)
      }
      return null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    if (!enabled) return
    mountedRef.current = true
    fetchData()
    return () => {
      mountedRef.current = false
    }
  }, [fetchData, enabled])

  const invalidate = useCallback(() => {
    cache.delete(keyRef.current)
    return fetchData()
  }, [fetchData])

  const mutate = useCallback(
    async (updater: (prev: T) => T) => {
      const cached = cache.get(keyRef.current) as CacheEntry<T> | undefined
      if (cached) {
        const updated = updater(cached.data)
        cache.set(keyRef.current, { data: updated, timestamp: Date.now() })
        setData(updated)
      }
    },
    [],
  )

  return { data, loading, error, invalidate, mutate, refetch: fetchData }
}

/**
 * Invalida uma cache key globalmente (útil em event handlers).
 */
export function invalidateCache(key: string) {
  cache.delete(key)
}
