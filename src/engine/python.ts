import type { PyodideAPI as Pyodide } from 'pyodide'
import type { Challenge, ExecutionResult } from './types'
import { execute, GAME_NAMES } from './execute'


declare const WorkerGlobalScope: unknown

let pyodide: Promise<Pyodide> | undefined

/** Carrega o Pyodide uma única vez, na primeira execução de Python. */
function loadPyodide(): Promise<Pyodide> {
  pyodide ??= import('pyodide').then(({ loadPyodide, version }) => {
    // No navegador os arquivos WASM vêm do CDN; em Node o pacote npm os encontra sozinho.
    const inBrowser = typeof WorkerGlobalScope !== 'undefined' || typeof window !== 'undefined'
    return loadPyodide(
      inBrowser ? { indexURL: `https://cdn.jsdelivr.net/pyodide/v${version}/full/` } : {},
    )
  })
  return pyodide
}

/**
 * Roda Python reaproveitando a simulação do JavaScript: o `execute` chama uma
 * ponte global que expõe as Ações (move, turnLeft...) ao Python e roda o código.
 * Assim as regras do mapa e a gravação são idênticas nas duas Linguagens.
 */
export async function executePython(challenge: Challenge, code: string): Promise<ExecutionResult> {
  const py = await loadPyodide()
  const g = globalThis as Record<string, unknown>
  g.__runPython = (...fns: Array<() => unknown>) => {
    let gameFailure: unknown
    GAME_NAMES.forEach((name, i) =>
      py.globals.set(name, () => {
        try {
          return fns[i]()
        } catch (e) {
          gameFailure = e // o Python embrulha exceções do JS; guardamos a original
          throw e
        }
      }),
    )
    try {
      py.runPython(code)
    } catch (e) {
      if (gameFailure) throw gameFailure
      const last = (e as Error).message.trim().split('\n').pop() ?? ''
      // Erros de sintaxe do Python viram SyntaxError, para o `execute` classificá-los como no JavaScript.
      if (/^(Syntax|Indentation|Tab)Error/.test(last)) throw new SyntaxError(last)
      throw new Error(last)
    }
  }
  try {
    return execute(challenge, `__runPython(${GAME_NAMES.join(', ')})`)
  } finally {
    delete g.__runPython
  }
}
