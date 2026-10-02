import { useEffect, useState } from 'react'
import { DeleteProjectDialog } from './components/DeleteProjectDialog'
import { ProjectFormModal, type FormTarget } from './components/ProjectFormModal'
import { ProjectList } from './components/ProjectList'
import { ProjectToolbar } from './components/ProjectToolbar'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { useProjects } from './hooks/useProjects'
import type { Project, ProjectQuery } from './types/project'

const DEFAULT_QUERY: ProjectQuery = {
  search: '',
  status: '',
  priority: '',
  sortBy: 'createdAt',
  sortDir: 'desc',
}

export default function App() {
  const [query, setQuery] = useState<ProjectQuery>(DEFAULT_QUERY)
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const debouncedSearch = useDebouncedValue(query.search)
  const { data: projects = [], isPending, isFetching, error, refetch } = useProjects({
    ...query,
    search: debouncedSearch.trim(),
  })

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 3000)
    return () => clearTimeout(timer)
  }, [notice])

  const hasFilters = query.search !== '' || query.status !== '' || query.priority !== ''

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Client Projects</h1>
          <p className="mt-1 text-sm text-slate-500">Track progress and priorities across all client work.</p>
        </div>
        <button type="button" onClick={() => setFormTarget({ mode: 'create' })} className="btn-primary">
          <span aria-hidden="true" className="text-lg leading-none">+</span> New project
        </button>
      </header>

      <div className="mb-4">
        <ProjectToolbar query={query} onChange={(changes) => setQuery((current) => ({ ...current, ...changes }))} />
      </div>

      <div className="mb-3 flex items-center justify-between text-sm text-slate-500" aria-live="polite">
        {!isPending && !error && (
          <span>
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            {hasFilters && ' matching your filters'}
          </span>
        )}
        {isFetching && !isPending && <span>Updating…</span>}
      </div>

      <main>
        {error ? (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="font-medium text-rose-800">Couldn't load projects</p>
            <p className="mt-1 text-sm text-rose-700">{error.message}</p>
            <button type="button" onClick={() => refetch()} className="btn-secondary mt-4">
              Try again
            </button>
          </div>
        ) : isPending ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading projects…
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-medium text-slate-900">{hasFilters ? 'No projects match your filters' : 'No projects yet'}</p>
            <p className="mt-1 text-sm text-slate-500">
              {hasFilters ? 'Try a different search or clear the filters.' : 'Create your first project to get started.'}
            </p>
          </div>
        ) : (
          <ProjectList
            projects={projects}
            onEdit={(project) => setFormTarget({ mode: 'edit', id: project.id })}
            onDelete={setProjectToDelete}
          />
        )}
      </main>

      <ProjectFormModal
        target={formTarget}
        onClose={() => setFormTarget(null)}
        onSaved={(project, mode) => {
          setFormTarget(null)
          setNotice(`"${project.projectName}" ${mode === 'create' ? 'created' : 'updated'}.`)
        }}
      />

      <DeleteProjectDialog
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onDeleted={(project) => {
          setProjectToDelete(null)
          setNotice(`"${project.projectName}" deleted.`)
        }}
      />

      {notice && (
        <div
          role="status"
          className="fixed right-4 bottom-4 left-4 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg sm:left-auto"
        >
          {notice}
        </div>
      )}
    </div>
  )
}
