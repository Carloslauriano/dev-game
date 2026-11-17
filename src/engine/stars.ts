import type { Challenge, RunResult, Star } from './types'

const ACTION_CALL = /\b(move|turnLeft|turnRight|pickUp)\s*\(/g

/** Conta as instruções do programa: chamadas de Ação no texto, ignorando comentários. */
export function countInstructions(code: string): number {
  const semComentarios = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  return (semComentarios.match(ACTION_CALL) ?? []).length
}

/** Estrelas ganhas em uma execução. Falhar não dá Estrelas. */
export function computeStars(challenge: Challenge, result: RunResult, code: string): Star[] {
  if (result.status !== 'solved') return []
  const stars: Star[] = ['solved']
  if (challenge.maxInstructions !== undefined && countInstructions(code) <= challenge.maxInstructions) {
    stars.push('fewInstructions')
  }
  return stars
}

/** Refazer um Desafio nunca remove Estrelas já ganhas. */
export function mergeStars(earned: Star[], fresh: Star[]): Star[] {
  const all = new Set([...earned, ...fresh])
  return (['solved', 'fewInstructions', 'noHint'] as Star[]).filter((s) => all.has(s))
}
