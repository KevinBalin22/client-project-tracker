<?php

namespace App\Http\Requests;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'clientName' => ['required', 'string', 'max:255'],
            'projectName' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', Rule::enum(ProjectStatus::class)],
            'priority' => ['required', Rule::enum(ProjectPriority::class)],
            'startDate' => ['nullable', 'date_format:Y-m-d'],
            'dueDate' => [
                'nullable',
                'date_format:Y-m-d',
                Rule::when($this->filled('startDate'), 'after_or_equal:startDate'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'status.enum' => 'The status must be one of: '.implode(', ', ProjectStatus::values()).'.',
            'priority.enum' => 'The priority must be one of: '.implode(', ', ProjectPriority::values()).'.',
            'startDate.date_format' => 'The start date must be a valid date in YYYY-MM-DD format.',
            'dueDate.date_format' => 'The due date must be a valid date in YYYY-MM-DD format.',
            'dueDate.after_or_equal' => 'The due date cannot be earlier than the start date.',
        ];
    }

    public function attributes(): array
    {
        return [
            'clientName' => 'client name',
            'projectName' => 'project name',
            'startDate' => 'start date',
            'dueDate' => 'due date',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toModelAttributes(): array
    {
        $data = $this->validated();

        return [
            'client_name' => $data['clientName'],
            'project_name' => $data['projectName'],
            'description' => $data['description'] ?? null,
            'status' => $data['status'],
            'priority' => $data['priority'],
            'start_date' => $data['startDate'] ?? null,
            'due_date' => $data['dueDate'] ?? null,
        ];
    }
}
