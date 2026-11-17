import { execute } from './execute'
import type { RunResult, WorkerRequest } from './types'

/** Escolhe o runtime da Linguagem. O Pyodide só é importado (e baixado) quando o código é Python. */
export async function dispatch({ challenge, language, code }: WorkerRequest): Promise<RunResult> {
  if (language === 'python') {
    const { executePython } = await import('./python')
    return executePython(challenge, code)
  }
  return execute(challenge, code)
}
