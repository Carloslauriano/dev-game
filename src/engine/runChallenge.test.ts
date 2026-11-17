import { describe, expect, it } from 'vitest'
import { runChallenge } from './runChallenge'
import { inProcessWorker } from './inProcessWorker'
import type { Challenge, Language, WorkerLike } from './types'

// Mapa 3x1: personagem em (0,0) virado para leste, meta em (2,0).
const corredor: Challenge = {
  id: 'corredor',
  width: 3,
  height: 1,
  start: { x: 0, y: 0, facing: 'east' },
  goal: { x: 2, y: 0 },
  walls: [],
  obstacles: [],
  items: [],
}

// Vitest roda em Node, sem Web Worker: o seam recebe a fábrica de worker.
const run = (challenge: Challenge, language: Language, code: string) =>
  runChallenge(challenge, language, code, inProcessWorker)

describe('runChallenge (JavaScript)', () => {
  it('resolve o Desafio e devolve a gravação de Ações', async () => {
    const result = await run(corredor, 'javascript', 'move(); move();')
    expect(result.status).toBe('solved')
    expect(result.actions).toEqual(['move', 'move'])
  })

  it('falha ao bater em parede, inclusive a borda do mapa', async () => {
    const result = await run(corredor, 'javascript', 'turnLeft(); move();')
    expect(result.status).toBe('failed')
    expect(result.reason).toEqual({ code: 'hitWall' })
    expect(result.actions).toEqual(['turnLeft', 'move'])
  })

  it('falha ao cair em obstáculo', async () => {
    const comBuraco: Challenge = { ...corredor, obstacles: [{ x: 1, y: 0 }] }
    const result = await run(comBuraco, 'javascript', 'move(); move();')
    expect(result.status).toBe('failed')
    expect(result.reason).toEqual({ code: 'hitObstacle' })
    expect(result.actions).toEqual(['move'])
  })

  it('falha ao bater em parede do mapa', async () => {
    const comParede: Challenge = { ...corredor, walls: [{ x: 1, y: 0 }] }
    const result = await run(comParede, 'javascript', 'move(); move();')
    expect(result.status).toBe('failed')
  })

  it('falha se o programa termina fora da meta', async () => {
    const result = await run(corredor, 'javascript', 'move();')
    expect(result.status).toBe('failed')
    expect(result.reason).toEqual({ code: 'goalNotReached' })
  })

  it('suporta virar à direita e pegar', async () => {
    const mapa: Challenge = {
      ...corredor,
      width: 2,
      height: 2,
      goal: { x: 1, y: 1 },
      items: [{ x: 1, y: 0 }],
    }
    const code = 'move(); pickUp(); turnRight(); move();'
    const result = await run(mapa, 'javascript', code)
    expect(result.status).toBe('solved')
    expect(result.actions).toEqual(['move', 'pickUp', 'turnRight', 'move'])
  })

  it('falha ao pegar onde não há item', async () => {
    const result = await run(corredor, 'javascript', 'pickUp();')
    expect(result.status).toBe('failed')
    expect(result.reason).toEqual({ code: 'noItem' })
  })

  it('interrompe loop infinito de Ações com mensagem amigável', async () => {
    const result = await run(corredor, 'javascript', 'while (true) { turnLeft(); }')
    expect(result.status).toBe('failed')
    expect(result.reason).toEqual({ code: 'actionLimit', params: { limit: 1000 } })
    expect(result.actions.length).toBeLessThanOrEqual(1001)
  })

  it('devolve motivo de erro de sintaxe, sem texto do navegador', async () => {
    const result = await run(corredor, 'javascript', 'move(; move()')
    expect(result.status).toBe('failed')
    expect(result.reason).toEqual({ code: 'syntaxUnexpected' })
    expect(result.actions).toEqual([])
    const aberto = await run(corredor, 'javascript', 'move(')
    expect(aberto.reason?.code).toBe('syntaxUnclosed')
  })

  it('erro de execução vira motivo sem texto em inglês', async () => {
    const result = await run(corredor, 'javascript', 'andarr()')
    expect(result.reason).toEqual({ code: 'undefinedName', params: { name: 'andarr' } })
  })

  it('interrompe loop sem Ações pelo tempo limite e libera a interface', async () => {
    let terminated = false
    const travado = () => ({
      onmessage: null,
      onerror: null,
      postMessage() {},
      terminate() {
        terminated = true
      },
    })
    const result = await runChallenge(corredor, 'javascript', 'while(true){}', travado, 20)
    expect(result.status).toBe('failed')
    expect(result.reason).toEqual({ code: 'timeout' })
    expect(terminated).toBe(true)
  })
})

