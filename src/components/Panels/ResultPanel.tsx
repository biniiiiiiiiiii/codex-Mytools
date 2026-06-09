import { useEffect, useState, type ReactNode } from 'react'
import { JsonEditor } from '../Editor/JsonEditor'

type ResultPanelProps = {
  title: string
  description?: string
  value?: string
  readonly?: boolean
  language?: string
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
  language = 'json',
  tone = 'default',
  emptyText = '结果会显示在这里。',
  mode = 'editor',
  children,
}: ResultPanelProps) {
  const contentClass = `result-panel__content${tone === 'default' ? '' : ` result-panel__content--${tone}`}`
  const canFullscreen = mode === 'editor' && Boolean(value)
  const [fullscreenValue, setFullscreenValue] = useState<string | null>(null)

  useEffect(() => {
    if (fullscreenValue === null) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreenValue(null)
      }
    }
    const originalOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [fullscreenValue])

  return (
    <section className="panel result-panel">
      <div className="panel__header">
        <div>
          <h2 className="panel__title">{title}</h2>
          {description ? <p className="panel__hint">{description}</p> : null}
        </div>
        {canFullscreen ? (
          <button
            type="button"
            className="result-panel__fullscreen-button"
            onClick={() => setFullscreenValue(value)}
            aria-label={`全屏查看 ${title}`}
            title="全屏查看"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 3H3v5" />
              <path d="M16 3h5v5" />
              <path d="M21 16v5h-5" />
              <path d="M3 16v5h5" />
            </svg>
          </button>
        ) : null}
      </div>
      {mode === 'editor' ? (
        value ? (
          <JsonEditor value={value} readonly={readonly} language={language} />
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
      {fullscreenValue !== null ? (
        <div className="result-panel__fullscreen" role="dialog" aria-modal="true">
          <div className="result-panel__fullscreen-shell">
            <div className="result-panel__fullscreen-header">
              <div>
                <h2 className="panel__title">{title}</h2>
                {description ? <p className="panel__hint">{description}</p> : null}
              </div>
              <button
                type="button"
                className="result-panel__fullscreen-button"
                onClick={() => setFullscreenValue(null)}
                aria-label="退出全屏"
                title="退出全屏"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <JsonEditor
              value={fullscreenValue}
              readonly={readonly}
              language={language}
              height="calc(100vh - 150px)"
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}
