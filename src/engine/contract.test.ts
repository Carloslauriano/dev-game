import { describe, expect, it } from 'vitest'
import { runChallenge } from './runChallenge'
import { inProcessWorker } from './inProcessWorker'
import type { Challenge, Language } from './types'

const mapa: Challenge = {
  id: 'contrato',
  width: 3,
  height: 2,
  start: { x: 0, y: 0, facing: 'east' },
  goal: { x: 2, y: 1 },
  walls: [],
  obstacles: [],
  items: [{ x: 1, y: 0 }],
}

const run = (language: Language, code: string, challenge = mapa) =>
  runChallenge(challenge, language, code, inProcessWorker)

// Soluções equivalentes por Linguagem: o mesmo Desafio tem de render o mesmo resultado.
const jsSolucao = 'move(); pickUp(); move(); turnRight(); move();'
const pySolucao = 'move()\npickUp()\nmove()\nturnRight()\nmove()\n'

describe('contrato entre Linguagens', () => {
  it('soluções equivalentes em JavaScript e Python dão a mesma gravação e resultado', async () => {
    const js = await run('javascript', jsSolucao)
    const py = await run('python', pySolucao)
    expect(js).toMatchObject({
      status: 'solved',
      actions: ['move', 'pickUp', 'move', 'turnRight', 'move'],
    })
    expect(py).toEqual(js)
  }, 60_000)

  it('Portugol, Python e JavaScript equivalentes dão a mesma gravação e resultado', async () => {
    const js = await run('javascript', jsSolucao)
    const pt = await run('portugol', 'andar()\npegar()\nandar()\nvirarDireita()\nandar()\n')
    expect(pt).toEqual(js)
    const corredor: Challenge = { ...mapa, goal: { x: 2, y: 0 }, items: [] }
    const jsLoop = await run('javascript', 'while (!atGoal()) { if (pathClear()) move(); }', corredor)
    const ptLoop = await run('portugol', 'enquanto (nao naMeta()) {\n se (caminhoLivre()) { andar() }\n}', corredor)
    expect(ptLoop).toEqual(jsLoop)
    const ptFalha = await run('portugol', 'virarEsquerda()\nandar()')
    expect(ptFalha).toEqual(await run('javascript', 'turnLeft(); move();'))
  })

  it('Python com loop dá a mesma gravação que o JavaScript', async () => {
    const corredor: Challenge = { ...mapa, goal: { x: 2, y: 0 }, items: [] }
    const js = await run('javascript', 'for (let i = 0; i < 2; i++) move();', corredor)
    const py = await run('python', 'for _ in range(2):\n    move()\n', corredor)
    expect(js.actions).toEqual(['move', 'move'])
    expect(py).toEqual(js)
  }, 60_000)

  it('Python reporta a mesma falha de jogo que o JavaScript', async () => {
    const js = await run('javascript', 'turnLeft(); move();')
    const py = await run('python', 'turnLeft()\nmove()\n')
    expect(js.status).toBe('failed')
    expect(py).toEqual(js)
  }, 60_000)

  it('Python com erro de sintaxe falha com motivo, sem Ações', async () => {
    const py = await run('python', 'move(\n')
    expect(py.status).toBe('failed')
    expect(py.actions).toEqual([])
    expect(py.reason).toMatch(/erro no código/)
  }, 60_000)

  it('sensores têm os mesmos nomes e valores em JavaScript e Python', async () => {
    const corredor: Challenge = { ...mapa, goal: { x: 2, y: 0 }, items: [] }
    const js = await run('javascript', 'while (!atGoal()) { if (pathClear()) move(); }', corredor)
    const py = await run('python', 'while not atGoal():\n    if pathClear():\n        move()\n', corredor)
    expect(js.status).toBe('solved')
    expect(py).toEqual(js)
  }, 60_000)
})
