import { z } from "zod"

// Subject — exige referência ao catálogo global
export const createSubjectSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  globalSubjectId: z.string().min(1, "Referência ao catálogo global é obrigatória"),
})
export const updateSubjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
})

// Course — exige referência ao catálogo global
export const createCourseSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  globalCourseId: z.string().min(1, "Referência ao catálogo global é obrigatória"),
  subjectIds: z.array(z.string()).optional(),
})
export const updateCourseSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  subjectIds: z.array(z.string()).optional(),
})

// Class — academicYearId optional (API defaults to current year)
export const createClassSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(20, "Nome muito longo"),
  grade: z.number().int().min(1, "Classe deve ser entre 1 e 13").max(13, "Classe deve ser entre 1 e 13"),
  capacity: z.number().int().min(1, "Capacidade deve ser pelo menos 1").max(200, "Capacidade muito alta"),
  period: z.enum(["regular", "pos_laboral"]).optional(),
  courseId: z.string().optional().nullable(),
  supervisorId: z.string().optional().nullable(),
  academicYearId: z.string().optional().nullable(),
  globalClassId: z.string().optional().nullable(),
})
export const updateClassSchema = createClassSchema.partial()

// Lesson
export const createLessonSchema = z.object({
  day: z.string().min(1, "Dia é obrigatório"),
  startTime: z.string().min(1, "Hora de início é obrigatória"),
  endTime: z.string().min(1, "Hora de fim é obrigatória"),
  room: z.string().max(50, "Sala muito longa").optional().or(z.literal("")),
  subjectId: z.string().min(1, "Disciplina é obrigatória"),
  classId: z.string().min(1, "Turma é obrigatória"),
  teacherId: z.string().min(1, "Professor é obrigatório"),
  materials: z.array(z.object({
    title: z.string().min(1, "Título do material é obrigatório"),
    url: z.string().url("URL inválida"),
    type: z.string().optional(),
  })).optional().nullable(),
})
export const updateLessonSchema = createLessonSchema.partial()

// Lesson Attendance
export const createLessonAttendanceSchema = z.object({
  lessonId: z.string().min(1, "Aula é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
  classId: z.string().min(1, "Turma é obrigatória"),
  records: z.array(z.object({
    studentId: z.string().min(1),
    status: z.enum(["presente", "ausente", "atrasado"]),
  })).min(1, "É necessário pelo menos um registo"),
})

// Exam
export const createExamSchema = z.object({
  title: z.string().max(200, "Título muito longo").optional().or(z.literal("")),
  date: z.string().min(1, "Data é obrigatória"),
  subjectId: z.string().min(1, "Disciplina é obrigatória"),
  classId: z.string().min(1, "Turma é obrigatória"),
  teacherId: z.string().min(1, "Professor é obrigatório"),
})
export const updateExamSchema = createExamSchema.partial()

// Assignment
export const createAssignmentSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().optional().or(z.literal("")),
  dueDate: z.string().min(1, "Data de entrega é obrigatória"),
  maxScore: z.number().min(1).max(100).optional(),
  subjectId: z.string().min(1, "Disciplina é obrigatória"),
  classId: z.string().min(1, "Turma é obrigatória"),
  teacherId: z.string().min(1, "Professor é obrigatório"),
})
export const updateAssignmentSchema = createAssignmentSchema.partial()

// Submission
export const createSubmissionSchema = z.object({
  content: z.string().optional().or(z.literal("")),
  attachmentUrl: z.string().url("URL inválida").optional().or(z.literal("")),
})

// Evaluate Submission
export const evaluateSubmissionSchema = z.object({
  score: z.number().min(0, "Nota deve ser >= 0").max(20, "Nota deve ser <= 20"),
  feedback: z.string().optional().or(z.literal("")),
})

// Result
export const createResultSchema = z.object({
  score: z.number().min(0, "Nota deve ser >= 0").max(20, "Nota deve ser <= 20"),
  type: z.string().min(1, "Tipo é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  studentId: z.string().min(1, "Aluno é obrigatório"),
  subjectId: z.string().min(1, "Disciplina é obrigatória"),
  examId: z.string().optional().nullable(),
  assignmentId: z.string().optional().nullable(),
  trimester: z.enum(["primeiro", "segundo", "terceiro"]).optional().nullable(),
  academicYear: z.string().optional().nullable(),
})
export const updateResultSchema = createResultSchema.partial()

// Attendance
export const createAttendanceSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  classId: z.string().min(1, "Turma é obrigatória"),
  lessonId: z.string().optional().nullable(),
  records: z.array(z.object({
    studentId: z.string().min(1),
    status: z.enum(["presente", "ausente", "atrasado"]),
  })).min(1, "É necessário pelo menos um registo"),
})
export const updateAttendanceStatusSchema = z.object({
  status: z.enum(["presente", "ausente", "atrasado"]),
})

