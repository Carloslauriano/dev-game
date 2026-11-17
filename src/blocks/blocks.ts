import * as Blockly from 'blockly/core'
import { t } from '../i18n/pt-BR'

const START_COLOUR = 160
const ACTION_COLOUR = 210
const LOOP_COLOUR = 120
const LOGIC_COLOUR = 40
const SENSOR_COLOUR = 290

const action = (type: string, message: string) => ({
  type,
  message0: message,
  previousStatement: null,
  nextStatement: null,
  colour: ACTION_COLOUR,
})

const sensor = (type: string, message: string) => ({
  type,
  message0: message,
  output: 'Boolean',
  colour: SENSOR_COLOUR,
})

let defined = false

/** Registra os Blocos do jogo no Blockly (idempotente). Rótulos vêm do arquivo de tradução. */
export function defineBlocks(): void {
  if (defined) return
  defined = true
  Blockly.common.defineBlocksWithJsonArray([
    // Ponto de partida do programa: só os blocos encaixados abaixo dele são executados.
    { type: 'start', message0: t('block_start'), nextStatement: null, colour: START_COLOUR },
    action('action_move', t('block_move')),
    action('action_turn_left', t('block_turnLeft')),
    action('action_turn_right', t('block_turnRight')),
    action('action_pick_up', t('block_pickUp')),
    {
      type: 'repeat_times',
      message0: `${t('block_repeat')} %2 ${t('block_do')} %3`,
      args0: [
        { type: 'field_number', name: 'TIMES', value: 2, min: 0, precision: 1 },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: LOOP_COLOUR,
    },
    {
      type: 'while_cond',
      message0: `${t('block_while')} %2 ${t('block_do')} %3`,
      args0: [
        { type: 'input_value', name: 'COND', check: 'Boolean' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: LOOP_COLOUR,
    },
    {
      type: 'if_else',
      message0: `${t('block_if')} %2 ${t('block_then')} %3 ${t('block_else')} %4`,
      args0: [
        { type: 'input_value', name: 'COND', check: 'Boolean' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'THEN' },
        { type: 'input_statement', name: 'ELSE' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: LOGIC_COLOUR,
    },
    {
      type: 'logic_not_block',
      message0: t('block_not'),
      args0: [{ type: 'input_value', name: 'VALUE', check: 'Boolean' }],
      output: 'Boolean',
      colour: LOGIC_COLOUR,
    },
    sensor('sensor_path_clear', t('block_pathClear')),
    sensor('sensor_has_item', t('block_hasItem')),
    sensor('sensor_at_goal', t('block_atGoal')),
  ])
}

const block = (type: string) => ({ kind: 'block', type })

export const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    { kind: 'category', name: t('toolbox_actions'), colour: String(ACTION_COLOUR), contents: [
      block('action_move'), block('action_turn_left'), block('action_turn_right'), block('action_pick_up'),
    ] },
    { kind: 'category', name: t('toolbox_loops'), colour: String(LOOP_COLOUR), contents: [
      block('repeat_times'), block('while_cond'),
    ] },
    { kind: 'category', name: t('toolbox_conditions'), colour: String(LOGIC_COLOUR), contents: [
      block('if_else'), block('logic_not_block'),
    ] },
    { kind: 'category', name: t('toolbox_sensors'), colour: String(SENSOR_COLOUR), contents: [
      block('sensor_path_clear'), block('sensor_has_item'), block('sensor_at_goal'),
    ] },
  ],
}
