import { describe, expect, it } from 'vitest'
import { offersBlocks } from './editorMode'
import { conceito5 } from '../challenges/conceito5'

describe('migração dos Blocos visuais para o código digitado', () => {
  it('Blocos continuam disponíveis nos Conceitos 1 a 4', () => {
    for (const id of ['sequencia-1', 'repeticao-3', 'condicao-2', 'repeticao-condicao-5']) {
      expect(offersBlocks(id)).toBe(true)
    }
  })

  it('os Desafios do Conceito 5 só oferecem código digitado', () => {
    for (const c of conceito5) expect(offersBlocks(c.id)).toBe(false)
  })

  it('um Desafio fora dos Conceitos mantém Blocos', () => {
    expect(offersBlocks('desconhecido')).toBe(true)
  })
})
