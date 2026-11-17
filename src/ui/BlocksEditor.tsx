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
    // Todo programa nasce com o bloco de início (fixo, não pode ser apagado).
    if (!workspace.getTopBlocks(false).some((b) => b.type === 'start')) {
      Blockly.serialization.blocks.append({ type: 'start', x: 24, y: 24, deletable: false }, workspace)
    }
    // Blocos soltos (fora do início) ficam desativados: não rodam.
    workspace.addChangeListener(Blockly.Events.disableOrphans)
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
