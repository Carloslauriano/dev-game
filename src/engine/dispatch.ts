import { execute } from './execute'
import { compilePortugol, PortugolError } from './portugol'
import type { ExecutionResult, Language, WorkerRequest } from './types'

type Runner = (request: WorkerRequest) => Promise<ExecutionResult>

/** Runtime de cada Linguagem. O Pyodide só é importado (e baixado) quando o código é Python. */
const RUNNERS: Record<Language, Runner> = {
  javascript: async ({ challenge, code }) => execute(challenge, code),
  python: async ({ challenge, code }) => {
    const { executePython } = await import('./python')
    return executePython(challenge, code)
  },
  portugol: async ({ challenge, code }) => {
    try {
      return execute(challenge, compilePortugol(code))
    } catch (e) {
      if (e instanceof PortugolError) {
        return { status: 'failed', actions: [], reason: { code: 'portugolSyntax', params: { line: e.line, detail: e.detail } } }
      }
      throw e
    }
  },
}

export const dispatch: Runner = (request) => RUNNERS[request.language](request)
