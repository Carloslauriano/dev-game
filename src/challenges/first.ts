import type { Challenge } from '../engine/types'

/** Desafio de exemplo (dados puros): chegar à meta contornando uma parede. */
export const firstChallenge: Challenge = {
  id: 'sequencia-1',
  width: 5,
  height: 4,
  start: { x: 0, y: 0, facing: 'east' },
  goal: { x: 4, y: 0 },
  walls: [{ x: 2, y: 0 }, { x: 2, y: 1 }],
  obstacles: [{ x: 3, y: 2 }],
  items: [{ x: 1, y: 2 }],
  maxInstructions: 13,
  hint: 'Dica de exemplo: a parede bloqueia o caminho reto. Que tal contorná-la por baixo?',
}

export const starterCode = `// Chegue à meta usando move(), turnLeft(), turnRight() e pickUp()
move()
`
