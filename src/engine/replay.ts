import type { Action, Challenge, Facing, Position } from './types'

export type Frame = {
  x: number
  y: number
  facing: Facing
  items: Position[]
  /** Verdadeiro quando a Ação deste quadro bateu na parede (o personagem não sai do lugar). */
  bumped: boolean
}

const ORDER: Facing[] = ['north', 'east', 'south', 'west']
const DELTA: Record<Facing, Position> = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
}

const has = (list: Position[], p: Position) => list.some((q) => q.x === p.x && q.y === p.y)

/** Converte a gravação de Ações em quadros de animação (o primeiro é o estado inicial). */
export function replay(challenge: Challenge, actions: Action[]): Frame[] {
  let frame: Frame = { ...challenge.start, items: [...challenge.items], bumped: false }
  const frames = [frame]
  for (const action of actions) {
    const next: Frame = { ...frame, bumped: false }
    if (action === 'turnLeft' || action === 'turnRight') {
      const step = action === 'turnLeft' ? -1 : 1
      next.facing = ORDER[(ORDER.indexOf(frame.facing) + step + 4) % 4]
    } else if (action === 'pickUp') {
      next.items = frame.items.filter((p) => !(p.x === frame.x && p.y === frame.y))
    } else {
      const p = { x: frame.x + DELTA[frame.facing].x, y: frame.y + DELTA[frame.facing].y }
      const outside = p.x < 0 || p.y < 0 || p.x >= challenge.width || p.y >= challenge.height
      if (outside || has(challenge.walls, p)) next.bumped = true
      else {
        next.x = p.x
        next.y = p.y
      }
    }
    frames.push(next)
    frame = next
  }
  return frames
}
