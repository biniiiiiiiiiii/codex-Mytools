import { Navigate } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { loadLastRoute } from '../shared/utils/storage'

export function StartupRoute() {
  const lastRoute = loadLastRoute()

  if (lastRoute !== '/') {
    return <Navigate to={lastRoute} replace />
  }

  return <HomePage />
}
