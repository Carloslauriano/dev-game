import { describe, expect, it } from 'vitest'
import { runChallenge } from './runChallenge'
import { inProcessWorker } from './inProcessWorker'
import type { Challenge } from './types'

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

const run = (challenge: Challenge, code: string) =>
  runChallenge(challenge, 'javascript', code, inProcessWorker)

describe('Sensores (JavaScript)', () => {
  it('pathClear é verdadeiro com caminho livre e falso na borda do mapa', async () => {
    const r = await run(
      corredor,
      'if (!pathClear()) throw new Error("a"); move(); move(); if (pathClear()) throw new Error("b");',
    )
    expect(r).toEqual({ status: 'solved', actions: ['move', 'move'] })
  })

  it('pathClear é falso diante de parede e de obstáculo', async () => {
    const parede: Challenge = { ...corredor, walls: [{ x: 1, y: 0 }] }
    expect((await run(parede, 'if (pathClear()) move();')).actions).toEqual([])
    const buraco: Challenge = { ...corredor, obstacles: [{ x: 1, y: 0 }] }
    expect((await run(buraco, 'if (pathClear()) move();')).actions).toEqual([])
  })

  it('hasItem é verdadeiro só sobre um item ainda não coletado', async () => {
    const comItem: Challenge = { ...corredor, items: [{ x: 1, y: 0 }] }
    const code = 'if (hasItem()) turnLeft(); move(); if (hasItem()) pickUp(); if (hasItem()) turnRight();'
    const r = await run(comItem, code)
    expect(r.actions).toEqual(['move', 'pickUp'])
  })

  it('atGoal é verdadeiro somente na meta', async () => {
    const r = await run(corredor, 'while (!atGoal()) move(); if (atGoal()) turnLeft();')
    expect(r.actions).toEqual(['move', 'move', 'turnLeft'])
    expect(r.status).toBe('solved')
  })

  it('só resolve na meta depois de coletar todos os itens', async () => {
    const comItem: Challenge = { ...corredor, items: [{ x: 1, y: 0 }] }
    const sem = await run(comItem, 'move(); move();')
    expect(sem.status).toBe('failed')
    expect(sem.reason).toMatch(/iten/)
    const com = await run(comItem, 'move(); pickUp(); move();')
    expect(com).toEqual({ status: 'solved', actions: ['move', 'pickUp', 'move'] })
  })
})
