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
  timeoutMs = 3000,
): Promise<RunResult> {
  if (language !== 'javascript') {
    return Promise.reject(new Error(`Linguagem não suportada: ${language}`))
  }
  return new Promise((resolve, reject) => {
    const worker = createWorker()
    // Loop sem Ações trava o worker: o tempo limite o encerra e a interface segue livre.
    const timer = setTimeout(() => {
      worker.terminate()
      resolve({
        status: 'failed',
        actions: [],
        reason: 'Seu programa demorou demais e foi interrompido. Será que tem um loop infinito?',
      })
    }, timeoutMs)
    worker.onmessage = (event) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(event.data)
    }
    worker.onerror = (event) => {
      clearTimeout(timer)
      worker.terminate()
      reject(new Error(event.message ?? 'erro no worker'))
    }
    worker.postMessage({ challenge, code })
  })
}
