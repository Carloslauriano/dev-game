import { describe, expect, it } from 'vitest'
import { runChallenge } from '../engine/runChallenge'
import { inProcessWorker } from '../engine/inProcessWorker'
import type { Challenge, Language } from '../engine/types'
import { generateCode } from './generators'

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

type B = { type: string; fields?: object; inputs?: object; next?: { block: B } }
const seq = (...bs: B[]): B =>
  bs.reduceRight<B | undefined>((nxt, b) => (nxt ? { ...b, next: { block: nxt } } : b), undefined)!
const program = (...bs: B[]) => ({ blocks: { languageVersion: 0, blocks: [seq(...bs)] } })
const move: B = { type: 'action_move' }
const pickUp: B = { type: 'action_pick_up' }

const languages: Language[] = ['javascript', 'python', 'portugol']
const solve = async (challenge: Challenge, state: object, language: Language) =>
  runChallenge(challenge, language, generateCode(state, language), inProcessWorker)

describe('Blocos visuais geram código equivalente', () => {
  it.each(languages)('Ações em sequência resolvem o Desafio (%s)', async (language) => {
    const r = await solve(corredor, program(move, move), language)
    expect(r).toMatchObject({ status: 'solved', actions: ['move', 'move'] })
  }, 60_000)

  it.each(languages)('repetição N vezes aninhada (%s)', async (language) => {
    const state = program({
      type: 'repeat_times',
      fields: { TIMES: 2 },
      inputs: { DO: { block: { type: 'repeat_times', fields: { TIMES: 1 }, inputs: { DO: { block: move } } } } },
    })
    expect((await solve(corredor, state, language)).actions).toEqual(['move', 'move'])
  })

  it.each(languages)('enquanto, se/senão e Sensores (%s)', async (language) => {
    const comItem: Challenge = { ...corredor, items: [{ x: 1, y: 0 }] }
    const state = program({
      type: 'while_cond',
      inputs: {
        COND: { block: { type: 'logic_not_block', inputs: { VALUE: { block: { type: 'sensor_at_goal' } } } } },
        DO: {
          block: {
            type: 'if_else',
            inputs: {
              COND: { block: { type: 'sensor_has_item' } },
              THEN: { block: pickUp },
              ELSE: { block: move },
            },
          },
        },
      },
    })
    const r = await solve(comItem, state, language)
    expect(r).toMatchObject({ status: 'solved', actions: ['move', 'pickUp', 'move'] })
  })

  it.each(languages)('corpos vazios e caminho livre geram código válido (%s)', async (language) => {
    const state = program(
      { type: 'if_else', inputs: { COND: { block: { type: 'sensor_path_clear' } } } },
      move,
      move,
    )
    expect((await solve(corredor, state, language)).status).toBe('solved')
  })

  it('mostra o código na Linguagem escolhida', () => {
    const state = program(move)
    expect(generateCode(state, 'python')).toContain('move()')
    expect(generateCode(state, 'portugol')).toContain('andar()')
    expect(generateCode(state, 'javascript')).toContain('move();')
  })
})
