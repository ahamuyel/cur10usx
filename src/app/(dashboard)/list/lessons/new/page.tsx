import LessonCreateForm from "@/components/forms/LessonCreateForm"

const CreateLessonPage = () => {
  return (
    <div className="m-2 sm:m-3 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Nova Aula</h1>
        <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
          Preencha os passos abaixo para criar uma nova aula. Cada campo filtra automaticamente as opções seguintes.
        </p>
      </div>
      <LessonCreateForm />
    </div>
  )
}

export default CreateLessonPage
