import { describe, expect, it } from 'vitest'
import { replay } from './replay'
import type { Challenge } from './types'

const challenge: Challenge = {
  id: 't',
  width: 3,
  height: 1,
  start: { x: 0, y: 0, facing: 'east' },
  goal: { x: 2, y: 0 },
  walls: [],
  obstacles: [],
  items: [{ x: 1, y: 0 }],
}

describe('replay', () => {
  it('começa na posição inicial e avança um quadro por Ação', () => {
    const frames = replay(challenge, ['move', 'turnLeft'])
    expect(frames.map((f) => [f.x, f.y, f.facing])).toEqual([
      [0, 0, 'east'],
      [1, 0, 'east'],
      [1, 0, 'north'],
    ])
  })

  it('remove o item do mapa ao pegar', () => {
    const frames = replay(challenge, ['move', 'pickUp'])
    expect(frames[1].items).toHaveLength(1)
    expect(frames[2].items).toHaveLength(0)
  })

  it('para no quadro da falha quando a Ação bate na parede', () => {
    const frames = replay(challenge, ['turnLeft', 'move'])
    expect(frames[2]).toMatchObject({ x: 0, y: 0, bumped: true })
  })
})
