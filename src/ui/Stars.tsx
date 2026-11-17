import type { Star } from '../engine/types'
import { t, type TextKey } from '../i18n/pt-BR'

const SLOTS: { star: Star; label: TextKey }[] = [
  { star: 'solved', label: 'starSolved' },
  { star: 'fewInstructions', label: 'starFewInstructions' },
  { star: 'noHint', label: 'starNoHint' },
]

/** Estrelas do Desafio. Mostra só as Estrelas disponíveis (sem Dica ainda não existe). */
export function Stars({ earned }: { earned: Star[] }) {
  const slots = SLOTS.filter((s) => s.star !== 'noHint')
  return (
    <p aria-label={`${t('starsLabel')}: ${earned.length}`}>
      {t('starsLabel')}:{' '}
      {slots.map(({ star, label }) => (
        <span key={star} title={t(label)} style={{ opacity: earned.includes(star) ? 1 : 0.3 }}>
          {earned.includes(star) ? '★' : '☆'}
        </span>
      ))}
    </p>
  )
}
