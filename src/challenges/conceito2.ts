import type { Challenge, Language } from '../engine/types'

/**
 * Conceito 2: repetição com contagem (repetir N vezes). Dificuldade crescente:
 * corredor reto, coleta repetida, escada, anel com itens e cobra de 3 voltas.
 */
export const conceito2Challenges: Challenge[] = [
  {
    id: 'repeticao-1',
    width: 8,
    height: 1,
    start: { x: 0, y: 0, facing: 'east' },
    goal: { x: 7, y: 0 },
    walls: [],
    obstacles: [],
    items: [],
    maxInstructions: 1,
    hint: 'hint_repeticao-1',
  },
  {
    id: 'repeticao-2',
    width: 7,
    height: 1,
    start: { x: 0, y: 0, facing: 'east' },
    goal: { x: 6, y: 0 },
    walls: [],
    obstacles: [],
    items: [{ x: 2, y: 0 }, { x: 4, y: 0 }, { x: 6, y: 0 }],
    maxInstructions: 3,
    hint: 'hint_repeticao-2',
  },
  {
    id: 'repeticao-3',
    width: 5,
    height: 5,
    start: { x: 0, y: 0, facing: 'east' },
    goal: { x: 4, y: 4 },
    walls: [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }],
    obstacles: [{ x: 2, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 2 }],
    items: [],
    maxInstructions: 4,
    hint: 'hint_repeticao-3',
  },
  {
    id: 'repeticao-4',
    width: 4,
    height: 4,
    start: { x: 0, y: 0, facing: 'east' },
    goal: { x: 0, y: 3 },
    walls: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
    obstacles: [],
    items: [{ x: 3, y: 0 }, { x: 3, y: 3 }, { x: 0, y: 3 }],
    maxInstructions: 5,
    hint: 'hint_repeticao-4',
  },
  {
    id: 'repeticao-5',
    width: 4,
    height: 7,
    start: { x: 0, y: 0, facing: 'east' },
    goal: { x: 0, y: 6 },
    walls: [],
    obstacles: [{ x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }],
    items: [],
    maxInstructions: 12,
    hint: 'hint_repeticao-5',
  },
]

type Solutions = Record<Language, string>

const loop = (n: number, js: string, py: string, pt: string): Solutions => ({
  javascript: `for (let i = 0; i < ${n}; i++) {\n${js}\n}\n`,
  python: `for _ in range(${n}):\n${py}\n`,
  portugol: `para (inteiro i = 0; i < ${n}; i++) {\n${pt}\n}\n`,
})

/** Soluções de referência (laço contado) em cada Linguagem, por id de Desafio. */
export const conceito2Solutions: Record<string, Solutions> = {
  'repeticao-1': loop(7, '  move()', '    move()', '  andar()'),
  'repeticao-2': loop(3, '  move()\n  move()\n  pickUp()', '    move()\n    move()\n    pickUp()', '  andar()\n  andar()\n  pegar()'),
  'repeticao-3': loop(
    4,
    '  move()\n  turnRight()\n  move()\n  turnLeft()',
    '    move()\n    turnRight()\n    move()\n    turnLeft()',
    '  andar()\n  virarDireita()\n  andar()\n  virarEsquerda()',
  ),
  'repeticao-4': loop(
    3,
    '  move()\n  move()\n  move()\n  pickUp()\n  turnRight()',
    '    move()\n    move()\n    move()\n    pickUp()\n    turnRight()',
    '  andar()\n  andar()\n  andar()\n  pegar()\n  virarDireita()',
  ),
  'repeticao-5': loop(
    3,
    '  move(); move(); move()\n  turnRight(); move(); turnRight()\n  move(); move(); move()\n  turnLeft(); move(); turnLeft()',
    '    move(); move(); move()\n    turnRight(); move(); turnRight()\n    move(); move(); move()\n    turnLeft(); move(); turnLeft()',
    '  andar() andar() andar()\n  virarDireita() andar() virarDireita()\n  andar() andar() andar()\n  virarEsquerda() andar() virarEsquerda()',
  ),
}

/** Para o registro: Desafios do Conceito 2 por id. */
export const conceito2ById: Record<string, Challenge> = Object.fromEntries(conceito2Challenges.map((c) => [c.id, c]))
