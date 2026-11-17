import type { FailureReason } from '../engine/types'
import { t, type TextKey } from './pt-BR'

/** Traduz o motivo de falha do motor (código + parâmetros) para texto da interface. */
export function failureText(reason: FailureReason | undefined): string {
  if (!reason) return ''
  const params = Object.fromEntries(Object.entries(reason.params ?? {}).map(([k, v]) => [k, String(v)]))
  return t(`failure_${reason.code}` as TextKey, params)
}
