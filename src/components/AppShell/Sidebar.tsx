import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: '首页', description: '工作台 / 快速入口' },
  { to: '/formatter', label: '格式化 / 压缩', description: 'Monaco + 本地处理' },
  { to: '/validator', label: 'JSON 校验', description: '错误位置与提示' },
]

const futureItems = [
  { label: 'JSON Diff', description: '第 2 轮预留' },
  { label: 'JSONPath', description: '第 2 轮预留' },
  { label: 'JSON 转 C#', description: '第 3 轮预留' },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <p className="sidebar__title">功能导航</p>
      <nav className="sidebar__list" aria-label="主导航">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              isActive ? 'sidebar__item sidebar__item--active' : 'sidebar__item'
            }
          >
            <div>{item.label}</div>
            <span className="sidebar__badge">{item.description}</span>
          </NavLink>
        ))}
        {futureItems.map((item) => (
          <div key={item.label} className="sidebar__item--disabled" aria-disabled="true">
            <div>{item.label}</div>
            <span className="sidebar__badge">{item.description}</span>
          </div>
        ))}
      </nav>
    </aside>
  )
}
