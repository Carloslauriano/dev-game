/// <reference lib="webworker" />
import { dispatch } from './dispatch'
import type { WorkerRequest } from './types'

// Roda dentro do Web Worker: isolado do DOM e do resto da página.
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  self.postMessage(await dispatch(event.data))
}
