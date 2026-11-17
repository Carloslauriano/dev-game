import type { Challenge, Language } from '../engine/types'

/**
 * Conceito 5: variáveis (guardar um número e reusá-lo: contadores, passos contados).
 * A partir deste Conceito o jogador escreve código digitado; não existem Blocos de variável.
 */
const east = (x: number, y: number) => ({ x, y, facing: 'east' as const })

export const conceito5: Challenge[] = [
  {
    // Guardar o número de passos numa variável e repetir essa quantidade.
    id: 'variaveis-1',
    width: 6,
    height: 1,
    start: east(0, 0),
    goal: { x: 5, y: 0 },
    walls: [],
    obstacles: [],
    items: [],
    maxInstructions: 1,
    hint: 'hint_variaveis-1',
  },
  {
    // Mesma variável usada nos dois lados de um L.
    id: 'variaveis-2',
    width: 4,
    height: 4,
    start: east(0, 0),
    goal: { x: 3, y: 3 },
    walls: [],
    obstacles: [],
    items: [],
    maxInstructions: 3,
    hint: 'hint_variaveis-2',
  },
  {
    // Contar os passos até a parede e reusar a contagem.
    id: 'variaveis-3',
    width: 6,
    height: 6,
    start: east(0, 0),
    goal: { x: 5, y: 5 },
    walls: [],
    obstacles: [],
    items: [],
    maxInstructions: 3,
    hint: 'hint_variaveis-3',
  },
  {
    // Contar um lado e percorrer mais dois lados do mesmo tamanho.
    id: 'variaveis-4',
    width: 5,
    height: 5,
    start: east(0, 0),
    goal: { x: 0, y: 4 },
    walls: [],
    obstacles: [],
    items: [],
    maxInstructions: 3,
    hint: 'hint_variaveis-4',
  },
  {
    // Contador de itens coletados, reusado para decidir quantos passos dar no fim.
    id: 'variaveis-5',
    width: 9,
    height: 4,
    start: east(0, 0),
    goal: { x: 8, y: 3 },
    walls: [],
    obstacles: [],
    items: [{ x: 1, y: 0 }, { x: 3, y: 0 }, { x: 5, y: 0 }],
    maxInstructions: 4,
    hint: 'hint_variaveis-5',
  },
]

export const conceito5Solutions: Record<string, Record<Language, string>> = {
  'variaveis-1': {
    javascript: 'let passos = 5\nfor (let i = 0; i < passos; i++) {\n  move()\n}\n',
    python: 'passos = 5\nfor i in range(passos):\n    move()\n',
    portugol: 'inteiro passos = 5\npara (inteiro i = 0; i < passos; i++) {\n  andar()\n}\n',
  },
  'variaveis-2': {
    javascript:
      'let lado = 3\nfor (let i = 0; i < lado; i++) {\n  move()\n}\nturnRight()\nfor (let i = 0; i < lado; i++) {\n  move()\n}\n',
    python: 'lado = 3\nfor i in range(lado):\n    move()\nturnRight()\nfor i in range(lado):\n    move()\n',
    portugol:
      'inteiro lado = 3\npara (inteiro i = 0; i < lado; i++) {\n  andar()\n}\nvirarDireita()\npara (inteiro i = 0; i < lado; i++) {\n  andar()\n}\n',
  },
  'variaveis-3': {
    javascript:
      'let passos = 0\nwhile (pathClear()) {\n  move()\n  passos += 1\n}\nturnRight()\nfor (let i = 0; i < passos; i++) {\n  move()\n}\n',
    python:
      'passos = 0\nwhile pathClear():\n    move()\n    passos += 1\nturnRight()\nfor i in range(passos):\n    move()\n',
    portugol:
      'inteiro passos = 0\nenquanto (caminhoLivre()) {\n  andar()\n  passos += 1\n}\nvirarDireita()\npara (inteiro i = 0; i < passos; i++) {\n  andar()\n}\n',
  },
  'variaveis-4': {
    javascript:
      'let lado = 0\nwhile (pathClear()) {\n  move()\n  lado += 1\n}\nfor (let k = 0; k < 2; k++) {\n  turnRight()\n  for (let i = 0; i < lado; i++) {\n    move()\n  }\n}\n',
    python:
      'lado = 0\nwhile pathClear():\n    move()\n    lado += 1\nfor k in range(2):\n    turnRight()\n    for i in range(lado):\n        move()\n',
    portugol:
      'inteiro lado = 0\nenquanto (caminhoLivre()) {\n  andar()\n  lado += 1\n}\npara (inteiro k = 0; k < 2; k++) {\n  virarDireita()\n  para (inteiro i = 0; i < lado; i++) {\n    andar()\n  }\n}\n',
  },
  'variaveis-5': {
    javascript:
      'let coletados = 0\nwhile (pathClear()) {\n  if (hasItem()) {\n    pickUp()\n    coletados += 1\n  }\n  move()\n}\nturnRight()\nfor (let i = 0; i < coletados; i++) {\n  move()\n}\n',
    python:
      'coletados = 0\nwhile pathClear():\n    if hasItem():\n        pickUp()\n        coletados += 1\n    move()\nturnRight()\nfor i in range(coletados):\n    move()\n',
    portugol:
      'inteiro coletados = 0\nenquanto (caminhoLivre()) {\n  se (temItem()) {\n    pegar()\n    coletados += 1\n  }\n  andar()\n}\nvirarDireita()\npara (inteiro i = 0; i < coletados; i++) {\n  andar()\n}\n',
  },
}
