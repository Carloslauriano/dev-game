import { describe, expect, it } from 'vitest'
import { runChallenge } from './runChallenge'
import { inProcessWorker } from './inProcessWorker'
import type { Challenge } from './types'

// Mapa 3x1: personagem em (0,0) virado para leste, meta em (2,0).
const corredor: Challenge = {
  id: 'corredor',
  width: 3,
  height: 1,
  start: { x: 0, y: 0, facing: 'east' },
  goal: { x: 2, y: 0 },
  walls: [],
  obstacles: [],
  items: [],
}

// Vitest roda em Node, sem Web Worker: o seam recebe a fábrica de worker.
const run = (challenge: Challenge, language: 'javascript', code: string) =>
  runChallenge(challenge, language, code, inProcessWorker)

describe('runChallenge (JavaScript)', () => {
  it('resolve o Desafio e devolve a gravação de Ações', async () => {
    const result = await run(corredor, 'javascript', 'move(); move();')
    expect(result).toEqual({ status: 'solved', actions: ['move', 'move'] })
  })

  it('falha ao bater em parede, inclusive a borda do mapa', async () => {
    const result = await run(corredor, 'javascript', 'turnLeft(); move();')
    expect(result.status).toBe('failed')
    expect(result.actions).toEqual(['turnLeft', 'move'])
  })

  it('falha ao cair em obstáculo', async () => {
    const comBuraco: Challenge = { ...corredor, obstacles: [{ x: 1, y: 0 }] }
    const result = await run(comBuraco, 'javascript', 'move(); move();')
    expect(result.status).toBe('failed')
    expect(result.actions).toEqual(['move'])
  })

  it('falha ao bater em parede do mapa', async () => {
    const comParede: Challenge = { ...corredor, walls: [{ x: 1, y: 0 }] }
    const result = await run(comParede, 'javascript', 'move(); move();')
    expect(result.status).toBe('failed')
  })

  it('falha se o programa termina fora da meta', async () => {
    const result = await run(corredor, 'javascript', 'move();')
    expect(result.status).toBe('failed')
  })

  it('suporta virar à direita e pegar', async () => {
    const mapa: Challenge = {
      ...corredor,
      width: 2,
      height: 2,
      goal: { x: 1, y: 1 },
      items: [{ x: 1, y: 0 }],
    }
    const code = 'move(); pickUp(); turnRight(); move();'
    const result = await run(mapa, 'javascript', code)
    expect(result).toEqual({
      status: 'solved',
      actions: ['move', 'pickUp', 'turnRight', 'move'],
    })
  })

  it('falha ao pegar onde não há item', async () => {
    const result = await run(corredor, 'javascript', 'pickUp();')
    expect(result.status).toBe('failed')
  })
})
