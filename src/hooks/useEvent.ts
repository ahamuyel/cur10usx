"use client"

import { useEffect, useCallback, useRef } from "react"
import { events } from "@/lib/events"

type EventName = Parameters<typeof events.on>[0]
type EventPayload<E> = E extends EventName
  ? Parameters<Parameters<typeof events.on<E>>[1]>[0]
  : never

export function useEvent<E extends EventName>(
  event: E,
  callback: (payload: EventPayload<E>) => void,
) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    // Usamos um cast para 'any' apenas no callback do listener.
    // Como o 'events.on' está a ser chamado com o evento 'event' (tipo E), 
    // sabemos por contrato que o payload será do tipo EventPayload<E>.
    const unsub = events.on(event, (payload: any) => {
      cbRef.current(payload)
    })
    return unsub
  }, [event])
}

export function useEvents<E extends EventName>(
  eventNames: E[],
  callback: (payload: EventPayload<E>) => void,
) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    const unsubs = eventNames.map((name) =>
      events.on(name, (payload: any) => {
        cbRef.current(payload)
      }),
    )
    return () => unsubs.forEach((unsub) => unsub())
  }, [eventNames.join(",")])
}

export function useEmitter<E extends EventName>(event: E) {
  return useCallback(
    (payload: EventPayload<E>) => {
      events.emit(event, payload)
    },
    [event],
  )
}