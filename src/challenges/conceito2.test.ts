import { describe, expect, it } from 'vitest'
import { runChallenge } from '../engine/runChallenge'
import { inProcessWorker } from '../engine/inProcessWorker'
import { countInstructions } from '../engine/stars'
import type { Language } from '../engine/types'
import { concepts, playableChallenges } from './concepts'
import { conceito2Challenges, conceito2Solutions } from './conceito2'

const languages: Language[] = ['javascript', 'python', 'portugol']

describe('Conceito 2: repetição com contagem', () => {
  it('registra 5 Desafios jogáveis nos ids do Conceito', () => {
    const conceito = concepts.find((c) => c.id === 'repeticao')!
    expect(conceito.challengeIds).toHaveLength(5)
    for (const id of conceito.challengeIds) expect(playableChallenges[id]).toBeDefined()
    expect(conceito2Challenges.map((c) => c.id)).toEqual(conceito.challengeIds)
  })

  it('tem Dica e limite de instruções em cada Desafio', () => {
    for (const c of conceito2Challenges) {
      expect(c.hint).toBeTruthy()
      expect(c.maxInstructions).toBeGreaterThan(0)
    }
  })

  for (const challenge of conceito2Challenges) {
    for (const language of languages) {
      it(`${challenge.id}: solução de referência em ${language} resolve com a Estrela de economia`, async () => {
        const code = conceito2Solutions[challenge.id][language]
        const result = await runChallenge(challenge, language, code, inProcessWorker)
        expect(result.status).toBe('solved')
        expect(result.stars).toContain('fewInstructions')
        // O loop vale a pena: bem menos instruções do que a sequência plana de Ações.
        expect(countInstructions(code)).toBeLessThan(result.actions.length / 2)
      }, 60_000)
    }
  }
})
