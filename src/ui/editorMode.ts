import { offersBlocks as conceptsOfferBlocks } from '../engine/concepts'
import type { Language } from '../engine/types'
import { concepts } from '../challenges/concepts'

/** Blocos visuais são oferecidos antes do Conceito de variáveis; depois, só código digitado. */
export const offersBlocks = (challengeId: string): boolean => conceptsOfferBlocks(concepts, challengeId)

/** Último código gerado pelos Blocos, por Linguagem; guia a migração para o código digitado. */
const lastBlockCode: Partial<Record<Language, string>> = {}

export const rememberBlockCode = (language: Language, code: string) => {
  if (code.trim()) lastBlockCode[language] = code
}

export const migratedCodeFor = (language: Language): string | undefined => lastBlockCode[language]
