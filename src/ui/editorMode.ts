import { concepts } from '../challenges/concepts'

/** Conceito a partir do qual o jogador escreve código digitado (variáveis não existem como Blocos). */
const FIRST_TYPED_CONCEPT = 'variaveis'

/** Blocos visuais são oferecidos antes do Conceito de variáveis; depois, só código digitado. */
export function offersBlocks(challengeId: string): boolean {
  const typedFrom = concepts.findIndex((c) => c.id === FIRST_TYPED_CONCEPT)
  const own = concepts.findIndex((c) => c.challengeIds.includes(challengeId))
  return own < 0 || own < typedFrom
}

/** Último código gerado pelos Blocos, por Linguagem; guia a migração para o código digitado. */
const lastBlockCode: Partial<Record<string, string>> = {}

export const rememberBlockCode = (language: string, code: string) => {
  if (code.trim()) lastBlockCode[language] = code
}

export const migratedCodeFor = (language: string): string | undefined => lastBlockCode[language]