// Message
export const createMessageSchema = z.object({
  subject: z.string().min(1, "Assunto é obrigatório").max(200, "Assunto muito longo"),
  body: z.string().min(1, "Mensagem é obrigatória"),
  toId: z.string().optional().nullable(),
  toAll: z.boolean().optional(),
})
export const updateMessageSchema = z.object({
  read: z.boolean(),
})

// Announcement
export const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  priority: z.enum(["informativo", "importante", "urgente"]).optional(),
  classId: z.string().optional().nullable(),
  courseId: z.string().optional().nullable(),
  targetUserId: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
})
export const updateAnnouncementSchema = createAnnouncementSchema.partial()

// ─── Learning Engine Schemas ──────────────────────────────────────

// Curriculum
export const createCurriculumSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(200),
  country: z.string().min(2).max(5).optional(),
  version: z.string().min(1, "Versão é obrigatória").max(20),
})
export const updateCurriculumSchema = createCurriculumSchema.partial()

// CurriculumCourse
export const createCurriculumCourseSchema = z.object({
  curriculumId: z.string().min(1, "Currículo é obrigatório"),
  name: z.string().min(2).max(200),
  grade: z.number().int().min(1).max(13),
  cycleLevel: z.enum(["primario", "primeiro_ciclo", "segundo_ciclo"]),
})
export const updateCurriculumCourseSchema = createCurriculumCourseSchema.partial().omit({ curriculumId: true })

// CurriculumUnit
export const createCurriculumUnitSchema = z.object({
  curriculumCourseId: z.string().min(1, "Curso curricular é obrigatório"),
  title: z.string().min(2).max(200),
  description: z.string().optional().or(z.literal("")),
  order: z.number().int().min(1),
  weight: z.number().min(0).max(10).optional(),
})
export const updateCurriculumUnitSchema = createCurriculumUnitSchema.partial().omit({ curriculumCourseId: true })

// CurriculumTopic
export const createCurriculumTopicSchema = z.object({
  curriculumUnitId: z.string().min(1, "Unidade curricular é obrigatória"),
  title: z.string().min(2).max(200),
  description: z.string().optional().or(z.literal("")),
  order: z.number().int().min(1),
})
export const updateCurriculumTopicSchema = createCurriculumTopicSchema.partial().omit({ curriculumUnitId: true })

// Lesson (educational content)
export const createLearningLessonSchema = z.object({
  curriculumTopicId: z.string().min(1, "Tópico curricular é obrigatório"),
  title: z.string().min(2).max(200),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  contentType: z.enum(["teorico", "pratico", "video", "misto"]).optional(),
  estimatedMinutes: z.number().int().min(1).max(240).optional().nullable(),
  order: z.number().int().min(1),
  isPublished: z.boolean().optional(),
})
export const updateLearningLessonSchema = createLearningLessonSchema.partial().omit({ curriculumTopicId: true })

// Exercise
export const createExerciseSchema = z.object({
  lessonId: z.string().min(1, "Lição é obrigatória"),
  type: z.enum(["multiple_choice", "fill_in", "step_by_step", "true_false", "drag_and_drop", "short_answer", "listening"]),
  question: z.string().min(1, "Pergunta é obrigatória"),
  options: z.array(z.object({ key: z.string(), text: z.string() })).optional().nullable(),
  correctAnswer: z.string().min(1, "Resposta correta é obrigatória"),
  explanation: z.string().optional().or(z.literal("")),
  points: z.number().int().min(1).max(100).optional(),
  difficulty: z.number().int().min(1).max(3).optional(),
  order: z.number().int().min(1),
  isPublished: z.boolean().optional(),
})
export const updateExerciseSchema = createExerciseSchema.partial().omit({ lessonId: true })

// Submit Answer
export const submitAnswerSchema = z.object({
  answer: z.string().min(1, "Resposta é obrigatória"),
  timeSpentMs: z.number().int().min(0).optional(),
})

// LessonContent (auxiliary content)
export const createLessonContentSchema = z.object({
  lessonId: z.string().min(1, "Lição é obrigatória"),
  title: z.string().min(1).max(200),
  url: z.string().url("URL inválida").optional().or(z.literal("")),
  type: z.string().min(1, "Tipo é obrigatório"),
  order: z.number().int().min(1),
})
