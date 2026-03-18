import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppShell } from '../components/AppShell/AppShell'
import { saveLastRoute } from '../shared/utils/storage'

export function AppLayout() {
  const location = useLocation()

  useEffect(() => {
    saveLastRoute(location.pathname)
  }, [location.pathname])

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
