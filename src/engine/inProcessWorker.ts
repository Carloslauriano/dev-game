import { execute } from './execute'
import type { WorkerLike, WorkerRequest } from './types'

/** Substituto em processo para testes em Node (que não tem Web Worker). */
export function inProcessWorker(): WorkerLike {
  const w: WorkerLike = {
    onmessage: null,
    onerror: null,
    postMessage({ challenge, code }: WorkerRequest) {
      queueMicrotask(() => w.onmessage?.({ data: execute(challenge, code) }))
    },
    terminate() {},
  }
  return w
}
