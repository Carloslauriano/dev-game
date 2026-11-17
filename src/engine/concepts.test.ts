import { describe, expect, it } from 'vitest'
import { solvedCount, isConceptUnlocked, unlockedFlags, UNLOCK_THRESHOLD, offersBlocks, type Concept } from './concepts'

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

describe('offersBlocks', () => {
  const lista: Concept[] = [
    { id: 'a', challengeIds: ['a-1'] },
    { id: 'b', challengeIds: ['b-1'], typedCodeOnly: true },
    { id: 'c', challengeIds: ['c-1'] },
  ]

  it('oferece Blocos antes do primeiro Conceito só de código', () => {
    expect(offersBlocks(lista, 'a-1')).toBe(true)
  })

  it('não oferece Blocos a partir dele, inclusive nos Conceitos seguintes', () => {
    expect(offersBlocks(lista, 'b-1')).toBe(false)
    expect(offersBlocks(lista, 'c-1')).toBe(false)
  })

  it('Desafio desconhecido mantém Blocos', () => {
    expect(offersBlocks(lista, 'x')).toBe(true)
  })
})
