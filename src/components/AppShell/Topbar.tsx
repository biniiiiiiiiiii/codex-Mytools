export function Topbar() {
  return (
    <header className="topbar">
      <div>
        <h1 className="topbar__title">JSON 工具站（自用版）</h1>
        <div className="topbar__meta">纯前端、本地处理优先、为后续工具页预留路由</div>
      </div>
      <div className="topbar__actions">
        <button type="button" className="topbar__ghost">
          Github 占位
        </button>
        <button type="button" className="topbar__ghost">
          主题占位
        </button>
      </div>
    </header>
  )
}
