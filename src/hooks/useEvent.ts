"use client"

import { useEffect, useCallback, useRef } from "react"
import { events } from "@/lib/events"

type EventName = Parameters<typeof events.on>[0]
type EventPayload<E> = E extends EventName
  ? Parameters<Parameters<typeof events.on<E>>[1]>[0]
  : never

/**
 * Subscribe to a domain event. Automatically cleans up on unmount.
 */
export function useEvent<E extends EventName>(
  event: E,
  callback: (payload: EventPayload<E>) => void,
) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    const unsub = events.on(event, ((payload: EventPayload<E>) => {
      cbRef.current(payload)
    }) as (payload: EventPayload<E>) => void)
    return unsub
  }, [event])
}

/**
 * Subscribe to multiple events with the same callback.
 */
export function useEvents<E extends EventName>(
  eventNames: E[],
  callback: (payload: EventPayload<E>) => void,
) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    const unsubs = eventNames.map((name) =>
      events.on(name, ((payload: EventPayload<E>) => {
        cbRef.current(payload)
      }) as (payload: EventPayload<E>) => void),
    )
    return () => unsubs.forEach((unsub) => unsub())
  }, [eventNames.join(",")])
}

/**
 * Returns a stable emitter function for a specific event type.
 */
export function useEmitter<E extends EventName>(event: E) {
  return useCallback(
    (payload: EventPayload<E>) => {
      events.emit(event, payload as any)
    },
    [event],
  )
}
