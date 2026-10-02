import { formatDate, isOverdue } from '../lib/dates'
import type { Project } from '../types/project'
import { PriorityBadge, StatusBadge } from './Badges'

interface ProjectListProps {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

function DueDate({ project }: { project: Project }) {
  const overdue = isOverdue(project)
  return (
    <span className={overdue ? 'font-medium text-rose-600' : undefined}>
      {formatDate(project.dueDate)}
      {overdue && <span className="ml-1.5 text-xs">(Overdue)</span>}
    </span>
  )
}

function RowActions({ project, onEdit, onDelete }: { project: Project } & Omit<ProjectListProps, 'projects'>) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onEdit(project)}
        className="rounded-md px-2.5 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
        aria-label={`Edit ${project.projectName}`}
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(project)}
        className="rounded-md px-2.5 py-1 text-sm font-medium text-rose-600 hover:bg-rose-50"
        aria-label={`Delete ${project.projectName}`}
      >
        Delete
      </button>
    </div>
  )
}

export function ProjectList({ projects, onEdit, onDelete }: ProjectListProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">Project</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Priority</th>
              <th scope="col" className="px-4 py-3">Start</th>
              <th scope="col" className="px-4 py-3">Due</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => (
              <tr key={project.id} className="align-top hover:bg-slate-50/60">
                <td className="max-w-md px-4 py-3">
                  <div className="font-medium text-slate-900">{project.projectName}</div>
                  <div className="text-slate-500">{project.clientName}</div>
                  {project.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{project.description}</p>
                  )}
                </td>
                <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
                <td className="px-4 py-3"><PriorityBadge priority={project.priority} /></td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDate(project.startDate)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600"><DueDate project={project} /></td>
                <td className="px-4 py-3 text-right"><RowActions project={project} onEdit={onEdit} onDelete={onDelete} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {projects.map((project) => (
          <li key={project.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-medium text-slate-900">{project.projectName}</h3>
                <p className="text-sm text-slate-500">{project.clientName}</p>
              </div>
              <PriorityBadge priority={project.priority} />
            </div>
            {project.description && <p className="mt-2 text-sm text-slate-600">{project.description}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <StatusBadge status={project.status} />
              <span>
                {formatDate(project.startDate)} → <DueDate project={project} />
              </span>
            </div>
            <div className="mt-3 -ml-2.5 border-t border-slate-100 pt-2">
              <RowActions project={project} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
