import type { Language } from '../engine/types'

type Solutions = Record<Language, string>

/** Soluções de referência do Conceito 1, na mesma ordem de `conceito1Challenges`. */
export const conceito1Solutions: Solutions[] = [
  {
    javascript: 'move()\nmove()\nmove()\n',
    python: 'move()\nmove()\nmove()\n',
    portugol: 'andar()\nandar()\nandar()\n',
  },
  {
    javascript: 'move()\nmove()\nturnRight()\nmove()\nmove()\n',
    python: 'move()\nmove()\nturnRight()\nmove()\nmove()\n',
    portugol: 'andar()\nandar()\nvirarDireita()\nandar()\nandar()\n',
  },
  {
    javascript: 'move()\nmove()\nmove()\npickUp()\nturnRight()\nmove()\nmove()\n',
    python: 'move()\nmove()\nmove()\npickUp()\nturnRight()\nmove()\nmove()\n',
    portugol: 'andar()\nandar()\nandar()\npegar()\nvirarDireita()\nandar()\nandar()\n',
  },
  {
    javascript:
      'turnLeft()\nmove()\nturnRight()\nmove()\nmove()\nmove()\nturnRight()\nmove()\nturnLeft()\nmove()\n',
    python:
      'turnLeft()\nmove()\nturnRight()\nmove()\nmove()\nmove()\nturnRight()\nmove()\nturnLeft()\nmove()\n',
    portugol:
      'virarEsquerda()\nandar()\nvirarDireita()\nandar()\nandar()\nandar()\nvirarDireita()\nandar()\nvirarEsquerda()\nandar()\n',
  },
  {
    javascript:
      'move()\nmove()\nmove()\npickUp()\nturnRight()\nmove()\nmove()\nturnRight()\nmove()\nmove()\npickUp()\nturnLeft()\nmove()\nmove()\nmove()\nturnLeft()\nmove()\n',
    python:
      'move()\nmove()\nmove()\npickUp()\nturnRight()\nmove()\nmove()\nturnRight()\nmove()\nmove()\npickUp()\nturnLeft()\nmove()\nmove()\nmove()\nturnLeft()\nmove()\n',
    portugol:
      'andar()\nandar()\nandar()\npegar()\nvirarDireita()\nandar()\nandar()\nvirarDireita()\nandar()\nandar()\npegar()\nvirarEsquerda()\nandar()\nandar()\nandar()\nvirarEsquerda()\nandar()\n',
  },
]
