import { useState, type FormEvent, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { validateProject, type ProjectFormErrors } from '../lib/validation'
import { PRIORITIES, STATUSES, type ProjectInput } from '../types/project'

const EMPTY_PROJECT: ProjectInput = {
  clientName: '',
  projectName: '',
  description: '',
  status: 'Planning',
  priority: 'Medium',
  startDate: '',
  dueDate: '',
}

interface ProjectFormProps {
  initialValues?: ProjectInput
  submitLabel: string
  onSubmit: (input: ProjectInput) => Promise<unknown>
  onCancel: () => void
}

function normalise(values: ProjectInput): ProjectInput {
  return {
    ...values,
    clientName: values.clientName.trim(),
    projectName: values.projectName.trim(),
    description: values.description?.trim() || null,
    startDate: values.startDate || null,
    dueDate: values.dueDate || null,
  }
}

export function ProjectForm({ initialValues = EMPTY_PROJECT, submitLabel, onSubmit, onCancel }: ProjectFormProps) {
  const [values, setValues] = useState<ProjectInput>(initialValues)
  const [errors, setErrors] = useState<ProjectFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const setField = <K extends keyof ProjectInput>(field: K, value: ProjectInput[K]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const input = normalise(values)
    const clientErrors = validateProject(input)
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(input)
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(
          Object.fromEntries(Object.entries(error.fieldErrors).map(([field, messages]) => [field, messages[0]])),
        )
      } else {
        setFormError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {formError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="clientName" label="Client name" required error={errors.clientName}>
          <input
            id="clientName"
            value={values.clientName}
            onChange={(e) => setField('clientName', e.target.value)}
            maxLength={255}
            className={inputClass(errors.clientName)}
            {...errorProps('clientName', errors.clientName)}
          />
        </Field>

        <Field id="projectName" label="Project name" required error={errors.projectName}>
          <input
            id="projectName"
            value={values.projectName}
            onChange={(e) => setField('projectName', e.target.value)}
            maxLength={255}
            className={inputClass(errors.projectName)}
            {...errorProps('projectName', errors.projectName)}
          />
        </Field>
      </div>

      <Field id="description" label="Description" error={errors.description}>
        <textarea
          id="description"
          rows={3}
          value={values.description ?? ''}
          onChange={(e) => setField('description', e.target.value)}
          maxLength={5000}
          className={inputClass(errors.description)}
          {...errorProps('description', errors.description)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="status" label="Status" required error={errors.status}>
          <select
            id="status"
            value={values.status}
            onChange={(e) => setField('status', e.target.value as ProjectInput['status'])}
            className={inputClass(errors.status)}
            {...errorProps('status', errors.status)}
          >
            {STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </Field>

        <Field id="priority" label="Priority" required error={errors.priority}>
          <select
            id="priority"
            value={values.priority}
            onChange={(e) => setField('priority', e.target.value as ProjectInput['priority'])}
            className={inputClass(errors.priority)}
            {...errorProps('priority', errors.priority)}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        </Field>

        <Field id="startDate" label="Start date" error={errors.startDate}>
          <input
            id="startDate"
            type="date"
            value={values.startDate ?? ''}
            onChange={(e) => setField('startDate', e.target.value)}
            className={inputClass(errors.startDate)}
            {...errorProps('startDate', errors.startDate)}
          />
        </Field>

        <Field id="dueDate" label="Due date" error={errors.dueDate}>
          <input
            id="dueDate"
            type="date"
            value={values.dueDate ?? ''}
            min={values.startDate || undefined}
            onChange={(e) => setField('dueDate', e.target.value)}
            className={inputClass(errors.dueDate)}
            {...errorProps('dueDate', errors.dueDate)}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  )
}

function inputClass(error?: string) {
  return `block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 ${
    error ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
  }`
}

function errorProps(id: string, error?: string) {
  return error ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` } : {}
}
