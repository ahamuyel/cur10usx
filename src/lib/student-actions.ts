export type StudentActionResult = {
  ok: boolean
  error?: string
}

export async function deleteStudentById(
  studentId: string,
  fetcher: typeof fetch = fetch
): Promise<StudentActionResult> {
  const id = studentId.trim()
  if (!id) {
    return { ok: false, error: "ID do aluno inválido" }
  }

  try {
    const res = await fetcher(`/api/students/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    if (res.ok) {
      return { ok: true }
    }
    const data = await res.json().catch(() => ({}))
    return { ok: false, error: data.error || "Erro ao eliminar aluno" }
  } catch {
    return { ok: false, error: "Erro de conexão" }
  }
}
