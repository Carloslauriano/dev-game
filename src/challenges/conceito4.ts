import type { Challenge, Language } from '../engine/types'

/**
 * Conceito 4: repetição com condição (repetir enquanto/até um Sensor). Os mapas têm
 * corredores de comprimento não óbvio, então contar passos fixos não é natural.
 */
const east = (x: number, y: number) => ({ x, y, facing: 'east' as const })

export const conceito4: Challenge[] = [
  {
    // Corredor longo: andar até a meta.
    id: 'repeticao-condicao-1',
    width: 11,
    height: 1,
    start: east(0, 0),
    goal: { x: 10, y: 0 },
    walls: [],
    obstacles: [],
    items: [],
    maxInstructions: 1,
    hint: 'hint_repeticao-condicao-1',
  },
  {
    // Corredor até a parede da borda, com um item no fim.
    id: 'repeticao-condicao-2',
    width: 8,
    height: 1,
    start: east(0, 0),
    goal: { x: 7, y: 0 },
    walls: [],
    obstacles: [],
    items: [{ x: 7, y: 0 }],
    maxInstructions: 2,
    hint: 'hint_repeticao-condicao-2',
  },
  {
    // Dois corredores em L: leste até a parede, depois sul até a parede.
    id: 'repeticao-condicao-3',
    width: 7,
    height: 5,
    start: east(0, 0),
    goal: { x: 5, y: 3 },
    walls: [{ x: 6, y: 0 }, { x: 5, y: 4 }],
    obstacles: [],
    items: [],
    maxInstructions: 4,
    hint: 'hint_repeticao-condicao-3',
  },
  {
    // Três corredores: leste, sul e leste de novo, cada um parando numa parede.
    id: 'repeticao-condicao-4',
    width: 8,
    height: 5,
    start: east(0, 0),
    goal: { x: 7, y: 3 },
    walls: [{ x: 5, y: 0 }, { x: 4, y: 4 }],
    obstacles: [],
    items: [],
    maxInstructions: 5,
    hint: 'hint_repeticao-condicao-4',
  },
  {
    // Contorno do mapa: dentro de um único laço, andar se livre, senão virar à direita.
    id: 'repeticao-condicao-5',
    width: 7,
    height: 6,
    start: east(0, 0),
    goal: { x: 0, y: 2 },
    walls: [],
    obstacles: [],
    items: [],
    maxInstructions: 2,
    hint: 'hint_repeticao-condicao-5',
  },
]

export const conceito4Solutions: Record<string, Record<Language, string>> = {
  'repeticao-condicao-1': {
    javascript: 'while (!atGoal()) {\n  move()\n}\n',
    python: 'while not atGoal():\n    move()\n',
    portugol: 'enquanto (nao naMeta()) {\n  andar()\n}\n',
  },
  'repeticao-condicao-2': {
    javascript: 'while (pathClear()) {\n  move()\n}\npickUp()\n',
    python: 'while pathClear():\n    move()\npickUp()\n',
    portugol: 'enquanto (caminhoLivre()) {\n  andar()\n}\npegar()\n',
  },
  'repeticao-condicao-3': {
    javascript: 'while (pathClear()) {\n  move()\n}\nturnRight()\nwhile (pathClear()) {\n  move()\n}\n',
    python: 'while pathClear():\n    move()\nturnRight()\nwhile pathClear():\n    move()\n',
    portugol:
      'enquanto (caminhoLivre()) {\n  andar()\n}\nvirarDireita()\nenquanto (caminhoLivre()) {\n  andar()\n}\n',
  },
  'repeticao-condicao-4': {
    javascript:
      'while (pathClear()) {\n  move()\n}\nturnRight()\nwhile (pathClear()) {\n  move()\n}\nturnLeft()\nwhile (pathClear()) {\n  move()\n}\n',
    python:
      'while pathClear():\n    move()\nturnRight()\nwhile pathClear():\n    move()\nturnLeft()\nwhile pathClear():\n    move()\n',
    portugol:
      'enquanto (caminhoLivre()) {\n  andar()\n}\nvirarDireita()\nenquanto (caminhoLivre()) {\n  andar()\n}\nvirarEsquerda()\nenquanto (caminhoLivre()) {\n  andar()\n}\n',
  },
  'repeticao-condicao-5': {
    javascript: 'while (!atGoal()) {\n  if (pathClear()) {\n    move()\n  } else {\n    turnRight()\n  }\n}\n',
    python: 'while not atGoal():\n    if pathClear():\n        move()\n    else:\n        turnRight()\n',
    portugol:
      'enquanto (nao naMeta()) {\n  se (caminhoLivre()) {\n    andar()\n  } senao {\n    virarDireita()\n  }\n}\n',
  },
}
