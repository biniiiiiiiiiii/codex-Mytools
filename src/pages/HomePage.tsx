import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="page">
      <section className="page__hero">
        <p className="page__eyebrow">Round 1 / MVP</p>
        <h2 className="page__title">欢迎使用 JSON 工具站</h2>
        <p className="page__description">
          这是一个纯前端、本地处理优先的自用工具站。第 1 轮聚焦 JSON 格式化、压缩与校验，后续功能只预留入口，不引入额外后端能力。
        </p>
        <div className="home-actions">
          <Link className="button" to="/formatter">
            进入格式化 / 压缩
          </Link>
          <Link className="button--secondary" to="/validator">
            进入 JSON 校验
          </Link>
        </div>
      </section>

      <div className="home-grid">
        <section className="home-card">
          <h2>本轮功能</h2>
          <p>Monaco 编辑器、本地 JSON 处理、结果复制、最近输入自动保存，以及基础工具函数测试。</p>
        </section>
        <section className="home-card">
          <h2>后续预留</h2>
          <ul className="result-list">
            <li>JSON Diff</li>
            <li>JSONPath 查询</li>
            <li>JSON 转 C# Class</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
