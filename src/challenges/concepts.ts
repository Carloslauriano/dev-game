import type { Concept } from '../engine/concepts'
import { firstChallenge } from './first'

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
  { id: 'variaveis', challengeIds: slots('variaveis') },
]

/** Desafios com conteúdo, por id. Os demais aparecem como "em breve". */
export const playableChallenges = { [firstChallenge.id]: firstChallenge }
