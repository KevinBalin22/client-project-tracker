import type { Project, ProjectInput, ProjectQuery } from '../types/project'
import { request } from './client'

interface DataEnvelope<T> {
  data: T
}

function toSearchParams(query: Partial<ProjectQuery>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value)
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export const projectsApi = {
  list: async (query: Partial<ProjectQuery> = {}) =>
    (await request<DataEnvelope<Project[]>>(`/projects${toSearchParams(query)}`)).data,

  get: async (id: number) => (await request<DataEnvelope<Project>>(`/projects/${id}`)).data,

  create: async (input: ProjectInput) =>
    (await request<DataEnvelope<Project>>('/projects', { method: 'POST', body: JSON.stringify(input) })).data,

  update: async (id: number, input: ProjectInput) =>
    (await request<DataEnvelope<Project>>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(input) }))
      .data,

  remove: (id: number) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
}
