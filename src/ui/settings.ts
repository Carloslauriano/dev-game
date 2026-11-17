import type { Language } from '../engine/types'
import { AVAILABLE_LANGUAGES } from '../languages'

const KEY = 'dev-game:language'

/** Linguagem escolhida no início; persiste entre Desafios e visitas. */
export function loadLanguage(): Language | null {
  try {
    const stored = localStorage.getItem(KEY)
    return AVAILABLE_LANGUAGES.find((l) => l.id === stored)?.id ?? null
  } catch {
    return null
  }
}

export function saveLanguage(language: Language): void {
  try {
    localStorage.setItem(KEY, language)
  } catch {
    // armazenamento indisponível: vale só nesta sessão
  }
}
