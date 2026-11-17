import type { Language } from './engine/types'

type LanguageInfo = { name: string; starter: string }

/** Tudo o que a interface precisa saber de cada Linguagem, em um lugar só. */
const LANGUAGES: Record<Language, LanguageInfo> = {
  javascript: {
    name: 'JavaScript',
    starter: `// Chegue à meta usando move(), turnLeft(), turnRight() e pickUp()
move()
`,
  },
  python: {
    name: 'Python',
    starter: `# Chegue à meta usando move(), turnLeft(), turnRight() e pickUp()
move()
`,
  },
  portugol: {
    name: 'Portugol',
    starter: `// Chegue à meta usando andar(), virarEsquerda(), virarDireita() e pegar()
andar()
`,
  },
}

export const AVAILABLE_LANGUAGES: { id: Language; name: string }[] = (Object.keys(LANGUAGES) as Language[]).map(
  (id) => ({ id, name: LANGUAGES[id].name }),
)

/** Linguagens ainda não disponíveis, mostradas como "em breve". */
export const COMING_SOON_LANGUAGES = ['C', 'Java', 'C++', 'Go', 'Rust']

export const starterFor = (language: Language): string => LANGUAGES[language].starter

export const languageName = (language: Language): string => LANGUAGES[language].name
