import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { ProjectForm } from './ProjectForm'

function renderForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(<ProjectForm submitLabel="Create project" onSubmit={onSubmit} onCancel={vi.fn()} />)
  return { onSubmit, user: userEvent.setup() }
}

describe('ProjectForm', () => {
  it('shows required-field errors and does not submit an empty form', async () => {
    const { onSubmit, user } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Create project' }))

    expect(screen.getByText('Client name is required.')).toBeInTheDocument()
    expect(screen.getByText('Project name is required.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a normalised payload', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText(/Client name/), '  Acme  ')
    await user.type(screen.getByLabelText(/Project name/), 'Website')
    await user.selectOptions(screen.getByLabelText(/Priority/), 'High')
    await user.click(screen.getByRole('button', { name: 'Create project' }))

    expect(onSubmit).toHaveBeenCalledWith({
      clientName: 'Acme',
      projectName: 'Website',
      description: null,
      status: 'Planning',
      priority: 'High',
      startDate: null,
      dueDate: null,
    })
  })

  it('displays validation errors returned by the API', async () => {
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError('Invalid data', 422, { clientName: ['The client name has already been taken.'] }),
    )
    const { user } = renderForm(onSubmit)

    await user.type(screen.getByLabelText(/Client name/), 'Acme')
    await user.type(screen.getByLabelText(/Project name/), 'Website')
    await user.click(screen.getByRole('button', { name: 'Create project' }))

    expect(await screen.findByText('The client name has already been taken.')).toBeInTheDocument()
  })

  it('shows a general error when the server is unreachable', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new ApiError('Unable to reach the server.', 0))
    const { user } = renderForm(onSubmit)

    await user.type(screen.getByLabelText(/Client name/), 'Acme')
    await user.type(screen.getByLabelText(/Project name/), 'Website')
    await user.click(screen.getByRole('button', { name: 'Create project' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server.')
  })
})
