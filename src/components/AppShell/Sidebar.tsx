import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: '首页' },
  { to: '/formatter', label: '格式化 / 压缩', description: 'Monaco + 本地处理' },
  { to: '/sql-formatter', label: 'SQL 格式化', description: '多方言美化' },
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
            {item.description ? <span className="sidebar__badge">{item.description}</span> : null}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
