<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;

class ProjectController extends Controller
{
    /**
     * Display a listing of the projects.
     */
    public function index()
    {
        $projects = Project::all();
        return response()->json(['projects' => $projects], 200);
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:active,archived,completed',
            'owner_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project = Project::create($request->all());
        return response()->json(['project' => $project, 'message' => 'Project created successfully'], 201);
    }

    /**
     * Display the specified project.
     */
    public function show($id)
    {
        $project = Project::findOrFail($id);
        return response()->json(['project' => $project], 200);
    }

    /**
     * Update the specified project in storage.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'status' => 'sometimes|required|in:active,archived,completed',
            'owner_id' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project = Project::findOrFail($id);
        $project->update($request->all());

        return response()->json(['project' => $project, 'message' => 'Project updated successfully'], 200);
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully'], 200);
    }

    /**
     * Get projects by status.
     */
    public function getByStatus($status)
    {
        $validator = Validator::make(['status' => $status], [
            'status' => 'required|in:active,archived,completed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $projects = Project::where('status', $status)->get();
        return response()->json(['projects' => $projects], 200);
    }

    /**
     * Get projects by owner.
     */
    public function getByOwner($ownerId)
    {
        $projects = Project::where('owner_id', $ownerId)->get();
        return response()->json(['projects' => $projects], 200);
    }

    /**
     * Get projects ending soon (within the next 14 days).
     */
    public function getEndingSoon()
    {
        $twoWeeksFromNow = Carbon::now()->addDays(14);
        $projects = Project::where('end_date', '<=', $twoWeeksFromNow)
            ->where('status', 'active')
            ->get();

        return response()->json(['projects' => $projects], 200);
    }

    /**
     * Get projects with their associated teams.
     */
    public function getProjectsWithTeams()
    {
        $projects = Project::with('teams')->get();
        return response()->json(['projects' => $projects], 200);
    }

    /**
     * Assign a team to a project.
     */
    public function assignTeam(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'team_id' => 'required|exists:teams,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project = Project::findOrFail($request->project_id);
        $team = Team::findOrFail($request->team_id);

        // Check if the team is already assigned to the project
        if ($project->teams()->where('team_id', $team->id)->exists()) {
            return response()->json(['message' => 'Team is already assigned to this project'], 422);
        }

        $project->teams()->attach($team->id);

        return response()->json([
            'message' => 'Team assigned to project successfully',
            'project' => $project->load('teams')
        ], 200);
    }

    /**
     * Remove a team from a project.
     */
    public function removeTeam(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'team_id' => 'required|exists:teams,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project = Project::findOrFail($request->project_id);
        $project->teams()->detach($request->team_id);

        return response()->json([
            'message' => 'Team removed from project successfully',
            'project' => $project->load('teams')
        ], 200);
    }

    /**
     * Update project status.
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,archived,completed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project = Project::findOrFail($id);
        $project->status = $request->status;
        $project->save();

        return response()->json(['project' => $project, 'message' => 'Project status updated successfully'], 200);
    }

    /**
     * Search projects by name or description.
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:2',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $query = $request->input('query');
        $projects = Project::where('name', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->get();

        return response()->json(['projects' => $projects], 200);
    }

    /**
     * Get project statistics.
     */
    public function statistics()
    {
        $totalProjects = Project::count();
        $activeProjects = Project::where('status', 'active')->count();
        $completedProjects = Project::where('status', 'completed')->count();
        $archivedProjects = Project::where('status', 'archived')->count();

        $stats = [
            'total' => $totalProjects,
            'active' => $activeProjects,
            'completed' => $completedProjects,
            'archived' => $archivedProjects,
            'percent_completed' => $totalProjects > 0 ? round(($completedProjects / $totalProjects) * 100, 2) : 0,
        ];

        return response()->json(['statistics' => $stats], 200);
    }
}
