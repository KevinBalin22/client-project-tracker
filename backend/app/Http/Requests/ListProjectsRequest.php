<?php

namespace App\Http\Requests;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListProjectsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::enum(ProjectStatus::class)],
            'priority' => ['nullable', Rule::enum(ProjectPriority::class)],
            'sortBy' => ['nullable', Rule::in(array_keys(Project::SORTABLE))],
            'sortDir' => ['nullable', Rule::in(['asc', 'desc'])],
        ];
    }

    public function messages(): array
    {
        return [
            'status.enum' => 'The status filter must be one of: '.implode(', ', ProjectStatus::values()).'.',
            'priority.enum' => 'The priority filter must be one of: '.implode(', ', ProjectPriority::values()).'.',
            'sortBy.in' => 'The sortBy parameter must be one of: '.implode(', ', array_keys(Project::SORTABLE)).'.',
            'sortDir.in' => 'The sortDir parameter must be either asc or desc.',
        ];
    }
}
