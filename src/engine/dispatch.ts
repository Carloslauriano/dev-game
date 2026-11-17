import { execute } from './execute'
import { compilePortugol, PortugolError } from './portugol'
import type { ExecutionResult, WorkerRequest } from './types'

/** Escolhe o runtime da Linguagem. O Pyodide só é importado (e baixado) quando o código é Python. */
export async function dispatch({ challenge, language, code }: WorkerRequest): Promise<ExecutionResult> {
  if (language === 'python') {
    const { executePython } = await import('./python')
    return executePython(challenge, code)
  }
  if (language === 'portugol') {
    try {
      return execute(challenge, compilePortugol(code))
    } catch (e) {
      if (e instanceof PortugolError) {
        return { status: 'failed', actions: [], reason: `Erro de sintaxe no Portugol, ${e.message}` }
      }
      throw e
    }
  }
  return execute(challenge, code)
}
