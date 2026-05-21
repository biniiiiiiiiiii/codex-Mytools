import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout'
import { ConverterPage } from '../pages/ConverterPage'
import { FormatterPage } from '../pages/FormatterPage'
import { StartupRoute } from './StartupRoute'
import { SqlFormatterPage } from '../pages/SqlFormatterPage'
import { ValidatorPage } from '../pages/ValidatorPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <StartupRoute /> },
      { path: 'formatter', element: <FormatterPage /> },
      { path: 'validator', element: <ValidatorPage /> },
      { path: 'converter', element: <ConverterPage /> },
      { path: 'sql-formatter', element: <SqlFormatterPage /> },
    ],
  },
])
