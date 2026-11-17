import type { Challenge, Language, RunResult, WorkerLike } from './types'

const browserWorker = (): WorkerLike =>
  new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }) as unknown as WorkerLike

/**
 * Seam central do jogo: executa o código do jogador em um Web Worker e devolve
 * a gravação de Ações e o resultado.
 */
export function runChallenge(
  challenge: Challenge,
  language: Language,
  code: string,
  createWorker: () => WorkerLike = browserWorker,
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const worker = createWorker()
    worker.onmessage = (event) => {
      worker.terminate()
      resolve(event.data)
    }
    worker.onerror = (event) => {
      worker.terminate()
      reject(new Error(event.message ?? 'erro no worker'))
    }
    worker.postMessage({ challenge, language, code })
  })
}
