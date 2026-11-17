import { computeStars } from './stars'
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
  timeoutMs = language === 'python' ? 60_000 : 3000, // Python inclui o carregamento do Pyodide
  hintUsed = false,
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const worker = createWorker()
    // Loop sem Ações trava o worker: o tempo limite o encerra e a interface segue livre.
    const timer = setTimeout(() => {
      worker.terminate()
      resolve({
        status: 'failed',
        actions: [],
        stars: [],
        reason: { code: 'timeout' },
      })
    }, timeoutMs)
    worker.onmessage = (event) => {
      clearTimeout(timer)
      worker.terminate()
      const result = event.data
      resolve({ ...result, stars: computeStars(challenge, result, code, hintUsed) })
    }
    worker.onerror = (event) => {
      clearTimeout(timer)
      worker.terminate()
      reject(new Error(event.message ?? 'erro no worker'))
    }
    worker.postMessage({ challenge, language, code })
  })
}
