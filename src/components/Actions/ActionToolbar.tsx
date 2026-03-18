type ActionItem = {
  key: string
  label: string
  onClick: () => void | Promise<void>
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  disabled?: boolean
}

type ActionToolbarProps = {
  actions: ActionItem[]
}

export function ActionToolbar({ actions }: ActionToolbarProps) {
  return (
    <div className="toolbar" role="toolbar" aria-label="JSON 操作栏">
      {actions.map((action) => {
        const className =
          action.variant === 'secondary'
            ? 'button--secondary'
            : action.variant === 'ghost'
              ? 'button--ghost'
              : action.variant === 'danger'
                ? 'button--danger'
                : 'button'

        return (
          <button
            key={action.key}
            type="button"
            onClick={() => {
              void action.onClick()
            }}
            className={className}
            disabled={action.disabled}
          >
            {action.label}
          </button>
        )
      })}
    </div>
  )
}
