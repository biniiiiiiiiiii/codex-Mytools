import type { ReactNode } from 'react'
import { ActionToolbar } from '../Actions/ActionToolbar'
import { StatusBar } from './StatusBar'
import type { OperationStatus } from '../../shared/types/common'

type WorkspacePanelProps = {
  actions: React.ComponentProps<typeof ActionToolbar>['actions']
  input: ReactNode
  result: ReactNode
  status: OperationStatus
  saved: boolean
  inputLength: number
  outputLength?: number
}

export function WorkspacePanel({
  actions,
  input,
  result,
  status,
  saved,
  inputLength,
  outputLength,
}: WorkspacePanelProps) {
  return (
    <section className="workspace">
      <ActionToolbar actions={actions} />
      <div className="workspace__grid">
        {input}
        {result}
      </div>
      <StatusBar
        status={status}
        saved={saved}
        inputLength={inputLength}
        outputLength={outputLength}
      />
    </section>
  )
}
