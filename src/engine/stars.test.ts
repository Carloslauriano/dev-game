import { describe, expect, it } from 'vitest'
import { computeStars, mergeStars } from './stars'
import type { Challenge, ExecutionResult } from './types'

const desafio: Challenge = {
  id: 'x', width: 3, height: 1, start: { x: 0, y: 0, facing: 'east' },
  goal: { x: 2, y: 0 }, walls: [], obstacles: [], items: [],
}
const resolvido: ExecutionResult = { status: 'solved', actions: ['move', 'move'] }
const falhou: ExecutionResult = { status: 'failed', actions: [], reason: 'bateu' }

describe('computeStars e Dica', () => {
  it('resolver sem pedir Dica ganha a Estrela de sem Dica', () => {
    expect(computeStars(desafio, resolvido, 'move(); move();', false)).toEqual(['solved', 'noHint'])
  })

  it('pedir Dica remove a Estrela de sem Dica', () => {
    expect(computeStars(desafio, resolvido, 'move(); move();', true)).toEqual(['solved'])
  })

  it('falhar não dá Estrelas, com ou sem Dica', () => {
    expect(computeStars(desafio, falhou, '', false)).toEqual([])
  })
})

describe('contagem de instruções em Portugol', () => {
  it('conta Ações em português e ignora comentários', () => {
    const limitado = { ...desafio, maxInstructions: 2 }
    expect(computeStars(limitado, resolvido, 'andar()\nandar() // pegar()', false)).toContain('fewInstructions')
    expect(computeStars(limitado, resolvido, 'andar()\nandar()\nvirarEsquerda()', false)).not.toContain('fewInstructions')
  })
})

describe('mergeStars', () => {
  it('refazer com resultado pior não remove Estrelas já ganhas', () => {
    expect(mergeStars(['solved', 'fewInstructions'], ['solved'])).toEqual(['solved', 'fewInstructions'])
    expect(mergeStars(['solved'], [])).toEqual(['solved'])
  })

  it('refazer com resultado melhor acrescenta Estrelas', () => {
    expect(mergeStars(['solved'], ['solved', 'fewInstructions'])).toEqual(['solved', 'fewInstructions'])
  })
})
