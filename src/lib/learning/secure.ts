type ExerciseLike = {
  correctAnswer?: string | null
  [key: string]: unknown
}

type LessonLike = {
  exercises?: ExerciseLike[] | null
  [key: string]: unknown
}

/**
 * Removes the correctAnswer from an exercise so it is never sent to a student
 * before they submit. Options (texts) are kept for multiple choice rendering.
 */
export function stripExercise(exercise: ExerciseLike): ExerciseLike {
  const { correctAnswer, ...rest } = exercise
  void correctAnswer
  return rest
}

/**
 * Strips correctAnswer from every exercise in a lesson (or a list of lessons).
 */
export function stripLesson(lesson: LessonLike): LessonLike {
  if (!lesson.exercises) return lesson
  return { ...lesson, exercises: lesson.exercises.map(stripExercise) }
}

export function stripLessons<T extends LessonLike>(lessons: T[]): T[] {
  return lessons.map((l) => stripLesson(l) as T)
}

/**
 * Removes correctAnswer from a raw list of exercises.
 */
export function stripExercises<T extends ExerciseLike>(exercises: T[]): T[] {
  return exercises.map((e) => stripExercise(e) as T)
}
