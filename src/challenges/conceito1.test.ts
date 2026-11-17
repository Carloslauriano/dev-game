import { describe, expect, it } from 'vitest'
import { runChallenge } from '../engine/runChallenge'
import { inProcessWorker } from '../engine/inProcessWorker'
import type { Language } from '../engine/types'
import { conceito1Challenges } from './conceito1'
import { conceito1Solutions } from './conceito1.solutions'
import { concepts, playableChallenges } from './concepts'

const languages: Language[] = ['javascript', 'python', 'portugol']

describe('Conceito 1: sequência', () => {
  it('tem 5 Desafios registrados e jogáveis, com Dica e limite de instruções', () => {
    expect(conceito1Challenges.map((c) => c.id)).toEqual(concepts[0].challengeIds)
    for (const c of conceito1Challenges) {
      expect(playableChallenges[c.id]).toBe(c)
      expect(c.maxInstructions).toBeGreaterThan(0)
      expect(c.hint).toBeTruthy()
    }
  })

  it('a dificuldade cresce: o limite de instruções aumenta a cada Desafio', () => {
    const sizes = conceito1Challenges.map((c) => c.maxInstructions!)
    expect([...sizes].sort((a, b) => a - b)).toEqual(sizes)
    expect(new Set(sizes).size).toBe(5)
  })

  for (const [i, challenge] of conceito1Challenges.entries()) {
    for (const language of languages) {
      it(`${challenge.id}: a solução de referência em ${language} resolve o Desafio`, async () => {
        const result = await runChallenge(challenge, language, conceito1Solutions[i][language], inProcessWorker)
        expect(result.status).toBe('solved')
        expect(result.stars).toContain('fewInstructions')
      }, 60_000)
    }
  }
})
