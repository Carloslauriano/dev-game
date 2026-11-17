import type { Language } from '../engine/types'

/** Soluções de referência dos Desafios do Conceito 3, por id e Linguagem. */
export const condicaoSolutions: Record<string, Record<Language, string>> = {
  'condicao-1': {
    javascript: `move()
if (pathClear()) {
  move()
  move()
} else {
  turnRight()
  move()
  turnLeft()
  move()
  move()
  turnLeft()
  move()
  turnRight()
}
`,
    python: `move()
if pathClear():
    move()
    move()
else:
    turnRight()
    move()
    turnLeft()
    move()
    move()
    turnLeft()
    move()
    turnRight()
`,
    portugol: `andar()
se (caminhoLivre()) {
  andar()
  andar()
} senao {
  virarDireita()
  andar()
  virarEsquerda()
  andar()
  andar()
  virarEsquerda()
  andar()
  virarDireita()
}
`,
  },
  'condicao-2': {
    javascript: `for (let i = 0; i < 5; i++) {
  if (hasItem()) {
    pickUp()
  }
  move()
}
`,
    python: `for i in range(5):
    if hasItem():
        pickUp()
    move()
`,
    portugol: `para (inteiro i = 0; i < 5; i++) {
  se (temItem()) {
    pegar()
  }
  andar()
}
`,
  },
  'condicao-3': {
    javascript: `for (let i = 0; i < 20; i++) {
  if (!atGoal()) {
    if (pathClear()) {
      move()
    } else {
      turnRight()
    }
  }
}
`,
    python: `for i in range(20):
    if not atGoal():
        if pathClear():
            move()
        else:
            turnRight()
`,
    portugol: `para (inteiro i = 0; i < 20; i++) {
  se (nao naMeta()) {
    se (caminhoLivre()) {
      andar()
    } senao {
      virarDireita()
    }
  }
}
`,
  },
  'condicao-4': {
    javascript: `for (let i = 0; i < 10; i++) {
  if (atGoal()) {
    // nada a fazer
  } else if (hasItem()) {
    pickUp()
  } else if (pathClear()) {
    move()
  } else {
    turnRight()
    move()
    turnLeft()
    move()
    move()
    turnLeft()
    move()
    turnRight()
  }
}
`,
    python: `for i in range(10):
    if atGoal():
        pass
    elif hasItem():
        pickUp()
    elif pathClear():
        move()
    else:
        turnRight()
        move()
        turnLeft()
        move()
        move()
        turnLeft()
        move()
        turnRight()
`,
    portugol: `para (inteiro i = 0; i < 10; i++) {
  se (naMeta()) {
    // nada a fazer
  } senao se (temItem()) {
    pegar()
  } senao se (caminhoLivre()) {
    andar()
  } senao {
    virarDireita()
    andar()
    virarEsquerda()
    andar()
    andar()
    virarEsquerda()
    andar()
    virarDireita()
  }
}
`,
  },
  'condicao-5': {
    javascript: `for (let i = 0; i < 30; i++) {
  if (atGoal()) {
    // chegou
  } else if (hasItem()) {
    pickUp()
  } else if (pathClear()) {
    move()
  } else {
    turnRight()
  }
}
`,
    python: `for i in range(30):
    if atGoal():
        pass
    elif hasItem():
        pickUp()
    elif pathClear():
        move()
    else:
        turnRight()
`,
    portugol: `para (inteiro i = 0; i < 30; i++) {
  se (naMeta()) {
    // chegou
  } senao se (temItem()) {
    pegar()
  } senao se (caminhoLivre()) {
    andar()
  } senao {
    virarDireita()
  }
}
`,
  },
}
