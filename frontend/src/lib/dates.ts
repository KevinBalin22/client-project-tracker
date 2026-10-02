import type { Project } from '../types/project'

const displayFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

export function formatDate(value: string | null): string {
  if (!value) return '—'
  const [year, month, day] = value.split('-').map(Number)
  return displayFormat.format(new Date(year, month - 1, day))
}

export function todayIso(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function isOverdue(project: Pick<Project, 'dueDate' | 'status'>, today = todayIso()): boolean {
  return project.status !== 'Completed' && project.dueDate !== null && project.dueDate < today
}
