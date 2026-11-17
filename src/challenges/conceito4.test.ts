import { describe, expect, it } from 'vitest'
import { runChallenge } from '../engine/runChallenge'
import { inProcessWorker } from '../engine/inProcessWorker'
import { concepts, playableChallenges } from './concepts'
import { conceito4, conceito4Solutions } from './conceito4'
import type { Language } from '../engine/types'

const languages: Language[] = ['javascript', 'python', 'portugol']

describe('Conceito 4: repetição com condição', () => {
  it('registra 5 Desafios jogáveis nos ids do Conceito', () => {
    const ids = concepts.find((c) => c.id === 'repeticao-condicao')!.challengeIds
    expect(conceito4.map((c) => c.id)).toEqual(ids)
    for (const id of ids) expect(playableChallenges[id]).toBeDefined()
  })

  it('cada Desafio tem limite de instruções e Dica', () => {
    for (const c of conceito4) {
      expect(c.maxInstructions).toBeGreaterThan(0)
      expect(c.hint).toBeTruthy()
    }
  })

  for (const [i, challenge] of conceito4.entries()) {
    for (const language of languages) {
      it(`Desafio ${i + 1}: solução em ${language} resolve com a Estrela de economia`, async () => {
        const code = conceito4Solutions[challenge.id][language]
        const r = await runChallenge(challenge, language, code, inProcessWorker)
        expect(r.reason).toBeUndefined()
        expect(r.status).toBe('solved')
        expect(r.stars).toContain('fewInstructions')
      }, 30000)
    }
  }
})
