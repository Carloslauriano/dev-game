import { mergeStars } from '../engine/stars'
import type { Star } from '../engine/types'

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
