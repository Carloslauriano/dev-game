import { describe, expect, it } from 'vitest'
import { solvedCount, isConceptUnlocked, unlockedFlags, UNLOCK_THRESHOLD, type Concept } from './concepts'

const mk = (id: string): Concept => ({ id, challengeIds: [1, 2, 3, 4, 5].map((n) => `${id}-${n}`) })
const concepts = [mk('a'), mk('b'), mk('c')]
const solvedSet = (...ids: string[]) => (id: string) => ids.includes(id)

describe('Conceitos', () => {
  it('abre o seguinte com 3 de 5 Desafios resolvidos', () => {
    expect(UNLOCK_THRESHOLD).toBe(3)
    expect(isConceptUnlocked(concepts, 1, solvedSet('a-1', 'a-2'))).toBe(false)
    expect(isConceptUnlocked(concepts, 1, solvedSet('a-1', 'a-3', 'a-5'))).toBe(true)
  })
  it('o primeiro Conceito está sempre aberto', () => {
    expect(isConceptUnlocked(concepts, 0, solvedSet())).toBe(true)
  })
  it('só conta Desafios do Conceito anterior', () => {
    expect(solvedCount(concepts[0], solvedSet('b-1', 'b-2', 'b-3', 'a-1'))).toBe(1)
    expect(isConceptUnlocked(concepts, 1, solvedSet('b-1', 'b-2', 'b-3'))).toBe(false)
  })
  it('um Conceito fechado não abre o seguinte, mesmo com Desafios resolvidos', () => {
    expect(isConceptUnlocked(concepts, 2, solvedSet('b-1', 'b-2', 'b-3'))).toBe(false)
  })
  it('lista quais Conceitos estão abertos', () => {
    expect(unlockedFlags(concepts, solvedSet('a-1', 'a-2', 'a-3'))).toEqual([true, true, false])
  })
  it('índice inexistente está fechado', () => {
    expect(isConceptUnlocked(concepts, 7, solvedSet())).toBe(false)
  })
})
