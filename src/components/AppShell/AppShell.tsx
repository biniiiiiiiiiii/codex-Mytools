import type { PropsWithChildren } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <Topbar />
      <Sidebar />
      <main className="layout__content">{children}</main>
    </div>
  )
}
