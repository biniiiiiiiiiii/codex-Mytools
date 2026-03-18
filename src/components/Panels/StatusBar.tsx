import type { OperationStatus } from '../../shared/types/common'

type StatusBarProps = {
  status: OperationStatus
  saved: boolean
  inputLength: number
  outputLength?: number
}

export function StatusBar({ status, saved, inputLength, outputLength }: StatusBarProps) {
  const toneClass =
    status.tone === 'success'
      ? 'status-bar__dot status-bar__dot--success'
      : status.tone === 'error'
        ? 'status-bar__dot status-bar__dot--error'
        : 'status-bar__dot'

  return (
    <div className="status-bar" aria-live="polite">
      <div className="status-bar__state">
        <span className={toneClass} aria-hidden="true" />
        <span>{status.message}</span>
      </div>
      <div className="status-bar__meta">
        输入 {inputLength} 字符
        {typeof outputLength === 'number' ? ` / 输出 ${outputLength} 字符` : ''}
        {saved ? ' / 最近输入已自动保存' : ''}
      </div>
    </div>
  )
}
