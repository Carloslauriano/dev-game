import { describe, expect, it } from 'vitest'
import { ptBR } from '../i18n/pt-BR'
import { playableChallenges } from './concepts'

describe('Dicas', () => {
  it('toda Dica vive no arquivo de traduções', () => {
    for (const c of Object.values(playableChallenges)) {
      expect(c.hint, c.id).toBeTruthy()
      expect(ptBR, c.id).toHaveProperty(c.hint!)
    }
  })

  it('as Dicas não citam nomes de funções de uma Linguagem específica', () => {
    const nomes = /\b(move|turnLeft|turnRight|pickUp|pathClear|hasItem|atGoal|andar|virarEsquerda|virarDireita|pegar|caminhoLivre|temItem|naMeta)\b/
    for (const c of Object.values(playableChallenges)) {
      const text = (ptBR as Record<string, string>)[c.hint!]
      expect(text, c.id).not.toMatch(nomes)
      expect(text, c.id).not.toMatch(/Dica de exemplo/)
    }
  })
})
