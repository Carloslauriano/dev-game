import type { Action, Challenge, Facing, Position, ExecutionResult } from './types'

const ORDER: Facing[] = ['north', 'east', 'south', 'west']
const DELTA: Record<Facing, Position> = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
}

class Failure extends Error {}

/** Limite de Ações antes de interromper a execução (proteção contra loop infinito). */
export const ACTION_LIMIT = 1000

const at = (list: Position[], p: Position) => list.some((q) => q.x === p.x && q.y === p.y)

/** Roda o código do jogador contra o mapa e grava as Ações. Não toca em DOM nem em globais do jogo. */
export function execute(challenge: Challenge, code: string): ExecutionResult {
  const actions: Action[] = []
  let { x, y } = challenge.start
  let facing = challenge.start.facing
  const items = [...challenge.items]

  const record = (a: Action) => {
    if (actions.length >= ACTION_LIMIT) {
      throw new Failure(`Seu programa passou do limite de ações (${ACTION_LIMIT}). Será que tem um loop infinito?`)
    }
    actions.push(a)
  }

  const turn = (step: number) => {
    facing = ORDER[(ORDER.indexOf(facing) + step + 4) % 4]
  }

  const api: Record<Action, () => void> = {
    move() {
      record('move')
      const nx = x + DELTA[facing].x
      const ny = y + DELTA[facing].y
      const next = { x: nx, y: ny }
      if (nx < 0 || ny < 0 || nx >= challenge.width || ny >= challenge.height || at(challenge.walls, next)) {
        throw new Failure('bateu na parede')
      }
      x = nx
      y = ny
      if (at(challenge.obstacles, next)) throw new Failure('caiu em um obstáculo')
    },
    turnLeft() {
      record('turnLeft')
      turn(-1)
    },
    turnRight() {
      record('turnRight')
      turn(1)
    },
    pickUp() {
      record('pickUp')
      const i = items.findIndex((p) => p.x === x && p.y === y)
      if (i < 0) throw new Failure('não há item aqui')
      items.splice(i, 1)
    },
  }

  try {
    new Function('move', 'turnLeft', 'turnRight', 'pickUp', code)(
      api.move,
      api.turnLeft,
      api.turnRight,
      api.pickUp,
    )
  } catch (e) {
    if (e instanceof Failure) return { status: 'failed', actions, reason: e.message }
    if (e instanceof SyntaxError) {
      return { status: 'failed', actions, reason: `Erro de sintaxe no código: ${e.message}` }
    }
    return { status: 'failed', actions, reason: `erro no código: ${(e as Error).message}` }
  }

  if (x === challenge.goal.x && y === challenge.goal.y) return { status: 'solved', actions }
  return { status: 'failed', actions, reason: 'o personagem não chegou à meta' }
}
