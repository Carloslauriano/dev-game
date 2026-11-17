import { computeStars } from './stars'
import type { Challenge, Language, RunResult, WorkerLike } from './types'

const browserWorker = (): WorkerLike =>
  new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }) as unknown as WorkerLike

/** Como cada Linguagem usa o worker. Python mantém o worker vivo para não recarregar o Pyodide a cada execução. */
const RUNTIME: Record<Language, { coldTimeoutMs: number; warmTimeoutMs: number; reuseWorker: boolean }> = {
  javascript: { coldTimeoutMs: 3000, warmTimeoutMs: 3000, reuseWorker: false },
  python: { coldTimeoutMs: 60_000, warmTimeoutMs: 3000, reuseWorker: true }, // a primeira execução inclui o Pyodide
  portugol: { coldTimeoutMs: 3000, warmTimeoutMs: 3000, reuseWorker: false },
}

type Shared = { factory: () => WorkerLike; worker: WorkerLike; warm: boolean }
const shared: Partial<Record<Language, Shared>> = {}

/**
 * Seam central do jogo: executa o código do jogador em um Web Worker e devolve
 * a gravação de Ações e o resultado.
 */
export function runChallenge(
  challenge: Challenge,
  language: Language,
  code: string,
  createWorker: () => WorkerLike = browserWorker,
  timeoutMs?: number,
  hintUsed = false,
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const runtime = RUNTIME[language]
    let entry = shared[language]
    if (!runtime.reuseWorker || entry?.factory !== createWorker) {
      entry = { factory: createWorker, worker: createWorker(), warm: false }
      if (runtime.reuseWorker) {
        shared[language]?.worker.terminate()
        shared[language] = entry
      }
    }
    const { worker } = entry
    const limit = timeoutMs ?? (entry.warm ? runtime.warmTimeoutMs : runtime.coldTimeoutMs)
    // Descarta o worker compartilhado: o próximo run cria um novo (e recarrega o runtime).
    const discard = () => {
      worker.terminate()
      if (shared[language]?.worker === worker) delete shared[language]
    }
    // Loop sem Ações trava o worker: o tempo limite o encerra e a interface segue livre.
    const timer = setTimeout(() => {
      discard()
      resolve({ status: 'failed', actions: [], stars: [], reason: { code: 'timeout' } })
    }, limit)
    worker.onmessage = (event) => {
      clearTimeout(timer)
      if (runtime.reuseWorker) entry.warm = true
      else worker.terminate()
      const result = event.data
      resolve({ ...result, stars: computeStars(challenge, result, code, hintUsed) })
    }
    worker.onerror = (event) => {
      clearTimeout(timer)
      discard()
      reject(new Error(event.message ?? 'erro no worker'))
    }
    worker.postMessage({ challenge, language, code })
  })
}
