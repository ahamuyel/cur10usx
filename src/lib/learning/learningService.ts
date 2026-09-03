import type { PrismaClient } from "@prisma/client"

export const MASTERY_THRESHOLDS: ReadonlyArray<{ min: number; label: string }> = [
  { min: 90, label: "Mastered" },
  { min: 70, label: "Proficient" },
  { min: 40, label: "Developing" },
  { min: 0, label: "Needs Practice" },
]

export function masteryCategory(score: number): string {
  for (const t of MASTERY_THRESHOLDS) {
    if (score >= t.min) return t.label
  }
  return "Needs Practice"
}

/**
 * Pure mastery v1: overall accuracy across all answered exercises of a topic.
 * Returns a 0-100 score, or null when there is no evidence yet.
 * Replaceable later (adaptive engine) without touching the call sites.
 */
export function computeMasteryScore(correct: number, total: number): number | null {
  if (total <= 0) return null
  return Math.round((correct / total) * 100)
}

type PrismaDb = PrismaClient

export interface StartLessonResult {
  status: "in_progress"
  startedAt: Date
}

export async function startLesson(db: PrismaDb, studentId: string, lessonId: string): Promise<StartLessonResult> {
  const progress = await db.studentLessonProgress.upsert({
    where: { studentId_lessonId: { studentId, lessonId } },
    update: {},
    create: { studentId, lessonId, status: "in_progress" },
  })
  return { status: progress.status as "in_progress", startedAt: progress.startedAt }
}

export interface AttemptOutcome {
  attemptId: string
  attempt: number
  answer: string
  isCorrect: boolean
  pointsEarned: number
  explanation: string | null
  /** Only populated when the answer is incorrect (secure feedback). */
  correctAnswer: string | null
  lessonId: string
  lessonCompleted: boolean
  mastery: { topic: string; score: number; category: string } | null
}

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase()
}

function isAnswerCorrect(type: string, studentAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(studentAnswer) === normalizeAnswer(correctAnswer)
}

/**
 * Records an attempt and closes the learning loop for the affected lesson:
 *  - persists the Answer (immutable, numbered attempt)
 *  - updates LessonProgress (in_progress -> completed when every exercise was attempted)
 *  - recomputes MasteryScore for the lesson's topic
 *  - advances / creates the LearningPath when the lesson completes
 */
export async function submitExerciseAttempt(
  db: PrismaDb,
  studentId: string,
  exerciseId: string,
  answer: string,
  timeSpentMs?: number
): Promise<AttemptOutcome> {
  const exercise = await db.exercise.findUnique({
    where: { id: exerciseId },
    include: {
      lesson: {
        include: {
          curriculumTopic: {
            include: {
              curriculumUnit: { include: { curriculumCourse: true } },
            },
          },
          exercises: { orderBy: { order: "asc" } },
        },
      },
    },
  })

  if (!exercise || !exercise.lesson.isPublished || !exercise.isPublished) {
    throw new Error("EXERCISE_UNAVAILABLE")
  }
  if (exercise.type === "listening" || exercise.type === "drag_and_drop" || exercise.type === "step_by_step") {
    throw new Error("EXERCISE_TYPE_UNSUPPORTED")
  }

  const lesson = exercise.lesson
  const topic = lesson.curriculumTopic
  const course = topic?.curriculumUnit?.curriculumCourse ?? null

  const isCorrect = isAnswerCorrect(exercise.type, answer, exercise.correctAnswer)

  const previous = await db.answer.findMany({
    where: { studentId, exerciseId },
    orderBy: { attempt: "desc" },
    take: 1,
  })
  const attempt = previous.length > 0 ? previous[0].attempt + 1 : 1
  const alreadyCorrect = previous.some((a) => a.isCorrect)
  const pointsEarned = isCorrect && !alreadyCorrect ? exercise.points : 0

  const created = await db.answer.create({
    data: {
      exerciseId,
      studentId,
      attempt,
      answer,
      isCorrect,
      pointsEarned,
      timeSpentMs,
    },
  })

  // Lesson progress: a lesson is completed when every exercise has been attempted
  const answeredCount = await db.answer.groupBy({
    by: ["exerciseId"],
    where: { studentId, lesson: { id: lesson.id } },
  })
  const allExercises = lesson.exercises.filter((e) => e.isPublished)
  const attemptedExerciseIds = new Set(answeredCount.map((a) => a.exerciseId))
  const allAttempted = allExercises.length > 0 && allExercises.every((e) => attemptedExerciseIds.has(e.id))
  const lessonCompleted = allAttempted

  const progress = await db.studentLessonProgress.upsert({
    where: { studentId_lessonId: { studentId, lessonId: lesson.id } },
    update: lessonCompleted ? { status: "completed", completedAt: new Date() } : {},
    create: {
      studentId,
      lessonId: lesson.id,
      status: lessonCompleted ? "completed" : "in_progress",
      completedAt: lessonCompleted ? new Date() : null,
    },
  })
  progress.status = lessonCompleted ? "completed" : "in_progress"

  // Mastery for the topic (canonical level) - resolve subject through the course mapping
  let mastery: AttemptOutcome["mastery"] = null
  const subjectId = course?.subjectId
  if (topic && subjectId) {
    const result = await recomputeTopicMastery(db, studentId, topic.id, subjectId)
    if (result) {
      mastery = { topic: topic.title, score: result.score, category: masteryCategory(result.score) }
    }
  }

  // Advance the LearningPath when a lesson completes
  if (lessonCompleted && course) {
    await advanceLearningPath(db, studentId, course.id)
  }

  return {
    attemptId: created.id,
    attempt: created.attempt,
    answer: created.answer,
    isCorrect,
    pointsEarned,
    explanation: exercise.explanation,
    correctAnswer: isCorrect ? null : exercise.correctAnswer,
    lessonId: lesson.id,
    lessonCompleted,
    mastery,
  }
}

