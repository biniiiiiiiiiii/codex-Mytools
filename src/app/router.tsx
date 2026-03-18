import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout'
import { FormatterPage } from '../pages/FormatterPage'
import { StartupRoute } from './StartupRoute'
import { ValidatorPage } from '../pages/ValidatorPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <StartupRoute /> },
      { path: 'formatter', element: <FormatterPage /> },
      { path: 'validator', element: <ValidatorPage /> },
    ],
  },
])
