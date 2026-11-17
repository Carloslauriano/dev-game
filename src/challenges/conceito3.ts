import type { Challenge } from '../engine/types'

/** Conceito 3 (condição: se/senão com Sensores). Dificuldade crescente. */

/** 1. Um se/senão: contornar a parede só se o caminho estiver bloqueado. */
const condicao1: Challenge = {
  id: 'condicao-1',
  width: 4,
  height: 2,
  start: { x: 0, y: 0, facing: 'east' },
  goal: { x: 3, y: 0 },
  walls: [{ x: 2, y: 0 }],
  obstacles: [],
  items: [],
  maxInstructions: 11,
  hint: 'Depois do primeiro passo, pergunte ao Sensor: o caminho está livre? Se sim, siga em frente; senão, contorne a parede por baixo.',
}

/** 2. Sensor de item: pegar só onde há item. */
const condicao2: Challenge = {
  id: 'condicao-2',
  width: 6,
  height: 1,
  start: { x: 0, y: 0, facing: 'east' },
  goal: { x: 5, y: 0 },
  walls: [],
  obstacles: [],
  items: [{ x: 2, y: 0 }, { x: 4, y: 0 }],
  maxInstructions: 2,
  hint: 'Repita: se tem item aqui, pegue; depois ande. Pegar onde não há item não ajuda.',
}

/** 3. Seguir a borda: andar se livre, senão virar; parar na meta. */
const condicao3: Challenge = {
  id: 'condicao-3',
  width: 4,
  height: 4,
  start: { x: 0, y: 0, facing: 'east' },
  goal: { x: 0, y: 3 },
  walls: [],
  obstacles: [],
  items: [],
  maxInstructions: 2,
  hint: 'Repita várias vezes: se não está na meta, então (se o caminho está livre, ande; senão, vire à direita).',
}

/** 4. Dois Sensores juntos: itens e obstáculos no caminho. */
const condicao4: Challenge = {
  id: 'condicao-4',
  width: 7,
  height: 3,
  start: { x: 0, y: 1, facing: 'east' },
  goal: { x: 6, y: 1 },
  walls: [],
  obstacles: [{ x: 2, y: 1 }, { x: 5, y: 1 }],
  items: [{ x: 1, y: 1 }, { x: 4, y: 1 }],
  maxInstructions: 10,
  hint: 'A cada passo: na meta, nada; tem item, pegue; caminho livre, ande; senão, contorne o obstáculo por baixo.',
}

/** 5. Espiral com itens: andar, pegar ou virar, conforme os Sensores. */
const condicao5: Challenge = {
  id: 'condicao-5',
  width: 5,
  height: 5,
  start: { x: 0, y: 0, facing: 'east' },
  goal: { x: 2, y: 2 },
  walls: [
    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
    { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 },
  ],
  obstacles: [],
  items: [{ x: 4, y: 0 }, { x: 4, y: 2 }, { x: 2, y: 4 }],
  maxInstructions: 3,
  hint: 'Siga a parede em espiral: se está na meta, pare; se tem item, pegue; se o caminho está livre, ande; senão, vire à direita.',
}

export const condicaoChallenges: Challenge[] = [condicao1, condicao2, condicao3, condicao4, condicao5]
