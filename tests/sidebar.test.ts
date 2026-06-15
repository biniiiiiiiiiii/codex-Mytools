import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Sidebar } from '../src/components/AppShell/Sidebar'

describe('Sidebar', () => {
  it('does not show removed JSON tools in the left navigation', () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(Sidebar)),
    )

    expect(html).not.toContain('JSON 校验')
    expect(html).not.toContain('JSON 转 C#')
  })
})
