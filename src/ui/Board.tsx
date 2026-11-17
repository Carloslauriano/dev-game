import type { Challenge, Facing } from '../engine/types'
import type { Frame } from '../engine/replay'
import { t } from '../i18n/pt-BR'

const ARROW: Record<Facing, string> = { north: '▲', east: '▶', south: '▼', west: '◀' }
export const CELL = 56

const same = (a: { x: number; y: number }, x: number, y: number) => a.x === x && a.y === y

export function Board({ challenge, frame }: { challenge: Challenge; frame: Frame }) {
  const cells = []
  for (let y = 0; y < challenge.height; y++) {
    for (let x = 0; x < challenge.width; x++) {
      let content = ''
      let label = ''
      let bg = '#1b1b2f'
      if (challenge.walls.some((p) => same(p, x, y))) (bg = '#555'), (label = t('wallAria')), (content = '▒')
      else if (challenge.obstacles.some((p) => same(p, x, y))) (bg = '#7a1d1d'), (label = t('obstacleAria')), (content = '✖')
      else if (same(challenge.goal, x, y)) (bg = '#1d6b3a'), (label = t('goalAria')), (content = '⚑')
      if (frame.items.some((p) => same(p, x, y))) (label = t('itemAria')), (content = '★')
      if (same(frame, x, y)) (label = t('characterAria')), (content = ARROW[frame.facing])
      cells.push(
        <div
          key={`${x},${y}`}
          role="img"
          aria-label={label || undefined}
          style={{
            width: CELL,
            height: CELL,
            background: bg,
            border: same(frame, x, y) && frame.bumped ? '2px solid #ff5555' : '1px solid #333',
            display: 'grid',
            placeItems: 'center',
            fontSize: 24,
            color: '#ffd23f',
            boxSizing: 'border-box',
          }}
        >
          {content}
        </div>,
      )
    }
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${challenge.width}, ${CELL}px)`, width: 'fit-content' }}>
      {cells}
    </div>
  )
}

/** Legenda do mapa: só lista o que existe neste Desafio. */
export function Legend({ challenge }: { challenge: Challenge }) {
  const entries = [
    { symbol: '▲', bg: '#1b1b2f', label: t('characterAria') },
    { symbol: '⚑', bg: '#1d6b3a', label: t('goalAria') },
    ...(challenge.items.length ? [{ symbol: '★', bg: '#1b1b2f', label: t('itemAria') }] : []),
    ...(challenge.walls.length ? [{ symbol: '▒', bg: '#555', label: t('wallAria') }] : []),
    ...(challenge.obstacles.length ? [{ symbol: '✖', bg: '#7a1d1d', label: t('obstacleAria') }] : []),
  ]
  return (
    <ul aria-label={t('legend')} style={{ listStyle: 'none', padding: 0, margin: '8px 0', display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
      {entries.map((e) => (
        <li key={e.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span aria-hidden style={{ width: 24, height: 24, background: e.bg, border: '1px solid #333', color: '#ffd23f', display: 'grid', placeItems: 'center' }}>
            {e.symbol}
          </span>
          {e.label}
        </li>
      ))}
    </ul>
  )
}
