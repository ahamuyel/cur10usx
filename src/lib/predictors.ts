export type PredictionType =
  | "reprovacao"
  | "abandono"
  | "absentismo"
  | "queda_desempenho"

export type PredictionSeverity = "low" | "medium" | "high" | "critical"

export interface PredictionInput {
  studentId: string
  schoolId: string
  academicYearId?: string
}

export interface PredictionResult {
  type: PredictionType
  studentId: string
  probability: number
  severity: PredictionSeverity
  factors: string[]
  generatedAt: Date
}

export interface Predictor {
  type: PredictionType
  name: string
  description: string
  predict(input: PredictionInput): Promise<PredictionResult | null>
}

export class PredictorRegistry {
  private predictors: Map<PredictionType, Predictor> = new Map()

  register(predictor: Predictor): void {
    this.predictors.set(predictor.type, predictor)
  }

  get(type: PredictionType): Predictor | undefined {
    return this.predictors.get(type)
  }

  getAll(): Predictor[] {
    return Array.from(this.predictors.values())
  }

  async predictAll(input: PredictionInput): Promise<PredictionResult[]> {
    const results: PredictionResult[] = []
    for (const predictor of this.predictors.values()) {
      const result = await predictor.predict(input)
      if (result) results.push(result)
    }
    return results
  }
}

export const predictorRegistry = new PredictorRegistry()