describe('runChallenge: Estrelas', () => {
  it('resolver dá a Estrela de resolução', async () => {
    const result = await run(corredor, 'javascript', 'move(); move();')
    expect(result.stars).toContain('solved')
  })

  it('falhar não dá Estrelas', async () => {
    const result = await run(corredor, 'javascript', 'move();')
    expect(result.stars).toEqual([])
  })

  it('resolver com poucas instruções dá mais uma Estrela', async () => {
    const limitado = { ...corredor, maxInstructions: 2 }
    const result = await run(limitado, 'javascript', 'move(); move();')
    expect(result.stars).toEqual(['solved', 'fewInstructions', 'noHint'])
  })

  it('resolver com instruções demais não dá a Estrela de economia', async () => {
    const limitado = { ...corredor, maxInstructions: 1 }
    const result = await run(limitado, 'javascript', 'move(); move();')
    expect(result.stars).toEqual(['solved', 'noHint'])
  })

  it('comentários e texto fora de chamadas não contam como instruções', async () => {
    const limitado = { ...corredor, maxInstructions: 2 }
    const code = '// move(); move(); move();\nmove(); move();'
    const result = await run(limitado, 'javascript', code)
    expect(result.stars).toContain('fewInstructions')
  })

  it('pedir Dica remove a Estrela de sem Dica', async () => {
    const result = await runChallenge(corredor, 'javascript', 'move(); move();', inProcessWorker, 3000, true)
    expect(result.stars).toEqual(['solved'])
  })
})

describe('runChallenge: reaproveitamento do worker de Python', () => {
  const countingFactory = () => {
    const state = { created: 0, terminated: 0, hangNext: false }
    const create = (): WorkerLike => {
      state.created++
      if (state.hangNext) {
        state.hangNext = false
        return { onmessage: null, onerror: null, postMessage() {}, terminate: () => void state.terminated++ }
      }
      const w = inProcessWorker()
      w.terminate = () => void state.terminated++
      return w
    }
    return { state, create }
  }

  it('duas execuções de Python usam o mesmo worker (Pyodide carrega uma vez)', async () => {
    const { state, create } = countingFactory()
    const a = await runChallenge(corredor, 'python', 'move()\nmove()\n', create)
    const b = await runChallenge(corredor, 'python', 'move()\nmove()\n', create)
    expect(a.status).toBe('solved')
    expect(b.status).toBe('solved')
    expect(state.created).toBe(1)
    expect(state.terminated).toBe(0)
  }, 60_000)

  it('o tempo limite encerra o worker reaproveitado e a próxima execução cria outro', async () => {
    const { state, create } = countingFactory()
    state.hangNext = true
    const travou = await runChallenge(corredor, 'python', 'while True: pass', create, 20)
    expect(travou.reason).toEqual({ code: 'timeout' })
    expect(state.terminated).toBe(1)
    const depois = await runChallenge(corredor, 'python', 'move()\nmove()\n', create)
    expect(depois.status).toBe('solved')
    expect(state.created).toBe(2)
  }, 60_000)

  it('JavaScript continua com um worker por execução', async () => {
    const { state, create } = countingFactory()
    await runChallenge(corredor, 'javascript', 'move(); move();', create)
    await runChallenge(corredor, 'javascript', 'move(); move();', create)
    expect(state.created).toBe(2)
    expect(state.terminated).toBe(2)
  })
})
