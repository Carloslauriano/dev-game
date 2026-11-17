import { describe, expect, it } from 'vitest'
import { failureText } from './failureText'
import { FAILURE_CODES } from '../engine/types'

describe('texto dos motivos de falha', () => {
  it('todo código tem mensagem em português, sem chaves sobrando', () => {
    for (const code of FAILURE_CODES) {
      const text = failureText({ code, params: { limit: 1000, line: 2, detail: 'x', name: 'y' } })
      expect(text.length).toBeGreaterThan(5)
      expect(text).not.toMatch(/[{}]|SyntaxError|Unexpected/)
    }
  })

  it('preenche parâmetros', () => {
    expect(failureText({ code: 'actionLimit', params: { limit: 1000 } })).toContain('1000')
    expect(failureText({ code: 'undefinedName', params: { name: 'foo' } })).toContain('foo')
  })

  it('sem motivo devolve texto vazio', () => {
    expect(failureText(undefined)).toBe('')
  })
})
