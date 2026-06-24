import { useState, useEffect } from 'react';

export function useStudentDashboard(studentId: string) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/students/${studentId}/dashboard`);
        if (!res.ok) throw new Error("Dados indisponíveis");
        const json = await res.json();
        setData(json);
      } catch {
        setError("Não foi possível carregar o ecossistema do estudante.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  return { data, loading, error };
}