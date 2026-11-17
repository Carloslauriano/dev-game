import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly/core'
import * as PtBr from 'blockly/msg/pt-br'
import { defineBlocks, toolbox } from '../blocks/blocks'
import { t } from '../i18n/pt-BR'

/** Editor de Blocos visuais. Avisa a cada mudança com o estado serializado do programa. */
export function BlocksEditor({ initialState, onChange }: { initialState: object | null; onChange: (state: object) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    defineBlocks()
    Blockly.setLocale(PtBr as unknown as Record<string, string>)
    const workspace = Blockly.inject(host.current!, { toolbox, trashcan: true })
    if (initialState) Blockly.serialization.workspaces.load(initialState, workspace)
    const listener = (e: Blockly.Events.Abstract) => {
      if (e.isUiEvent) return
      onChangeRef.current(Blockly.serialization.workspaces.save(workspace))
    }
    workspace.addChangeListener(listener)
    return () => workspace.dispose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={host} role="region" aria-label={t('blocksAria')} style={{ height: 360, width: '100%' }} />
}
