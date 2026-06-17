import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="page">
      <section className="page__hero">
        <p className="page__eyebrow">本地优先</p>
        <h2 className="page__title">把常用数据整理动作放在一个安静的工作台里</h2>
        <p className="page__description">
          纯前端运行，面向 JSON、SQL 和 C# 样本转换。输入只保留在浏览器本地，适合快速整理接口数据和排查格式问题。
        </p>
        <div className="home-actions">
          <Link className="button" to="/formatter">
            打开格式化
          </Link>
          <Link className="button--secondary" to="/validator">
            校验 JSON
          </Link>
        </div>
      </section>

      <div className="home-grid">
        <section className="home-card">
          <span className="home-card__meta">常用</span>
          <h2>JSON 格式化 / 压缩</h2>
          <p>把接口返回、配置片段和日志中的 JSON 整理成可读格式，也可以压缩成单行。</p>
          <Link className="home-card__link" to="/formatter">
            进入工具
          </Link>
        </section>
        <section className="home-card home-card--tinted">
          <span className="home-card__meta">数据库</span>
          <h2>SQL 格式化</h2>
          <p>支持常见 SQL 方言和关键字大小写设置，便于在评审和排查时快速阅读查询。</p>
          <Link className="home-card__link" to="/sql-formatter">
            进入工具
          </Link>
        </section>
        <section className="home-card">
          <span className="home-card__meta">检查</span>
          <h2>JSON 校验</h2>
          <p>检查语法合法性，尽量给出行列位置和可操作提示，减少定位错误的时间。</p>
          <Link className="home-card__link" to="/validator">
            进入工具
          </Link>
        </section>
        <section className="home-card">
          <span className="home-card__meta">生成</span>
          <h2>JSON 转 C# Class</h2>
          <p>根据样本生成 C# 类型，支持命名空间、根类名和 JsonPropertyName 映射。</p>
          <Link className="home-card__link" to="/converter">
            进入工具
          </Link>
        </section>
      </div>
    </div>
  )
}
