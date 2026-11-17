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
  /** Chave de tradução do texto da Dica (o texto vive no arquivo de traduções, neutro quanto à Linguagem). */
  hint?: string
}

export type Language = 'javascript' | 'python' | 'portugol'

export type Action = 'move' | 'turnLeft' | 'turnRight' | 'pickUp'

/** Estrelas de um Desafio. 'noHint' é perdida ao pedir uma Dica. */
export type Star = 'solved' | 'fewInstructions' | 'noHint'

/** Motivos de falha. O motor devolve só o código (+ parâmetros); a interface traduz com t(). */
export const FAILURE_CODES = [
  'hitWall',
  'hitObstacle',
  'noItem',
  'actionLimit',
  'itemsMissing',
  'goalNotReached',
  'timeout',
  'syntaxError',
  'syntaxUnclosed',
  'syntaxUnexpected',
  'portugolSyntax',
  'undefinedName',
  'runtimeError',
] as const
export type FailureCode = (typeof FAILURE_CODES)[number]
export type FailureReason = { code: FailureCode; params?: Record<string, string | number> }

export type RunResult = {
  status: 'solved' | 'failed'
  /** Gravação das Ações executadas, na ordem. */
  actions: Action[]
  /** Motivo da falha, quando status é 'failed'. */
  reason?: FailureReason
  /** Estrelas ganhas nesta execução. */
  stars: Star[]
}

/** Resultado do worker, antes de o seam calcular as Estrelas. */
export type ExecutionResult = Omit<RunResult, 'stars'>

export type WorkerRequest = { challenge: Challenge; language: Language; code: string }

/** Contrato mínimo de um Web Worker, para permitir injeção em testes. */
export interface WorkerLike {
  onmessage: ((event: { data: ExecutionResult }) => void) | null
  onerror: ((event: { message?: string }) => void) | null
  postMessage(message: WorkerRequest): void
  terminate(): void
}
