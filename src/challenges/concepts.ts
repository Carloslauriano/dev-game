import type { Concept } from '../engine/concepts'
import type { Challenge } from '../engine/types'
import { conceito2ById } from './conceito2'
import { condicaoChallenges } from './conceito3'
import { conceito4 } from './conceito4'
import { conceito5 } from './conceito5'
import { conceito1Challenges } from './conceito1'

/**
 * Os 5 Conceitos, na ordem de desbloqueio. Cada um tem 5 Desafios; os ids ainda sem
 * conteúdo (tickets #12-#16) são marcadores. Para registrar um Desafio real, troque
 * o marcador pelo id dele e adicione-o em `playableChallenges`.
 */
const slots = (prefix: string) => [1, 2, 3, 4, 5].map((n) => `${prefix}-${n}`)

export const concepts: Concept[] = [
  { id: 'sequencia', challengeIds: slots('sequencia') },
  { id: 'repeticao', challengeIds: slots('repeticao') },
  { id: 'condicao', challengeIds: slots('condicao') },
  { id: 'repeticao-condicao', challengeIds: slots('repeticao-condicao') },
  { id: 'variaveis', challengeIds: slots('variaveis'), typedCodeOnly: true },
]

/** Desafios com conteúdo, por id. Os demais aparecem como "em breve". */
export const playableChallenges: Record<string, Challenge> = {
  ...conceito2ById,
  ...Object.fromEntries(condicaoChallenges.map((c) => [c.id, c])),
  ...Object.fromEntries(conceito4.map((c) => [c.id, c])),
  ...Object.fromEntries(conceito5.map((c) => [c.id, c])),
  ...Object.fromEntries(conceito1Challenges.map((c) => [c.id, c])),
}
