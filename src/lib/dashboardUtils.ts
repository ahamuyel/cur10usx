export const getStatusPhrase = (data: any): string => {
  if (!data) return "";
  const trend = (data.generalAverage ?? 0) - (data.previousAverage ?? 0);
  const hasAbsenceIssues = (data.totalAbsences ?? 0) >= 5;
  const hasSubjectIssues = (data.subjectsNeedingAttention?.length ?? 0) > 0;

  if (hasAbsenceIssues && hasSubjectIssues)
    return `Tens ${data.totalAbsences} faltas e ${data.subjectsNeedingAttention.length} disciplina(s) com média crítica.`;
  if (hasAbsenceIssues)
    return `Tens ${data.totalAbsences} faltas este período.`;
  if (hasSubjectIssues)
    return `${data.subjectsNeedingAttention.join(", ")} precisam de atenção.`;
  
  if (data.totalAbsences === 0 && trend > 1.0 && data.generalAverage >= 14) 
    return "Presença perfeita e excelente evolução.";
  
  return "Desempenho estável. Foca-te nas próximas metas.";
};