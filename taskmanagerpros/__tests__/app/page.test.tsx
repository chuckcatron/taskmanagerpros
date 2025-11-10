import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', {
      name: /to get started, edit the page.tsx file/i,
    })
    expect(heading).toBeInTheDocument()
  })

  it('renders the Next.js logo', () => {
    render(<Home />)
    const logo = screen.getByAltText('Next.js logo')
    expect(logo).toBeInTheDocument()
  })

  it('renders the Templates link', () => {
    render(<Home />)
    const templatesLink = screen.getByRole('link', { name: /templates/i })
    expect(templatesLink).toBeInTheDocument()
    expect(templatesLink).toHaveAttribute('href', expect.stringContaining('vercel.com/templates'))
  })

  it('renders the Learning link', () => {
    render(<Home />)
    const learningLink = screen.getByRole('link', { name: /learning/i })
    expect(learningLink).toBeInTheDocument()
    expect(learningLink).toHaveAttribute('href', expect.stringContaining('nextjs.org/learn'))
  })

  it('renders the Deploy Now button', () => {
    render(<Home />)
    const deployButton = screen.getByRole('link', { name: /deploy now/i })
    expect(deployButton).toBeInTheDocument()
  })

  it('renders the Documentation button', () => {
    render(<Home />)
    const docsButton = screen.getByRole('link', { name: /documentation/i })
    expect(docsButton).toBeInTheDocument()
  })
})
