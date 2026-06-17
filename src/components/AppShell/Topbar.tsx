export function Topbar() {
  return (
    <header className="topbar">
      <div>
        <h1 className="topbar__title">JSON 工作台</h1>
        <p className="topbar__subtitle">本地处理，不上传数据</p>
      </div>
      <div className="topbar__actions">
        <span className="topbar__chip">Monaco Editor</span>
        <span className="topbar__chip">React + Vite</span>
      </div>
    </header>
  )
}
