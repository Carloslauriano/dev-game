import type { Action, Challenge, ExecutionResult, Facing, FailureReason, Position } from './types'

const ORDER: Facing[] = ['north', 'east', 'south', 'west']
const DELTA: Record<Facing, Position> = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
}

class Failure extends Error {
  constructor(public reason: FailureReason) {
    super(reason.code)
  }
}

/** Nomes das Ações e Sensores visíveis ao código do jogador (fonte única). */
export const GAME_NAMES = ['move', 'turnLeft', 'turnRight', 'pickUp', 'pathClear', 'hasItem', 'atGoal'] as const

/** Classifica o erro de sintaxe do navegador/Pyodide sem expor o texto original (em inglês). */
export function syntaxReason(message: string): FailureReason {
  if (/end of input|unterminated|never closed|was never closed|EOF|missing \)|Unclosed|token '}'/i.test(message)) {
    return { code: 'syntaxUnclosed' }
  }
  if (/unexpected|invalid syntax|invalid character|expected/i.test(message)) return { code: 'syntaxUnexpected' }
  return { code: 'syntaxError' }
}

/** Erro de execução do código do jogador, sem texto original. */
export function runtimeReason(message: string): FailureReason {
  const name = /^(?:NameError: name )?'?([A-Za-z_]\w*)'?(?: is not defined)/.exec(message.replace(/^ReferenceError: /, ''))
  return name ? { code: 'undefinedName', params: { name: name[1] } } : { code: 'runtimeError' }
}

/** Limite de Ações antes de interromper a execução (proteção contra loop infinito). */
export const ACTION_LIMIT = 1000

const includesPosition = (list: Position[], p: Position) => list.some((q) => q.x === p.x && q.y === p.y)

/** Roda o código do jogador contra o mapa e grava as Ações. Não toca em DOM nem em globais do jogo. */
export function execute(challenge: Challenge, code: string): ExecutionResult {
  const actions: Action[] = []
  let { x, y } = challenge.start
  let facing = challenge.start.facing
  const items = [...challenge.items]

  const record = (a: Action) => {
    if (actions.length >= ACTION_LIMIT) {
      throw new Failure({ code: 'actionLimit', params: { limit: ACTION_LIMIT } })
    }
    actions.push(a)
  }

  const turn = (step: number) => {
    facing = ORDER[(ORDER.indexOf(facing) + step + 4) % 4]
  }

  const sensors = {
    pathClear: () => {
      const next = { x: x + DELTA[facing].x, y: y + DELTA[facing].y }
      const inside = next.x >= 0 && next.y >= 0 && next.x < challenge.width && next.y < challenge.height
      return inside && !includesPosition(challenge.walls, next) && !includesPosition(challenge.obstacles, next)
    },
    hasItem: () => includesPosition(items, { x, y }),
    atGoal: () => x === challenge.goal.x && y === challenge.goal.y,
  }

  const api: Record<Action, () => void> = {
    move() {
      record('move')
      const nx = x + DELTA[facing].x
      const ny = y + DELTA[facing].y
      const next = { x: nx, y: ny }
      if (nx < 0 || ny < 0 || nx >= challenge.width || ny >= challenge.height || includesPosition(challenge.walls, next)) {
        throw new Failure({ code: 'hitWall' })
      }
      x = nx
      y = ny
      if (includesPosition(challenge.obstacles, next)) throw new Failure({ code: 'hitObstacle' })
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
      if (i < 0) throw new Failure({ code: 'noItem' })
      items.splice(i, 1)
    },
  }

  try {
    const bindings: Record<(typeof GAME_NAMES)[number], () => unknown> = { ...api, ...sensors }
    new Function(...GAME_NAMES, code)(...GAME_NAMES.map((n) => bindings[n]))
  } catch (e) {
    if (e instanceof Failure) return { status: 'failed', actions, reason: e.reason }
    if (e instanceof SyntaxError) return { status: 'failed', actions, reason: syntaxReason(e.message) }
    return { status: 'failed', actions, reason: runtimeReason((e as Error).message) }
  }

  if (sensors.atGoal()) {
    if (items.length > 0) return { status: 'failed', actions, reason: { code: 'itemsMissing' } }
    return { status: 'solved', actions }
  }
  return { status: 'failed', actions, reason: { code: 'goalNotReached' } }
}
