import type { ProjectPriority, ProjectStatus } from '../types/project'

const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap'

const statusStyles: Record<ProjectStatus, string> = {
  Planning: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  'In Progress': 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  'On Hold': 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
}

const priorityStyles: Record<ProjectPriority, string> = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-orange-50 text-orange-700',
  High: 'bg-rose-50 text-rose-700',
}

const priorityDots: Record<ProjectPriority, string> = {
  Low: 'bg-slate-400',
  Medium: 'bg-orange-500',
  High: 'bg-rose-500',
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={`${base} ${statusStyles[status]}`}>{status}</span>
}

export function PriorityBadge({ priority }: { priority: ProjectPriority }) {
  return (
    <span className={`${base} ${priorityStyles[priority]}`}>
      <span className={`size-1.5 rounded-full ${priorityDots[priority]}`} aria-hidden="true" />
      {priority}
    </span>
  )
}
