import {
  PRIORITIES,
  SORT_FIELDS,
  STATUSES,
  type ProjectPriority,
  type ProjectQuery,
  type ProjectStatus,
  type SortField,
} from '../types/project'

interface ProjectToolbarProps {
  query: ProjectQuery
  onChange: (changes: Partial<ProjectQuery>) => void
}

const selectClass =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

export function ProjectToolbar({ query, onChange }: ProjectToolbarProps) {
  const hasFilters = query.search !== '' || query.status !== '' || query.priority !== ''

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <label htmlFor="search" className="sr-only">
          Search projects
        </label>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.39l3.08 3.08a.75.75 0 1 1-1.06 1.06l-3.08-3.08A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          id="search"
          type="search"
          placeholder="Search by client, project or description…"
          value={query.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className={`${selectClass} w-full pl-9`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
        <label className="sr-only" htmlFor="filter-status">
          Filter by status
        </label>
        <select
          id="filter-status"
          value={query.status}
          onChange={(e) => onChange({ status: e.target.value as ProjectStatus | '' })}
          className={selectClass}
        >
          <option value="">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="filter-priority">
          Filter by priority
        </label>
        <select
          id="filter-priority"
          value={query.priority}
          onChange={(e) => onChange({ priority: e.target.value as ProjectPriority | '' })}
          className={selectClass}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="sort-by">
          Sort by
        </label>
        <select
          id="sort-by"
          value={query.sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value as SortField })}
          className={selectClass}
        >
          {Object.entries(SORT_FIELDS).map(([value, label]) => (
            <option key={value} value={value}>
              Sort: {label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onChange({ sortDir: query.sortDir === 'asc' ? 'desc' : 'asc' })}
          className="btn-secondary"
          aria-label={`Sort direction: ${query.sortDir === 'asc' ? 'ascending' : 'descending'}. Click to toggle.`}
        >
          {query.sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>

        {hasFilters && (
          <button
            type="button"
            onClick={() => onChange({ search: '', status: '', priority: '' })}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
