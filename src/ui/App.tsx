import { useEffect, useMemo, useRef, useState } from 'react'
import { runChallenge } from '../engine/runChallenge'
import { replay, type Frame } from '../engine/replay'
import type { Language, RunResult } from '../engine/types'
import { languageName, starterFor } from '../languages'
import { LanguagePicker } from './LanguagePicker'
import { t, type TextKey } from '../i18n/pt-BR'
import { failureText } from '../i18n/failureText'
import { BlocksEditor } from './BlocksEditor'
import { generateCode, type BlocklyState } from '../blocks/generators'
import { Board, CELL } from './Board'
import { offersBlocks, rememberBlockCode, migratedCodeFor } from './editorMode'
import { playableChallenges } from '../challenges/concepts'
import { Stars } from './Stars'
import { loadStars, recordResult } from './progress'
import type { Star } from '../engine/types'

const BASE_MS = 600

type AppProps = {
  challengeId: string
  /** Linguagem escolhida (guardada acima, em Home, e persistida). Null: ainda não escolheu. */
  language: Language | null
  onLanguageChange: (language: Language) => void
  /** Código digitado deste Desafio, por Linguagem; guardado acima para não se perder ao voltar. */
  codes: Partial<Record<Language, string>>
  onCodesChange: (codes: Partial<Record<Language, string>>) => void
}

export function App({ challengeId, language, onLanguageChange, codes, onCodesChange }: AppProps) {
  const challenge = playableChallenges[challengeId]
  const blocksOffered = offersBlocks(challenge.id)
  const initialFrame = (): Frame => replay(challenge, [])[0]
  const [introDone, setIntroDone] = useState(blocksOffered)
  const [mode, setMode] = useState<'blocks' | 'code'>(blocksOffered ? 'blocks' : 'code')
  const [blocksTab, setBlocksTab] = useState<'workspace' | 'generated'>('workspace')
  const [blockState, setBlockState] = useState<BlocklyState | null>(null)
  // No modo Blocos visuais o código é o equivalente gerado na Linguagem escolhida.
  const blockCode = useMemo(
    () => (language && blockState ? generateCode(blockState, language) : ''),
    [language, blockState],
  )
  useEffect(() => {
    if (language && blocksOffered) rememberBlockCode(language, blockCode)
  }, [language, blockCode, blocksOffered])
  const typedCode = language ? (codes[language] ?? (blocksOffered ? undefined : migratedCodeFor(language)) ?? starterFor(language)) : ''
  const code = mode === 'blocks' ? blockCode : typedCode
  // O código é guardado por Linguagem: trocar de Linguagem não perde o que foi escrito.
  const setCode = (c: string) => language && onCodesChange({ ...codes, [language]: c })
  const [frames, setFrames] = useState<Frame[]>([initialFrame()])
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [busy, setBusy] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [message, setMessage] = useState('')
  const [earned, setEarned] = useState<Star[]>(() => loadStars(challenge.id))
  const [hintShown, setHintShown] = useState(false)
  const result = useRef<RunResult | null>(null)
  // Estrelas já gravadas ao chegar o resultado; só aparecem no fim do replay.
  const pendingStars = useRef<Star[]>([])

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
      // Grava já: sair ou reiniciar no meio do replay não perde um Desafio resolvido.
      pendingStars.current = recordResult(challenge.id, r)
      const failure = r.status === 'failed' ? t('failed', { reason: failureText(r.reason) }) : ''
      if (r.status === 'failed' && (r.reason?.code === 'actionLimit' || r.actions.length === 0)) {
        // Replay de milhares de Ações levaria minutos (ou não há o que mostrar): avisa e reinicia na hora.
        reset(failure)
        return
      }
      setFrames(replay(challenge, r.actions))
      setIndex(0)
      setMessage(failure) // a mensagem de falha aparece assim que o resultado chega
      setPlaying(true)
    } catch (e) {
      reset(t('failed', { reason: failureText({ code: 'runtimeError' }) }))
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
        setEarned(pendingStars.current)
      } else {
        // Falhar reinicia o Desafio sem punição.
        reset(t('failed', { reason: failureText(r?.reason) }))
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
        <LanguagePicker value={null} onChange={onLanguageChange} />
      </main>
    )
  }

  return (
    <main style={{ fontFamily: 'monospace', padding: 16, maxWidth: 1280 }}>
      <h1>{t('title')}</h1>
      <details>
        <summary>{t('settings')}</summary>
        <LanguagePicker
          value={language}
          onChange={(l) => {
            reset()
            onLanguageChange(l)
          }}
        />
      </details>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <section aria-label={t('challenge')} style={{ flex: '0 0 auto', width: Math.max(280, challenge.width * CELL), maxWidth: '100%' }}>
      <h2>{t('challenge')}</h2>
      <Board challenge={challenge} frame={frames[index]} />
      <p role="status">{message}</p>
      <Stars earned={earned} />
      {challenge.hint && (
        hintShown ? (
          <p role="note"><strong>{t('hintLabel')}:</strong> {t(challenge.hint as TextKey)}</p>
        ) : (
          <button onClick={askHint} title={t('hintWarning')}>{t('hintButton')}</button>
        )
      )}
      </section>
      <section aria-label={t('editorCode')} style={{ flex: '1 1 480px', minWidth: 0 }}>
      {!introDone && language && (
        <section role="note" aria-label={t('migrationTitle')}>
          <h3>{t('migrationTitle')}</h3>
          <p>{t('migrationIntro')}</p>
          <p>{t('migrationVariables')}</p>
          <pre>{migratedCodeFor(language) ?? starterFor(language)}</pre>
          <p>{t('migrationYourCode')}</p>
          <button onClick={() => setIntroDone(true)}>{t('migrationStart')}</button>
        </section>
      )}
      {blocksOffered && <div role="radiogroup" aria-label={t('editorMode')} style={{ display: 'flex', gap: 8 }}>
        {(['blocks', 'code'] as const).map((m) => (
          <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>
            {mode === m ? '● ' : ''}
            {m === 'blocks' ? t('editorBlocks') : t('editorCode')}
          </button>
        ))}
      </div>}
      {mode === 'blocks' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div role="tablist" style={{ display: 'flex', gap: 8 }}>
            {(['workspace', 'generated'] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={blocksTab === tab}
                onClick={() => {
                  setBlocksTab(tab)
                  // O Blockly mede a área ao ficar visível de novo.
                  if (tab === 'workspace') setTimeout(() => window.dispatchEvent(new Event('resize')), 0)
                }}
              >
                {blocksTab === tab ? '● ' : ''}
                {tab === 'workspace' ? t('blocksTab') : t('generatedCode', { language: languageName(language) })}
              </button>
            ))}
          </div>
          {/* O editor continua montado (só escondido) para não perder o programa ao trocar de aba. */}
          <div role="tabpanel" hidden={blocksTab !== 'workspace'}>
            <BlocksEditor initialState={blockState} onChange={setBlockState} />
          </div>
          <div role="tabpanel" hidden={blocksTab !== 'generated'}>
            <pre style={{ margin: 0 }}>{blockCode}</pre>
          </div>
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
      </section>
      </div>
    </main>
  )
}
