/** Textos da interface em português do Brasil. Novos idiomas entram como novos arquivos neste formato. */
export const ptBR = {
  title: 'Dev Game',
  challenge: 'Desafio',
  codeLabel: 'Seu código (JavaScript)',
  run: 'Executar',
  pause: 'Pausar',
  resume: 'Continuar',
  reset: 'Reiniciar',
  speed: 'Velocidade',
  solved: 'Desafio resolvido!',
  failed: 'Não deu desta vez: {reason}. O Desafio foi reiniciado, tente de novo!',
  running: 'Executando...',
  goalAria: 'meta',
  itemAria: 'item',
  wallAria: 'parede',
  obstacleAria: 'obstáculo',
  characterAria: 'personagem',
  starsLabel: 'Estrelas',
  starSolved: 'resolveu o Desafio',
  starFewInstructions: 'poucas instruções',
  starNoHint: 'sem Dica',
  chooseDifficulty: 'Escolha a Dificuldade',
  difficultyChallenger: 'Here Comes a New Challenger',
  difficultySoon: 'Outra Dificuldade',
  comingSoon: 'em breve',
  back: 'Voltar',
  locked: 'Fechado: resolva 3 de 5 Desafios de {previous}',
  storageNotice: 'Seu progresso fica salvo só neste navegador. Se você limpar os dados do navegador ou usar outro, ele não vai junto.',
  concept_sequencia: 'Sequência',
  concept_repeticao: 'Repetição',
  concept_condicao: 'Condição',
  'concept_repeticao-condicao': 'Repetição com condição',
  concept_variaveis: 'Variáveis',
} as const

export type TextKey = keyof typeof ptBR

export function t(key: TextKey, params: Record<string, string> = {}): string {
  return Object.entries(params).reduce((s, [k, v]) => s.replace(`{${k}}`, v), ptBR[key] as string)
}
