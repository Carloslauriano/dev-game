import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadLanguage, saveLanguage } from './settings'

const store = new Map<string, string>()
beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  })
})

describe('Linguagem persistida', () => {
  it('começa sem Linguagem escolhida', () => {
    expect(loadLanguage()).toBeNull()
  })

  it('lembra a Linguagem escolhida', () => {
    saveLanguage('python')
    expect(loadLanguage()).toBe('python')
  })

  it('ignora valor desconhecido guardado', () => {
    store.set('dev-game:language', 'cobol')
    expect(loadLanguage()).toBeNull()
  })
})
