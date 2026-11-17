/// <reference lib="webworker" />
import { execute } from './execute'
import type { WorkerRequest } from './types'

// Roda dentro do Web Worker: isolado do DOM e do resto da página.
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { challenge, code } = event.data
  self.postMessage(execute(challenge, code))
}
