import { describe, expect, it } from 'vitest'
import { inProcessWorker } from '../engine/inProcessWorker'
import { runChallenge } from '../engine/runChallenge'
import { concepts, playableChallenges } from './concepts'
import { condicaoChallenges } from './conceito3'
import { condicaoSolutions } from './conceito3.solutions'
import type { Language } from '../engine/types'

const languages: Language[] = ['javascript', 'python', 'portugol']

describe('Conceito 3 (condição): Desafios', () => {
  it('tem 5 Desafios registrados no Conceito, com dica e limite de instruções', () => {
    const concept = concepts.find((c) => c.id === 'condicao')!
    expect(condicaoChallenges.map((c) => c.id)).toEqual(concept.challengeIds)
    for (const c of condicaoChallenges) {
      expect(playableChallenges[c.id]).toBe(c)
      expect(c.maxInstructions).toBeGreaterThan(0)
      expect(c.hint).toBeTruthy()
    }
  })

  for (const challenge of condicaoChallenges) {
    for (const language of languages) {
      it(`${challenge.id}: solução de referência em ${language} é resolvida`, async () => {
        const code = condicaoSolutions[challenge.id][language]
        const result = await runChallenge(challenge, language, code, inProcessWorker)
        expect(result.reason).toBeUndefined()
        expect(result.status).toBe('solved')
        expect(result.stars).toContain('fewInstructions')
      }, 70_000)
    }
  }
})
