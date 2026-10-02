export const STATUSES = ['Planning', 'In Progress', 'On Hold', 'Completed'] as const
export const PRIORITIES = ['Low', 'Medium', 'High'] as const

export type ProjectStatus = (typeof STATUSES)[number]
export type ProjectPriority = (typeof PRIORITIES)[number]

export interface Project {
  id: number
  clientName: string
  projectName: string
  description: string | null
  status: ProjectStatus
  priority: ProjectPriority
  startDate: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export type ProjectInput = Pick<
  Project,
  'clientName' | 'projectName' | 'description' | 'status' | 'priority' | 'startDate' | 'dueDate'
>

export const SORT_FIELDS = {
  createdAt: 'Recently added',
  dueDate: 'Due date',
  startDate: 'Start date',
  priority: 'Priority',
  status: 'Status',
  clientName: 'Client name',
  projectName: 'Project name',
} as const

export type SortField = keyof typeof SORT_FIELDS
export type SortDirection = 'asc' | 'desc'

export interface ProjectQuery {
  search: string
  status: ProjectStatus | ''
  priority: ProjectPriority | ''
  sortBy: SortField
  sortDir: SortDirection
}
