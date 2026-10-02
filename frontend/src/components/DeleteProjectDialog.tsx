import { useDeleteProject } from '../hooks/useProjects'
import type { Project } from '../types/project'
import { Modal } from './Modal'

interface DeleteProjectDialogProps {
  project: Project | null
  onClose: () => void
  onDeleted: (project: Project) => void
}

export function DeleteProjectDialog({ project, onClose, onDeleted }: DeleteProjectDialogProps) {
  const deleteProject = useDeleteProject()

  const handleClose = () => {
    deleteProject.reset()
    onClose()
  }

  const handleDelete = () => {
    if (!project) return
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        deleteProject.reset()
        onDeleted(project)
      },
    })
  }

  return (
    <Modal open={project !== null} onClose={handleClose} title="Delete project?" size="sm">
      {project && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">{project.projectName}</span> for {project.clientName} will be
            permanently deleted. This cannot be undone.
          </p>

          {deleteProject.error && (
            <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {deleteProject.error.message}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={handleDelete} disabled={deleteProject.isPending} className="btn-danger">
              {deleteProject.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
