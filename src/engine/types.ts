export type Facing = 'north' | 'east' | 'south' | 'west'
export type Position = { x: number; y: number }

/** Desafio de mapa descrito como dados. Origem (0,0) no canto superior esquerdo; norte é y-1. */
export type Challenge = {
  id: string
  width: number
  height: number
  start: Position & { facing: Facing }
  goal: Position
  walls: Position[]
  obstacles: Position[]
  items: Position[]
}

export type Language = 'javascript' | 'python'

export type Action = 'move' | 'turnLeft' | 'turnRight' | 'pickUp'

export type RunResult = {
  status: 'solved' | 'failed'
  /** Gravação das Ações executadas, na ordem. */
  actions: Action[]
  /** Motivo da falha, quando status é 'failed'. */
  reason?: string
}

export type WorkerRequest = { challenge: Challenge; language: Language; code: string }

/** Contrato mínimo de um Web Worker, para permitir injeção em testes. */
export interface WorkerLike {
  onmessage: ((event: { data: RunResult }) => void) | null
  onerror: ((event: { message?: string }) => void) | null
  postMessage(message: WorkerRequest): void
  terminate(): void
}
