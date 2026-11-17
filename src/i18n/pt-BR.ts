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
} as const

export type TextKey = keyof typeof ptBR

export function t(key: TextKey, params: Record<string, string> = {}): string {
  return Object.entries(params).reduce((s, [k, v]) => s.replace(`{${k}}`, v), ptBR[key] as string)
}
