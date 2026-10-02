import { describe, expect, it } from 'vitest'
import type { ProjectInput } from '../types/project'
import { validateProject } from './validation'

const valid: ProjectInput = {
  clientName: 'Acme',
  projectName: 'Website',
  description: null,
  status: 'Planning',
  priority: 'High',
  startDate: '2026-06-01',
  dueDate: '2026-07-01',
}

describe('validateProject', () => {
  it('accepts a valid project', () => {
    expect(validateProject(valid)).toEqual({})
  })

  it('accepts a project without dates', () => {
    expect(validateProject({ ...valid, startDate: null, dueDate: null })).toEqual({})
  })

  it('requires client and project names', () => {
    const errors = validateProject({ ...valid, clientName: '  ', projectName: '' })
    expect(errors.clientName).toBe('Client name is required.')
    expect(errors.projectName).toBe('Project name is required.')
  })

  it('rejects unknown status and priority values', () => {
    const errors = validateProject({
      ...valid,
      status: 'Done' as ProjectInput['status'],
      priority: 'Urgent' as ProjectInput['priority'],
    })
    expect(errors.status).toBeDefined()
    expect(errors.priority).toBeDefined()
  })

  it('rejects a due date earlier than the start date', () => {
    expect(validateProject({ ...valid, startDate: '2026-07-02', dueDate: '2026-07-01' }).dueDate).toBe(
      'Due date cannot be earlier than the start date.',
    )
  })

  it('allows the due date to equal the start date', () => {
    expect(validateProject({ ...valid, startDate: '2026-07-01', dueDate: '2026-07-01' })).toEqual({})
  })

  it('rejects impossible calendar dates', () => {
    expect(validateProject({ ...valid, startDate: '2026-02-30', dueDate: null }).startDate).toBeDefined()
  })
})
