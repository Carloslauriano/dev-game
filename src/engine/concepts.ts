/** Conceito: grupo de Desafios (por id) que ensina uma ideia de lógica. Dados puros. */
export type Concept = { id: string; challengeIds: string[] }

/** Desafios resolvidos do Conceito anterior que abrem o seguinte. */
export const UNLOCK_THRESHOLD = 3

export type IsSolved = (challengeId: string) => boolean

export function solvedCount(concept: Concept, isSolved: IsSolved): number {
  return concept.challengeIds.filter(isSolved).length
}

/** O primeiro Conceito é sempre aberto; os demais exigem o anterior aberto e com 3 resolvidos. */
export function isConceptUnlocked(concepts: Concept[], index: number, isSolved: IsSolved): boolean {
  if (index < 0 || index >= concepts.length) return false
  if (index === 0) return true
  return (
    isConceptUnlocked(concepts, index - 1, isSolved) &&
    solvedCount(concepts[index - 1], isSolved) >= UNLOCK_THRESHOLD
  )
}

export function unlockedFlags(concepts: Concept[], isSolved: IsSolved): boolean[] {
  return concepts.map((_, i) => isConceptUnlocked(concepts, i, isSolved))
}
