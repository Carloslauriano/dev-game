import * as Blockly from 'blockly/core'
import type { Language } from '../engine/types'
import { PORTUGOL_NAMES } from '../engine/portugol'
import { defineBlocks } from './blocks'

/** Programa de Blocos serializado (JSON do Blockly). */
export type BlocklyState = object

type Gen = Blockly.CodeGenerator
type Emit = (block: Blockly.Block, gen: Gen) => string | [string, number]

type Syntax = {
  /** Nome, na Linguagem, da Ação ou Sensor do jogo (nomes do `execute` -> nomes visíveis ao jogador). */
  name: (gameName: string) => string
  /** Fim de um comando de Ação. */
  terminator: string
  falseLiteral: string
  repeat: (times: number, body: string, depth: number) => string
  whileLoop: (cond: string, body: string) => string
  ifElse: (cond: string, thenBody: string, elseBody: string) => string
  not: (expr: string) => string
  /** Corpo vazio. Python exige `pass`. */
  empty: string
}

const ACTION_TYPES: Record<string, string> = {
  action_move: 'move',
  action_turn_left: 'turnLeft',
  action_turn_right: 'turnRight',
  action_pick_up: 'pickUp',
}
const SENSOR_TYPES: Record<string, string> = {
  sensor_path_clear: 'pathClear',
  sensor_has_item: 'hasItem',
  sensor_at_goal: 'atGoal',
}

/** Inverso de PORTUGOL_NAMES: nome do jogo -> nome em Portugol. */
const portugolName = Object.fromEntries(Object.entries(PORTUGOL_NAMES).map(([pt, game]) => [game, pt]))

const js: Syntax = {
  name: (n) => n,
  terminator: ';',
  falseLiteral: 'false',
  repeat: (n, body, d) => `for (let i${d} = 0; i${d} < ${n}; i${d}++) {\n${body}}\n`,
  whileLoop: (c, body) => `while (${c}) {\n${body}}\n`,
  ifElse: (c, a, b) => `if (${c}) {\n${a}}${b ? ` else {\n${b}}` : ''}\n`,
  not: (e) => `!(${e})`,
  empty: '',
}

const python: Syntax = {
  name: (n) => n,
  terminator: '',
  falseLiteral: 'False',
  repeat: (n, body, d) => `for i${d} in range(${n}):\n${body}`,
  whileLoop: (c, body) => `while ${c}:\n${body}`,
  ifElse: (c, a, b) => `if ${c}:\n${a}${b ? `else:\n${b}` : ''}`,
  not: (e) => `not (${e})`,
  empty: 'pass',
}

const portugol: Syntax = {
  name: (n) => portugolName[n],
  terminator: '',
  falseLiteral: 'falso',
  repeat: (n, body, d) => `para (inteiro i${d} = 0; i${d} < ${n}; i${d}++) {\n${body}}\n`,
  whileLoop: (c, body) => `enquanto (${c}) {\n${body}}\n`,
  ifElse: (c, a, b) => `se (${c}) {\n${a}}${b ? ` senao {\n${b}}` : ''}\n`,
  not: (e) => `nao (${e})`,
  empty: '',
}

const SYNTAX: Record<Language, Syntax> = { javascript: js, python, portugol }

/** Profundidade de aninhamento de repetições "N vezes": dá nomes únicos às variáveis de contador. */
const loopDepth = (block: Blockly.Block): number => {
  let depth = 0
  for (let p = block.getSurroundParent(); p; p = p.getSurroundParent()) {
    if (p.type === 'repeat_times') depth++
  }
  return depth
}

const body = (gen: Gen, block: Blockly.Block, name: string, syntax: Syntax): string => {
  const code = gen.statementToCode(block, name)
  return code || (syntax.empty ? gen.INDENT + syntax.empty + '\n' : '')
}

const condition = (gen: Gen, block: Blockly.Block, name: string, fallback: string): string =>
  gen.valueToCode(block, name, 0) || fallback

function makeGenerator(language: Language): Gen {
  const syntax = SYNTAX[language]
  const gen = new Blockly.CodeGenerator(language)
  gen.INDENT = '  '
  // Encadeia o próximo bloco da pilha depois do código do bloco atual.
  gen.scrub_ = (block, code, thisOnly) => {
    const next = block.nextConnection?.targetBlock()
    return code + (next && !thisOnly ? gen.blockToCode(next) : '')
  }
  const forBlock = gen.forBlock as Record<string, Emit>
  const { falseLiteral } = syntax

  for (const [type, name] of Object.entries(ACTION_TYPES)) forBlock[type] = () => `${syntax.name(name)}()${syntax.terminator}\n`
  for (const [type, name] of Object.entries(SENSOR_TYPES)) forBlock[type] = () => [`${syntax.name(name)}()`, 0]
  forBlock.logic_not_block = (b, g) => [syntax.not(condition(g, b, 'VALUE', falseLiteral)), 0]
  forBlock.repeat_times = (b, g) =>
    syntax.repeat(Math.max(0, Math.floor(Number(b.getFieldValue('TIMES')) || 0)), body(g, b, 'DO', syntax), loopDepth(b))
  forBlock.while_cond = (b, g) => syntax.whileLoop(condition(g, b, 'COND', falseLiteral), body(g, b, 'DO', syntax))
  forBlock.if_else = (b, g) => {
    const elseBody = g.statementToCode(b, 'ELSE')
    return syntax.ifElse(condition(g, b, 'COND', falseLiteral), body(g, b, 'THEN', syntax), elseBody)
  }
  return gen
}

const generators: Partial<Record<Language, Gen>> = {}

/** Gera o código da Linguagem a partir de um programa de Blocos serializado (JSON do Blockly). Função pura. */
export function generateCode(state: BlocklyState, language: Language): string {
  defineBlocks()
  const workspace = new Blockly.Workspace()
  try {
    Blockly.serialization.workspaces.load(state, workspace)
    return generateFromWorkspace(workspace, language)
  } finally {
    workspace.dispose()
  }
}

/** Gera o código a partir de um workspace vivo (usado pela interface). */
export function generateFromWorkspace(workspace: Blockly.Workspace, language: Language): string {
  const gen = (generators[language] ??= makeGenerator(language))
  gen.init(workspace)
  const tops = workspace.getTopBlocks(true).filter((b) => !!b.previousConnection)
  return tops.map((b) => gen.blockToCode(b) as string).join('')
}
