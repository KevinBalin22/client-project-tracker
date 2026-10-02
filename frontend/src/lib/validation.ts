import { PRIORITIES, STATUSES, type ProjectInput } from '../types/project'

export type ProjectFormErrors = Partial<Record<keyof ProjectInput, string>>

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

export function validateProject(input: ProjectInput): ProjectFormErrors {
  const errors: ProjectFormErrors = {}

  if (!input.clientName.trim()) errors.clientName = 'Client name is required.'
  if (!input.projectName.trim()) errors.projectName = 'Project name is required.'
  if (!STATUSES.includes(input.status)) errors.status = 'Please select a valid status.'
  if (!PRIORITIES.includes(input.priority)) errors.priority = 'Please select a valid priority.'

  if (input.startDate && !isValidDate(input.startDate)) errors.startDate = 'Enter a valid start date.'
  if (input.dueDate && !isValidDate(input.dueDate)) errors.dueDate = 'Enter a valid due date.'

  if (!errors.startDate && !errors.dueDate && input.startDate && input.dueDate && input.dueDate < input.startDate) {
    errors.dueDate = 'Due date cannot be earlier than the start date.'
  }

  return errors
}
