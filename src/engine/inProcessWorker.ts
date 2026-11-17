import { dispatch } from './dispatch'
import type { WorkerLike, WorkerRequest } from './types'

/** Substituto em processo para testes em Node (que não tem Web Worker). */
export function inProcessWorker(): WorkerLike {
  const w: WorkerLike = {
    onmessage: null,
    onerror: null,
    postMessage(request: WorkerRequest) {
      dispatch(request).then(
        (data) => w.onmessage?.({ data }),
        (e: Error) => w.onerror?.({ message: e.message }),
      )
    },
    terminate() {},
  }
  return w
}
