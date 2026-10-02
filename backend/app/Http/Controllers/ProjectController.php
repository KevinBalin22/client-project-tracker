<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListProjectsRequest;
use App\Http\Requests\ProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProjectController extends Controller
{
    public function index(ListProjectsRequest $request): AnonymousResourceCollection
    {
        $projects = Project::query()
            ->search($request->validated('search'))
            ->when($request->validated('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->validated('priority'), fn ($q, $priority) => $q->where('priority', $priority))
            ->sortByField(
                $request->validated('sortBy') ?? 'createdAt',
                $request->validated('sortDir') ?? 'desc',
            )
            ->get();

        return ProjectResource::collection($projects);
    }

    public function show(Project $project): ProjectResource
    {
        return new ProjectResource($project);
    }

    public function store(ProjectRequest $request): JsonResponse
    {
        $project = Project::create($request->toModelAttributes());

        return (new ProjectResource($project))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(ProjectRequest $request, Project $project): ProjectResource
    {
        $project->update($request->toModelAttributes());

        return new ProjectResource($project);
    }

    public function destroy(Project $project): Response
    {
        $project->delete();

        return response()->noContent();
    }
}
