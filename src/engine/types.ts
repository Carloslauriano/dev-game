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
  /** Limite de instruções para ganhar a Estrela de economia. Ausente: sem essa Estrela. */
  maxInstructions?: number
  /** Texto da Dica. O conteúdo final fica em issue à parte. */
  hint?: string
}

export type Language = 'javascript'

export type Action = 'move' | 'turnLeft' | 'turnRight' | 'pickUp'

/** Estrelas de um Desafio. 'noHint' é perdida ao pedir uma Dica. */
export type Star = 'solved' | 'fewInstructions' | 'noHint'

export type RunResult = {
  status: 'solved' | 'failed'
  /** Gravação das Ações executadas, na ordem. */
  actions: Action[]
  /** Motivo da falha, quando status é 'failed'. */
  reason?: string
  /** Estrelas ganhas nesta execução. */
  stars: Star[]
}

/** Resultado do worker, antes de o seam calcular as Estrelas. */
export type ExecutionResult = Omit<RunResult, 'stars'>

export type WorkerRequest = { challenge: Challenge; code: string }

/** Contrato mínimo de um Web Worker, para permitir injeção em testes. */
export interface WorkerLike {
  onmessage: ((event: { data: ExecutionResult }) => void) | null
  onerror: ((event: { message?: string }) => void) | null
  postMessage(message: WorkerRequest): void
  terminate(): void
}
