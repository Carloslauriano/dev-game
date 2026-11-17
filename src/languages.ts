import type { Language } from './engine/types'
import { starterCode as jsStarter } from './challenges/first'

export const AVAILABLE_LANGUAGES: { id: Language; name: string }[] = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'portugol', name: 'Portugol' },
]

/** Linguagens ainda não disponíveis, mostradas como "em breve". */
export const COMING_SOON_LANGUAGES = ['C', 'Java', 'C++', 'Go', 'Rust']

const pythonStarter = `# Chegue à meta usando move(), turnLeft(), turnRight() e pickUp()
move()
`

const portugolStarter = `// Chegue à meta usando andar(), virarEsquerda(), virarDireita() e pegar()
andar()
`

export const starterFor = (language: Language): string =>
  language === 'python' ? pythonStarter : language === 'portugol' ? portugolStarter : jsStarter

export const languageName = (language: Language): string =>
  AVAILABLE_LANGUAGES.find((l) => l.id === language)!.name
