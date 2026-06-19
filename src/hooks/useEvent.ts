"use client"

import { useEffect, useCallback, useRef } from "react"
import { events } from "@/lib/events"

/**
 * Tipo base dos eventos suportados pelo sistema.
 * Deriva diretamente da assinatura do events.on
 */
type EventName = Parameters<typeof events.on>[0]

/**
 * Payload genérico por evento.
 * Mantém compatibilidade com o tipo interno do events system.
 */
type EventMap = Record<EventName, any>

type EventPayload<E extends EventName> = EventMap[E]

/**
 * Hook para ouvir um único evento
 */
export function useEvent<E extends EventName>(
  event: E,
  callback: (payload: EventPayload<E>) => void,
) {
  const cbRef = useRef(callback)

  // mantém referência sempre atualizada sem recriar listener
  useEffect(() => {
    cbRef.current = callback
  }, [callback])

  useEffect(() => {
    const unsub = events.on(event, (payload) => {
      cbRef.current(payload)
    })

    return () => {
      unsub?.()
    }
  }, [event])
}

/**
 * Hook para ouvir múltiplos eventos
 */
export function useEvents<E extends EventName>(
  eventNames: E[],
  callback: (payload: EventPayload<E>) => void,
) {
  const cbRef = useRef(callback)

  useEffect(() => {
    cbRef.current = callback
  }, [callback])

  useEffect(() => {
    const unsubs = eventNames.map((name) =>
      events.on(name, (payload) => {
        cbRef.current(payload)
      }),
    )

    return () => {
      unsubs.forEach((unsub) => unsub?.())
    }
  }, [eventNames])
}

/**
 * Hook para emitir eventos tipados
 */
export function useEmitter<E extends EventName>(event: E) {
  return useCallback(
    (payload: EventPayload<E>) => {
      events.emit(event, payload)
    },
    [event],
  )
}