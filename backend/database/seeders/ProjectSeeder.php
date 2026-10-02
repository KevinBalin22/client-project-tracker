<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $projects = json_decode(
            File::get(database_path('data/test_data.json')),
            associative: true,
            flags: JSON_THROW_ON_ERROR,
        );

        foreach ($projects as $project) {
            Project::updateOrCreate(['id' => $project['id']], [
                'client_name' => $project['clientName'],
                'project_name' => $project['projectName'],
                'description' => $project['description'],
                'status' => $project['status'],
                'priority' => $project['priority'],
                'start_date' => $project['startDate'],
                'due_date' => $project['dueDate'],
            ]);
        }
    }
}
