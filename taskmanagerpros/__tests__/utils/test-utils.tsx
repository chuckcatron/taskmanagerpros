import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

/**
 * Custom render function that wraps components with common providers
 * Add your app providers here (Theme, Redux, etc.) as the app grows
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { ...options })
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override the default render with our custom one
export { customRender as render }
