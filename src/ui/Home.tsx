import { useState } from 'react'
import { unlockedFlags, solvedCount } from '../engine/concepts'
import { concepts, playableChallenges } from '../challenges/concepts'
import { t, type TextKey } from '../i18n/pt-BR'
import { App } from './App'
import { loadStars } from './progress'

const difficulties: { id: string; label: TextKey; available: boolean }[] = [
  { id: 'challenger', label: 'difficultyChallenger', available: true },
  { id: 'soon-1', label: 'difficultySoon', available: false },
  { id: 'soon-2', label: 'difficultySoon', available: false },
]

const isSolved = (id: string) => loadStars(id).includes('solved')

type Screen = { name: 'difficulty' } | { name: 'concepts' } | { name: 'play'; challengeId: string }

/** Fluxo: Dificuldade -> Conceitos -> Desafio. */
export function Home() {
  const [screen, setScreen] = useState<Screen>({ name: 'difficulty' })

  if (screen.name === 'play') {
    return (
      <>
        <button onClick={() => setScreen({ name: 'concepts' })} style={{ margin: 16 }}>
          {t('back')}
        </button>
        <App />
      </>
    )
  }

  const notice = <p role="note">{t('storageNotice')}</p>

  if (screen.name === 'difficulty') {
    return (
      <main style={{ fontFamily: 'monospace', padding: 16, maxWidth: 720 }}>
        <h1>{t('title')}</h1>
        <h2>{t('chooseDifficulty')}</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {difficulties.map((d) => (
            <li key={d.id} style={{ marginBottom: 8 }}>
              <button className={d.id === 'challenger' ? 'challenger-name' : undefined} disabled={!d.available} onClick={() => setScreen({ name: 'concepts' })}>
                {t(d.label)}
              </button>
              {!d.available && <small> ({t('comingSoon')})</small>}
            </li>
          ))}
        </ul>
        {notice}
      </main>
    )
  }

  const flags = unlockedFlags(concepts, isSolved)
  return (
    <main style={{ fontFamily: 'monospace', padding: 16, maxWidth: 720 }}>
      <h1>{t('title')}</h1>
      <h2 className="challenger-name">{t('difficultyChallenger')}</h2>
      <button onClick={() => setScreen({ name: 'difficulty' })}>{t('back')}</button>
      {concepts.map((c, i) => (
        <section key={c.id} aria-label={t(`concept_${c.id}` as TextKey)} style={{ opacity: flags[i] ? 1 : 0.5 }}>
          <h3>
            {t(`concept_${c.id}` as TextKey)}{' '}
            <small>
              {flags[i]
                ? `${solvedCount(c, isSolved)}/${c.challengeIds.length}`
                : t('locked', { previous: t(`concept_${concepts[i - 1].id}` as TextKey) })}
            </small>
          </h3>
          {flags[i] && (
            <ol>
              {c.challengeIds.map((id) => (
                <li key={id}>
                  {id in playableChallenges ? (
                    <button onClick={() => setScreen({ name: 'play', challengeId: id })}>
                      {t('challenge')} {id} {isSolved(id) ? '✓' : ''}
                    </button>
                  ) : (
                    <span>
                      {t('challenge')} {id} ({t('comingSoon')})
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>
      ))}
      {notice}
    </main>
  )
}
