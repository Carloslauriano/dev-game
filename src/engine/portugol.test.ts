import { describe, expect, it } from 'vitest'
import { compilePortugol, PortugolError } from './portugol'
import { runChallenge } from './runChallenge'
import { inProcessWorker } from './inProcessWorker'
import type { Challenge } from './types'

const corredor: Challenge = {
  id: 'p', width: 4, height: 1, start: { x: 0, y: 0, facing: 'east' },
  goal: { x: 3, y: 0 }, walls: [], obstacles: [], items: [],
}
const run = (code: string, c = corredor) => runChallenge(c, 'portugol', code, inProcessWorker)

describe('Portugol: execução', () => {
  it('sequência de Ações em português resolve um Desafio', async () => {
    const r = await run('andar()\nandar()\nandar()')
    expect(r).toMatchObject({ status: 'solved', actions: ['move', 'move', 'move'] })
  })

  it('aceita o envelope programa { funcao inicio() { ... } } do Portugol Studio', async () => {
    const r = await run('programa {\n  funcao inicio() {\n    andar()\n    andar()\n    andar()\n  }\n}')
    expect(r.status).toBe('solved')
  })

  it('para com variável, enquanto, se/senao, e/ou/nao e sensores', async () => {
    const r = await run(`
      inteiro passos = 0
      para (inteiro i = 0; i < 1; i++) { andar() }
      enquanto (nao naMeta()) {
        se (caminhoLivre() e passos >= 0) { andar() } senao se (falso ou verdadeiro) { virarDireita() } senao { virarEsquerda() }
        passos += 1
      }
    `)
    expect(r).toMatchObject({ status: 'solved', actions: ['move', 'move', 'move'] })
  })

  it('pegar e virar gravam as Ações certas', async () => {
    const c: Challenge = { ...corredor, height: 2, goal: { x: 0, y: 1 }, items: [{ x: 0, y: 0 }] }
    const r = await run('pegar() // item\nvirarDireita()\nandar()', c)
    expect(r).toMatchObject({ status: 'solved', actions: ['pickUp', 'turnRight', 'move'] })
  })
})

describe('Portugol: erros de sintaxe em português com linha', () => {
  const erro = (code: string) => {
    try {
      compilePortugol(code)
    } catch (e) {
      expect(e).toBeInstanceOf(PortugolError)
      return e as PortugolError
    }
    throw new Error('não deu erro')
  }

  it('parêntese faltando', () => {
    const e = erro('andar()\nse (naMeta() {\n}')
    expect(e.line).toBe(2)
    expect(e.message).toMatch(/linha 2/)
    expect(e.message).toMatch(/\)/)
  })

  it('chave não fechada', () => {
    expect(erro('enquanto (verdadeiro) {\n andar()\n').message).toMatch(/chave/i)
  })

  it('variável não declarada', () => {
    const e = erro('andar()\nx = 3')
    expect(e.line).toBe(2)
    expect(e.message).toMatch(/variável "x" não foi declarada/)
  })

  it('função desconhecida', () => {
    expect(erro('correr()').message).toMatch(/"correr" não existe/)
  })

  it('o erro chega ao jogador como falha em português, sem Ações', async () => {
    const r = await run('andar()\nse (naMeta() {\n}')
    expect(r.status).toBe('failed')
    expect(r.actions).toEqual([])
    expect(r.reason).toMatch(/Erro de sintaxe.*linha 2/)
  })
})
