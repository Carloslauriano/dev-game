import { useEffect, useRef, useState } from 'react'
import { runChallenge } from '../engine/runChallenge'
import { replay, type Frame } from '../engine/replay'
import type { RunResult } from '../engine/types'
import { firstChallenge, starterCode } from '../challenges/first'
import { t } from '../i18n/pt-BR'
import { Board } from './Board'
import { Stars } from './Stars'
import { loadStars, saveStars } from './progress'
import type { Star } from '../engine/types'

const challenge = firstChallenge
const initialFrame = (): Frame => replay(challenge, [])[0]
const BASE_MS = 600

export function App() {
  const [code, setCode] = useState(starterCode)
  const [frames, setFrames] = useState<Frame[]>([initialFrame()])
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [busy, setBusy] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [message, setMessage] = useState('')
  const [earned, setEarned] = useState<Star[]>(() => loadStars(challenge.id))
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
      const r = await runChallenge(challenge, 'javascript', code)
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

  const canPause = busy && frames.length > 1 && !finished

  return (
    <main style={{ fontFamily: 'monospace', padding: 16, maxWidth: 720 }}>
      <h1>{t('title')}</h1>
      <h2>{t('challenge')}</h2>
      <Board challenge={challenge} frame={frames[index]} />
      <p role="status">{message}</p>
      <Stars earned={earned} />
      <label>
        {t('codeLabel')}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={10}
          style={{ display: 'block', width: '100%', fontFamily: 'monospace' }}
        />
      </label>
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
