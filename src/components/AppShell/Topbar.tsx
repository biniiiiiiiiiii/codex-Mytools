export function Topbar() {
  return (
    <header className="topbar">
      <div>
        <h1 className="topbar__title">Bin 的 JSON 工具站</h1>
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
