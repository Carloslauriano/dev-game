import { mergeStars } from '../engine/stars'
import type { RunResult, Star } from '../engine/types'

const key = (challengeId: string) => `dev-game:stars:${challengeId}`

export function loadStars(challengeId: string): Star[] {
  try {
    return JSON.parse(localStorage.getItem(key(challengeId)) ?? '[]') as Star[]
  } catch {
    return []
  }
}

/** Guarda as Estrelas somando às já ganhas; devolve o total. */
export function saveStars(challengeId: string, fresh: Star[]): Star[] {
  const merged = mergeStars(loadStars(challengeId), fresh)
  try {
    localStorage.setItem(key(challengeId), JSON.stringify(merged))
  } catch {
    // armazenamento indisponível: segue sem persistir
  }
  return merged
}

/**
 * Grava o resultado assim que ele chega (não depois da animação), para que sair ou reiniciar
 * no meio do replay não perca um Desafio resolvido. Falhar não grava nada. Devolve o total.
 *
 * Sobre a Dica: pedir uma Dica só tira a Estrela 'noHint' daquela execução; como Estrelas
 * ganhas nunca são removidas (spec #1), quem já tinha 'noHint' a mantém. Decisão deliberada.
 */
export function recordResult(challengeId: string, result: RunResult): Star[] {
  return result.status === 'solved' ? saveStars(challengeId, result.stars) : loadStars(challengeId)
}
