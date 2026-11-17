import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadStars, recordResult } from './progress'
import type { RunResult } from '../engine/types'

const store = new Map<string, string>()
beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  })
})

const solved = (stars: RunResult['stars']): RunResult => ({ status: 'solved', actions: ['move'], stars })

describe('recordResult: Estrelas salvas quando o resultado chega', () => {
  it('resolver grava as Estrelas na hora, sem depender da animação', () => {
    expect(recordResult('c', solved(['solved', 'noHint']))).toEqual(['solved', 'noHint'])
    expect(loadStars('c')).toEqual(['solved', 'noHint'])
  })

  it('falhar não grava nada e devolve as Estrelas já ganhas', () => {
    recordResult('c', solved(['solved']))
    const falhou: RunResult = { status: 'failed', actions: [], stars: [], reason: { code: 'hitWall' } }
    expect(recordResult('c', falhou)).toEqual(['solved'])
    expect(loadStars('c')).toEqual(['solved'])
  })

  it('refazer sem Dica ou com mais instruções nunca remove Estrelas', () => {
    recordResult('c', solved(['solved', 'fewInstructions', 'noHint']))
    expect(recordResult('c', solved(['solved']))).toEqual(['solved', 'fewInstructions', 'noHint'])
  })
})
