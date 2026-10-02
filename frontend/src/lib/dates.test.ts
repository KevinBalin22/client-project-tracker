import { describe, expect, it } from 'vitest'
import { isOverdue } from './dates'

describe('isOverdue', () => {
  const today = '2026-10-02'

  it('flags unfinished projects past their due date', () => {
    expect(isOverdue({ status: 'In Progress', dueDate: '2026-10-01' }, today)).toBe(true)
  })

  it('does not flag completed projects', () => {
    expect(isOverdue({ status: 'Completed', dueDate: '2026-01-01' }, today)).toBe(false)
  })

  it('does not flag projects due today or later, or without a due date', () => {
    expect(isOverdue({ status: 'Planning', dueDate: today }, today)).toBe(false)
    expect(isOverdue({ status: 'Planning', dueDate: null }, today)).toBe(false)
  })
})
