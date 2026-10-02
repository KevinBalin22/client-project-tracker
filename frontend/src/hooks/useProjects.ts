import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '../api/projects'
import type { ProjectInput, ProjectQuery } from '../types/project'

const projectKeys = {
  all: ['projects'] as const,
  list: (query: ProjectQuery) => [...projectKeys.all, 'list', query] as const,
  detail: (id: number) => [...projectKeys.all, 'detail', id] as const,
}

export function useProjects(query: ProjectQuery) {
  return useQuery({
    queryKey: projectKeys.list(query),
    queryFn: () => projectsApi.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useProject(id: number | null) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? 0),
    queryFn: () => projectsApi.get(id!),
    enabled: id !== null,
  })
}

function useProjectMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  })
}

export const useCreateProject = () => useProjectMutation((input: ProjectInput) => projectsApi.create(input))

export const useUpdateProject = () =>
  useProjectMutation(({ id, input }: { id: number; input: ProjectInput }) => projectsApi.update(id, input))

export const useDeleteProject = () => useProjectMutation((id: number) => projectsApi.remove(id))
