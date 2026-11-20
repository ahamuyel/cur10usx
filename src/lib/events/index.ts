/**
 * Event Bus — Camada de eventos do domínio Cur10usX.
 *
 * Permite que componentes reajam a mutações sem polling ou refresh forçado.
 * Integra-se com o WebSocket existente para eventos entre utilizadores.
 */

type EventMap = {
  "student:created": { studentId: string }
  "student:updated": { studentId: string }
  "student:deleted": { studentId: string }

  "teacher:created": { teacherId: string }
  "teacher:updated": { teacherId: string }
  "teacher:deleted": { teacherId: string }

  "class:created": { classId: string }
  "class:updated": { classId: string }
  "class:deleted": { classId: string }

  "lesson:created": { lessonId: string }
  "lesson:updated": { lessonId: string }
  "lesson:deleted": { lessonId: string }

  "exam:created": { examId: string }
  "exam:updated": { examId: string }
  "exam:deleted": { examId: string }

  "assignment:created": { assignmentId: string }
  "assignment:updated": { assignmentId: string }
  "assignment:deleted": { assignmentId: string }

  "result:created": { resultId: string; studentId: string; subjectId: string }
  "result:updated": { resultId: string; studentId: string; subjectId: string }

  "attendance:created": { attendanceId: string; studentId: string }

  "submission:created": { submissionId: string; assignmentId: string; studentId: string }
  "submission:updated": { submissionId: string; assignmentId: string; studentId: string }

  "enrollment:created": { enrollmentId: string; studentId: string; classId: string }
  "enrollment:updated": { enrollmentId: string; studentId: string }

  "application:created": { applicationId: string }
  "application:approved": { applicationId: string }

  "parent:created": { parentId: string }
  "parent:updated": { parentId: string }
  "parent:deleted": { parentId: string }

  "course:created": { courseId: string }
  "course:updated": { courseId: string }
  "course:deleted": { courseId: string }

  "subject:created": { subjectId: string }
  "subject:updated": { subjectId: string }
  "subject:deleted": { subjectId: string }

  "announcement:created": { announcementId: string }
  "announcement:updated": { announcementId: string }
  "announcement:deleted": { announcementId: string }

  "message:created": { messageId: string }

  "notification:new": { notificationId: string }

  "admin:created": { adminId: string }
  "admin:updated": { adminId: string }
  "admin:deleted": { adminId: string }

  "support:created": { ticketId: string }
  "support:updated": { ticketId: string }

  "school:updated": { schoolId: string }

  "branding:changed": { schoolId: string }

  "session:updated": unknown
}

type EventName = keyof EventMap
type EventCallback<E extends EventName> = (payload: EventMap[E]) => void

const listeners = new Map<string, Set<(...args: unknown[]) => void>>()

function getKey<E extends EventName>(event: E, namespace?: string): string {
  return namespace ? `${namespace}:${event}` : event
}

export const events = {
  on<E extends EventName>(
    event: E,
    callback: EventCallback<E>,
    namespace?: string,
  ): () => void {
    const key = getKey(event, namespace)
    if (!listeners.has(key)) {
      listeners.set(key, new Set())
    }
    listeners.get(key)!.add(callback as (...args: unknown[]) => void)
    return () => {
      listeners.get(key)?.delete(callback as (...args: unknown[]) => void)
    }
  },

  emit<E extends EventName>(event: E, payload: EventMap[E], namespace?: string): void {
    const key = getKey(event, namespace)
    listeners.get(key)?.forEach((cb) => {
      try {
        cb(payload)
      } catch {
        // Silently handle listener errors
      }
    })
  },

  off<E extends EventName>(
    event: E,
    callback: EventCallback<E>,
    namespace?: string,
  ): void {
    const key = getKey(event, namespace)
    listeners.get(key)?.delete(callback as (...args: unknown[]) => void)
  },

  clear(event?: string, namespace?: string): void {
    if (event) {
      const key = namespace ? `${namespace}:${event}` : event
      listeners.delete(key)
    } else {
      listeners.clear()
    }
  },
}
