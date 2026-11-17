import { useEffect, useMemo, useRef, useState } from 'react'
import { runChallenge } from '../engine/runChallenge'
import { replay, type Frame } from '../engine/replay'
import type { Language, RunResult } from '../engine/types'
import { firstChallenge } from '../challenges/first'
import { languageName, starterFor } from '../languages'
import { LanguagePicker } from './LanguagePicker'
import { t } from '../i18n/pt-BR'
import { BlocksEditor } from './BlocksEditor'
import { generateCode } from '../blocks/generators'
import { Board } from './Board'
import { Stars } from './Stars'
import { loadStars, saveStars } from './progress'
import type { Star } from '../engine/types'

const challenge = firstChallenge
const initialFrame = (): Frame => replay(challenge, [])[0]
const BASE_MS = 600

export function App() {
  const [language, setLanguage] = useState<Language | null>(null)
  // O código é guardado por Linguagem: trocar de Linguagem não perde o que foi escrito.
  const [codes, setCodes] = useState<Partial<Record<Language, string>>>({})
  const [mode, setMode] = useState<'blocks' | 'code'>('blocks')
  const [blockState, setBlockState] = useState<object | null>(null)
  // No modo Blocos o código é o equivalente gerado na Linguagem escolhida.
  const blockCode = useMemo(
    () => (language && blockState ? generateCode(blockState, language) : ''),
    [language, blockState],
  )
  const typedCode = language ? (codes[language] ?? starterFor(language)) : ''
  const code = mode === 'blocks' ? blockCode : typedCode
  const setCode = (c: string) => language && setCodes((prev) => ({ ...prev, [language]: c }))
  const [frames, setFrames] = useState<Frame[]>([initialFrame()])
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [busy, setBusy] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [message, setMessage] = useState('')
  const [earned, setEarned] = useState<Star[]>(() => loadStars(challenge.id))
  const [hintShown, setHintShown] = useState(false)
  const result = useRef<RunResult | null>(null)

  const reset = (msg = '') => {
    setPlaying(false)
    setBusy(false)
    setFrames([initialFrame()])
    setIndex(0)
    setMessage(msg)
    result.current = null
  }

  const run = async () => {
    reset()
    setBusy(true)
    setMessage(t('running'))
    try {
      const r = await runChallenge(challenge, language!, code, undefined, undefined, hintShown)
      result.current = r
      setFrames(replay(challenge, r.actions))
      setIndex(0)
      setMessage('')
      setPlaying(true)
    } catch (e) {
      reset(t('failed', { reason: (e as Error).message }))
    }
  }

  const finished = frames.length > 1 && index >= frames.length - 1

  useEffect(() => {
    if (!playing) return
    if (finished) {
      setPlaying(false)
      const r = result.current
      if (r?.status === 'solved') {
        setBusy(false)
        setMessage(t('solved'))
        setEarned(saveStars(challenge.id, r.stars))
      } else {
        // Falhar reinicia o Desafio sem punição.
        reset(t('failed', { reason: r?.reason ?? '' }))
      }
      return
    }
    const id = setTimeout(() => setIndex((i) => i + 1), BASE_MS / speed)
    return () => clearTimeout(id)
  }, [playing, index, finished, speed])

  const askHint = () => {
    // O custo é avisado antes; a Dica fica visível pelo resto da sessão do Desafio.
    if (window.confirm(t('hintWarning'))) setHintShown(true)
  }

  const canPause = busy && frames.length > 1 && !finished

  if (!language) {
    return (
      <main style={{ fontFamily: 'monospace', padding: 16, maxWidth: 960 }}>
        <h1>{t('title')}</h1>
        <h2>{t('chooseLanguage')}</h2>
        <LanguagePicker value={null} onChange={setLanguage} />
      </main>
    )
  }

  return (
    <main style={{ fontFamily: 'monospace', padding: 16, maxWidth: 960 }}>
      <h1>{t('title')}</h1>
      <details>
        <summary>{t('settings')}</summary>
        <LanguagePicker
          value={language}
          onChange={(l) => {
            reset()
            setLanguage(l)
          }}
        />
      </details>
      <h2>{t('challenge')}</h2>
      <Board challenge={challenge} frame={frames[index]} />
      <p role="status">{message}</p>
      <Stars earned={earned} />
      {challenge.hint && (
        hintShown ? (
          <p role="note"><strong>{t('hintLabel')}:</strong> {challenge.hint}</p>
        ) : (
          <button onClick={askHint} title={t('hintWarning')}>{t('hintButton')}</button>
        )
      )}
      <div role="radiogroup" aria-label={t('editorMode')} style={{ display: 'flex', gap: 8 }}>
        {(['blocks', 'code'] as const).map((m) => (
          <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>
            {mode === m ? '● ' : ''}
            {m === 'blocks' ? t('editorBlocks') : t('editorCode')}
          </button>
        ))}
      </div>
      {mode === 'blocks' ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 2 }}>
            <BlocksEditor initialState={blockState} onChange={setBlockState} />
          </div>
          <label style={{ flex: 1 }}>
            {t('generatedCode', { language: languageName(language) })}
            <pre style={{ margin: 0 }}>{blockCode}</pre>
          </label>
        </div>
      ) : (
        <label>
          {t('codeLabel', { language: languageName(language) })}
          <textarea
            value={typedCode}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            style={{ display: 'block', width: '100%', fontFamily: 'monospace' }}
          />
        </label>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <button onClick={run} disabled={busy}>{t('run')}</button>
        <button onClick={() => setPlaying((p) => !p)} disabled={!canPause}>
          {playing ? t('pause') : t('resume')}
        </button>
        <button onClick={() => reset()}>{t('reset')}</button>
        <label>
          {t('speed')}: {speed}x{' '}
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.5}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>
      </div>
    </main>
  )
}
