<?php

namespace App\Models;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;

    public const SORTABLE = [
        'clientName' => 'client_name',
        'projectName' => 'project_name',
        'status' => 'status',
        'priority' => 'priority',
        'startDate' => 'start_date',
        'dueDate' => 'due_date',
        'createdAt' => 'created_at',
    ];

    protected $fillable = [
        'client_name',
        'project_name',
        'description',
        'status',
        'priority',
        'start_date',
        'due_date',
    ];

    protected function casts(): array
    {
        return [
            'status' => ProjectStatus::class,
            'priority' => ProjectPriority::class,
            'start_date' => 'date:Y-m-d',
            'due_date' => 'date:Y-m-d',
        ];
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if ($term === null || $term === '') {
            return $query;
        }

        $like = '%'.addcslashes($term, '%_\\').'%';

        return $query->where(function (Builder $q) use ($like) {
            $q->where('client_name', 'like', $like)
                ->orWhere('project_name', 'like', $like)
                ->orWhere('description', 'like', $like);
        });
    }

    public function scopeSortByField(Builder $query, string $sortBy, string $direction): Builder
    {
        $column = self::SORTABLE[$sortBy] ?? 'created_at';

        $order = match ($column) {
            'status' => ProjectStatus::values(),
            'priority' => ProjectPriority::values(),
            default => null,
        };

        if ($order !== null) {
            $cases = collect($order)
                ->keys()
                ->map(fn (int $rank) => "WHEN ? THEN {$rank}")
                ->implode(' ');
            $query->orderByRaw("CASE {$column} {$cases} END {$direction}", $order);
        } else {
            $query->orderBy($column, $direction);
        }

        return $query->orderBy('id', $direction);
    }
}
