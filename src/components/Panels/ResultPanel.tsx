import type { ReactNode } from 'react'
import { JsonEditor } from '../Editor/JsonEditor'

type ResultPanelProps = {
  title: string
  description?: string
  value?: string
  readonly?: boolean
  tone?: 'default' | 'success' | 'error'
  emptyText?: string
  mode?: 'editor' | 'text'
  children?: ReactNode
}

export function ResultPanel({
  title,
  description,
  value = '',
  readonly = true,
  tone = 'default',
  emptyText = '结果会显示在这里。',
  mode = 'editor',
  children,
}: ResultPanelProps) {
  const contentClass = `result-panel__content${tone === 'default' ? '' : ` result-panel__content--${tone}`}`

  return (
    <section className="panel result-panel">
      <div className="panel__header">
        <div>
          <h2 className="panel__title">{title}</h2>
          {description ? <p className="panel__hint">{description}</p> : null}
        </div>
      </div>
      {mode === 'editor' ? (
        value ? (
          <JsonEditor value={value} readonly={readonly} />
        ) : (
          <div className={contentClass}>
            <span className="result-panel__empty">{emptyText}</span>
          </div>
        )
      ) : (
        <div className={contentClass}>
          {children ?? <span className="result-panel__empty">{emptyText}</span>}
        </div>
      )}
    </section>
  )
}
