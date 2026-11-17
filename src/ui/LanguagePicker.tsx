import type { Language } from '../engine/types'
import { AVAILABLE_LANGUAGES, COMING_SOON_LANGUAGES } from '../languages'
import { t } from '../i18n/pt-BR'

/** Escolha de Linguagem: usada na tela inicial e nas configurações. */
export function LanguagePicker({
  value,
  onChange,
}: {
  value: Language | null
  onChange: (language: Language) => void
}) {
  return (
    <div role="radiogroup" aria-label={t('languageLabel')} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {AVAILABLE_LANGUAGES.map((l) => (
        <button key={l.id} role="radio" aria-checked={value === l.id} onClick={() => onChange(l.id)}>
          {value === l.id ? '● ' : ''}
          {l.name}
        </button>
      ))}
      {COMING_SOON_LANGUAGES.map((name) => (
        <button key={name} role="radio" aria-checked={false} disabled>
          {name} ({t('comingSoon')})
        </button>
      ))}
    </div>
  )
}
