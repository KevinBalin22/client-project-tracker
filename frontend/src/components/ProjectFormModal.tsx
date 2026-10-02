import { useCreateProject, useProject, useUpdateProject } from '../hooks/useProjects'
import type { Project, ProjectInput } from '../types/project'
import { Modal } from './Modal'
import { ProjectForm } from './ProjectForm'

export type FormTarget = { mode: 'create' } | { mode: 'edit'; id: number }

interface ProjectFormModalProps {
  target: FormTarget | null
  onClose: () => void
  onSaved: (project: Project, mode: FormTarget['mode']) => void
}

function toInput(project: Project): ProjectInput {
  return {
    clientName: project.clientName,
    projectName: project.projectName,
    description: project.description ?? '',
    status: project.status,
    priority: project.priority,
    startDate: project.startDate ?? '',
    dueDate: project.dueDate ?? '',
  }
}

export function ProjectFormModal({ target, onClose, onSaved }: ProjectFormModalProps) {
  const editId = target?.mode === 'edit' ? target.id : null
  const { data: project, isPending, error } = useProject(editId)
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()

  const handleSubmit = async (input: ProjectInput) => {
    const saved =
      editId === null
        ? await createProject.mutateAsync(input)
        : await updateProject.mutateAsync({ id: editId, input })
    onSaved(saved, editId === null ? 'create' : 'edit')
  }

  const renderBody = () => {
    if (editId === null) {
      return <ProjectForm submitLabel="Create project" onSubmit={handleSubmit} onCancel={onClose} />
    }
    if (error) {
      return (
        <p role="alert" className="text-sm text-rose-700">
          {error.message}
        </p>
      )
    }
    if (isPending) {
      return <p className="text-sm text-slate-500">Loading project…</p>
    }
    return (
      <ProjectForm
        key={project.id}
        initialValues={toInput(project)}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    )
  }

  return (
    <Modal open={target !== null} onClose={onClose} title={editId === null ? 'New project' : 'Edit project'}>
      {renderBody()}
    </Modal>
  )
}