/**
 * Idempotent mastery projection upsert per student + topic.
 * Scores are derived from the historically immutable attempts.
 */
export async function recomputeTopicMastery(
  db: PrismaDb,
  studentId: string,
  topicId: string,
  subjectId: string
): Promise<{ score: number; attempts: number } | null> {
  const answers = await db.answer.findMany({
    where: {
      studentId,
      exercise: { lesson: { curriculumTopicId: topicId } },
    },
    select: { isCorrect: true },
  })
  const total = answers.length
  const correct = answers.filter((a) => a.isCorrect).length
  const score = computeMasteryScore(correct, total)
  if (score === null) return null

  await db.masteryScore.upsert({
    where: { studentId_topicId: { studentId, topicId } },
    update: { score, attempts: total, calculatedAt: new Date() },
    create: { studentId, topicId, subjectId, score, attempts: total },
  })
  return { score, attempts: total }
}

/**
 * Creates (or keeps) the student's LearningPath record for a curriculum course
 * and marks it completed when every lesson of the course is completed.
 * Progress percentages are always derived, never stored.
 */
export async function advanceLearningPath(db: PrismaDb, studentId: string, curriculumCourseId: string): Promise<void> {
  const course = await db.curriculumCourse.findUnique({
    where: { id: curriculumCourseId },
    include: {
      units: {
        include: { topics: { include: { lessons: { where: { isPublished: true } } } } },
      },
    },
  })
  if (!course) return

  const allLessons = course.units.flatMap((u) => u.topics.flatMap((t) => t.lessons))
  const lessonIds = allLessons.map((l) => l.id)

  const completed = await db.studentLessonProgress.count({
    where: { studentId, lessonId: { in: lessonIds }, status: "completed" },
  })
  const allCompleted = allLessons.length > 0 && completed === allLessons.length

  const existing = await db.learningPath.findUnique({
    where: { studentId_curriculumCourseId: { studentId, curriculumCourseId } },
  })

  if (allCompleted) {
    await db.learningPath.upsert({
      where: { studentId_curriculumCourseId: { studentId, curriculumCourseId } },
      update: { status: "completed", completedAt: new Date() },
      create: { studentId, curriculumCourseId, status: "completed", completedAt: new Date() },
    })
  } else if (!existing) {
    await db.learningPath.create({
      data: { studentId, curriculumCourseId, status: "in_progress" },
    })
  }
}

/**
 * Derived projection of a student's progress across a curriculum course:
 * units -> topics -> lessons, each annotated with per-lesson progress state
 * and per-topic mastery. Used to drive "Continue Learning" and the Path UI.
 */
export async function getLearningPath(db: PrismaDb, studentId: string, curriculumCourseId: string) {
  const course = await db.curriculumCourse.findUnique({
    where: { id: curriculumCourseId },
    include: {
      subject: { select: { id: true, name: true } },
      units: {
        orderBy: { order: "asc" },
        include: {
          topics: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                where: { isPublished: true },
                orderBy: { order: "asc" },
                include: {
                  exercises: {
                    where: { isPublished: true },
                    orderBy: { order: "asc" },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  if (!course) return null

  const lessonIds = course.units.flatMap((u) => u.topics.flatMap((t) => t.lessons.map((l) => l.id)))
  const [progressRows, masteryRows] = await Promise.all([
    db.studentLessonProgress.findMany({
      where: { studentId, lessonId: { in: lessonIds } },
      select: { lessonId: true, status: true, completedAt: true },
    }),
    db.masteryScore.findMany({
      where: { studentId, topicId: { in: course.units.flatMap((u) => u.topics.map((t) => t.id)) } },
      select: { topicId: true, score: true },
    }),
  ])
  const progressByLesson = new Map(progressRows.map((p) => [p.lessonId, p]))
  const masteryByTopic = new Map(masteryRows.map((m) => [m.topicId, m]))

  const totalLessons = lessonIds.length
  const completedLessons = progressRows.filter((p) => p.status === "completed").length

  const units = course.units.map((unit) => ({
    id: unit.id,
    title: unit.title,
    description: unit.description,
    order: unit.order,
    topics: unit.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      order: topic.order,
      mastery: masteryByTopic.get(topic.id)?.score ?? null,
      masteryCategory: masteryByTopic.has(topic.id)
        ? masteryCategory(masteryByTopic.get(topic.id)!.score)
        : null,
      lessons: topic.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        contentType: lesson.contentType,
        order: lesson.order,
        progress: progressByLesson.get(lesson.id)?.status ?? "not_started",
        completedAt: progressByLesson.get(lesson.id)?.completedAt ?? null,
        exerciseCount: lesson.exercises.length,
      })),
    })),
  }))

  const firstIncomplete = (() => {
    for (const unit of units) {
      for (const topic of unit.topics) {
        for (const lesson of topic.lessons) {
          if (lesson.progress !== "completed") return lesson.id
        }
      }
    }
    return null
  })()

  return {
    id: course.id,
    name: course.name,
    grade: course.grade,
    subjectId: course.subjectId,
    subjectName: course.subject?.name ?? null,
    progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    completedLessons,
    totalLessons,
    continueLessonId: firstIncomplete,
    units,
  }
}
