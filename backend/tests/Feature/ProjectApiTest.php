<?php

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ProjectApiTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'clientName' => 'Acme Corporation',
            'projectName' => 'Website Redesign',
            'description' => 'Modernise the corporate site.',
            'status' => 'In Progress',
            'priority' => 'High',
            'startDate' => '2026-06-01',
            'dueDate' => '2026-07-15',
        ], $overrides);
    }


    public function test_it_lists_projects(): void
    {
        Project::factory()->count(3)->create();

        $this->getJson('/projects')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data' => [[
                'id', 'clientName', 'projectName', 'description',
                'status', 'priority', 'startDate', 'dueDate',
            ]]]);
    }

    public function test_it_searches_by_client_project_name_or_description(): void
    {
        Project::factory()->create(['client_name' => 'Nova Fitness', 'project_name' => 'App']);
        Project::factory()->create(['client_name' => 'Other', 'project_name' => 'Nova Portal']);
        Project::factory()->create(['client_name' => 'Unrelated', 'project_name' => 'Thing', 'description' => 'x']);

        $this->getJson('/projects?search=nova')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_it_filters_by_status_and_priority(): void
    {
        Project::factory()->create(['status' => 'Planning', 'priority' => 'High']);
        Project::factory()->create(['status' => 'Planning', 'priority' => 'Low']);
        Project::factory()->create(['status' => 'Completed', 'priority' => 'High']);

        $this->getJson('/projects?status=Planning&priority=High')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'Planning')
            ->assertJsonPath('data.0.priority', 'High');
    }

    public function test_priority_sorts_by_severity_not_alphabetically(): void
    {
        foreach (['Medium', 'High', 'Low'] as $priority) {
            Project::factory()->create(['priority' => $priority]);
        }

        $response = $this->getJson('/projects?sortBy=priority&sortDir=desc')->assertOk();

        $this->assertSame(['High', 'Medium', 'Low'], array_column($response->json('data'), 'priority'));
    }

    public function test_it_rejects_invalid_list_parameters(): void
    {
        $this->getJson('/projects?status=Done&sortBy=password&sortDir=up')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status', 'sortBy', 'sortDir']);
    }


    public function test_it_shows_a_single_project(): void
    {
        $project = Project::factory()->create(['project_name' => 'CRM Dashboard']);

        $this->getJson("/projects/{$project->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $project->id)
            ->assertJsonPath('data.projectName', 'CRM Dashboard');
    }

    public function test_it_returns_a_clean_404_for_a_missing_project(): void
    {
        $this->getJson('/projects/999')
            ->assertNotFound()
            ->assertExactJson(['message' => 'Project not found.']);
    }


    public function test_it_creates_a_project(): void
    {
        $this->postJson('/projects', $this->validPayload())
            ->assertCreated()
            ->assertJsonPath('data.clientName', 'Acme Corporation')
            ->assertJsonPath('data.status', 'In Progress')
            ->assertJsonPath('data.dueDate', '2026-07-15');

        $this->assertDatabaseHas('projects', [
            'client_name' => 'Acme Corporation',
            'project_name' => 'Website Redesign',
        ]);
    }

    public function test_description_and_dates_are_optional(): void
    {
        $payload = $this->validPayload();
        unset($payload['description'], $payload['startDate'], $payload['dueDate']);

        $this->postJson('/projects', $payload)
            ->assertCreated()
            ->assertJsonPath('data.startDate', null);
    }

    public static function invalidPayloads(): array
    {
        return [
            'missing client name' => [['clientName' => null], 'clientName'],
            'blank client name' => [['clientName' => '   '], 'clientName'],
            'missing project name' => [['projectName' => ''], 'projectName'],
            'invalid status' => [['status' => 'Done'], 'status'],
            'invalid priority' => [['priority' => 'Urgent'], 'priority'],
            'malformed date' => [['startDate' => '01/06/2026'], 'startDate'],
            'impossible date' => [['dueDate' => '2026-02-30'], 'dueDate'],
        ];
    }

    #[DataProvider('invalidPayloads')]
    public function test_it_rejects_invalid_payloads(array $overrides, string $field): void
    {
        $this->postJson('/projects', $this->validPayload($overrides))
            ->assertUnprocessable()
            ->assertJsonValidationErrors([$field]);

        $this->assertDatabaseCount('projects', 0);
    }

    public function test_it_rejects_malformed_json_with_a_clear_message(): void
    {
        $this->call('POST', '/projects', server: [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
        ], content: '{"clientName": "Acme",')
            ->assertStatus(400)
            ->assertJsonPath('message', 'The request body is not valid JSON: Syntax error.');
    }

    public function test_due_date_cannot_be_before_start_date(): void
    {
        $this->postJson('/projects', $this->validPayload([
            'startDate' => '2026-07-01',
            'dueDate' => '2026-06-30',
        ]))
            ->assertUnprocessable()
            ->assertJsonPath('errors.dueDate.0', 'The due date cannot be earlier than the start date.');
    }

    public function test_due_date_may_equal_start_date(): void
    {
        $this->postJson('/projects', $this->validPayload([
            'startDate' => '2026-07-01',
            'dueDate' => '2026-07-01',
        ]))->assertCreated();
    }


    public function test_it_updates_a_project(): void
    {
        $project = Project::factory()->create();

        $this->putJson("/projects/{$project->id}", $this->validPayload(['status' => 'Completed']))
            ->assertOk()
            ->assertJsonPath('data.status', 'Completed');

        $this->assertSame('Completed', $project->fresh()->status->value);
    }

    public function test_update_validates_the_payload(): void
    {
        $project = Project::factory()->create();

        $this->putJson("/projects/{$project->id}", $this->validPayload(['priority' => 'Critical']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['priority']);
    }

    public function test_updating_a_missing_project_returns_404(): void
    {
        $this->putJson('/projects/999', $this->validPayload())->assertNotFound();
    }


    public function test_it_deletes_a_project(): void
    {
        $project = Project::factory()->create();

        $this->deleteJson("/projects/{$project->id}")->assertNoContent();

        $this->assertModelMissing($project);
    }

    public function test_deleting_a_missing_project_returns_404(): void
    {
        $this->deleteJson('/projects/999')->assertNotFound();
    }
}
