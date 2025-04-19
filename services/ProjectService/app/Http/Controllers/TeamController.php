<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;;

class TeamController extends Controller
{
    /**
     * Display a listing of the teams.
     */
    public function index()
    {
        $teams = Team::with('members', 'projects')->get();
        return response()->json(['teams' => $teams], 200);
    }

    /**
     * Store a newly created team in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'user_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $team = Team::create($request->all());
        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $request->user_id,
            'role' => 'owner',
        ]);
        return response()->json($team->load('members'), 201);
    }

    /**
     * Display the specified team.
     */
    public function show($id)
    {
        $team = Team::with(['members', 'projects'])->findOrFail($id);
        return response()->json(['team' => $team], 200);
    }


    /**
     * Update the specified team in storage.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $team = Team::findOrFail($id);
        $team->update($request->all());

        return response()->json(['team' => $team, 'message' => 'Team updated successfully'], 200);
    }

    /**
     * Remove the specified team from storage.
     */
    public function destroy($id)
    {
        $team = Team::findOrFail($id);
        $team->delete();

        return response()->json(['message' => 'Team deleted successfully'], 200);
    }

    /**
     * Get team with all members.
     */
    public function getTeamWithMembers($id)
    {
        $team = Team::with('members')->findOrFail($id);
        return response()->json(['team' => $team], 200);
    }

    /**
     * Add a member to a team.
     */
    public function addMember(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'team_id' => 'required|exists:teams,id',
            'user_id' => 'required|string',
            'role' => 'required|in:owner,leader,manager,developer,tester,designer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if user is already a member of this team
        $existingMember = TeamMember::where('team_id', $request->team_id)
            ->where('user_id', $request->user_id)
            ->first();

        if ($existingMember) {
            return response()->json(['message' => 'User is already a member of this team'], 422);
        }

        // Check if there's already a pending invitation
        $existingInvitation = Invitation::where('team_id', $request->team_id)
            ->where('user_id', $request->user_id)
            ->where('status', 'pending')
            ->first();

        if ($existingInvitation) {
            return response()->json([
                'message' => 'An invitation is already pending for this user',
                'invitation' => $existingInvitation,
            ], 422);
        }

        // Create new invitation
        $invitation = new Invitation();
        $invitation->team_id = $request->team_id;
        $invitation->user_id = $request->user_id;
        $invitation->role = $request->role;
        $invitation->token = Str::random(32);
        $invitation->status = 'pending';
        $invitation->save();

        // Here you could send an email notification to the user
        // You might want to create a dedicated job or notification for this

        return response()->json([
            'message' => 'Invitation sent successfully',
            'invitation' => $invitation,
        ], 201);
    }

    /**
     * Remove a member from a team.
     */
    public function removeMember(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'team_id' => 'required|exists:teams,id',
            'user_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $memberDeleted = TeamMember::where('team_id', $request->team_id)
            ->where('user_id', $request->user_id)
            ->delete();

        if ($memberDeleted === 0) {
            return response()->json(['message' => 'User is not a member of this team'], 404);
        }

        $team = Team::with('members')->find($request->team_id);

        return response()->json([
            'message' => 'Member removed from team successfully',
            'team' => $team
        ], 200);
    }

    /**
     * Update a team member's role.
     */
    public function updateMemberRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'team_id' => 'required|exists:teams,id',
            'user_id' => 'required|string',
            'role' => 'required|in:owner,leader,manager,developer,tester,designer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $teamMember = TeamMember::where('team_id', $request->team_id)
            ->where('user_id', $request->user_id)
            ->first();

        if (!$teamMember) {
            return response()->json(['message' => 'User is not a member of this team'], 404);
        }

        $teamMember->role = $request->role;
        $teamMember->save();

        return response()->json([
            'message' => 'Member role updated successfully',
            'team_member' => $teamMember
        ], 200);
    }

    /**
     * Get teams by a specific member.
     */
    public function getTeamsByMember($userId)
    {
        $teams = Team::whereHas('members', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->with('members')->get();

        return response()->json(['teams' => $teams], 200);
    }

    /**
     * Get teams by role.
     */
    public function getTeamsByRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:owner,leader,manager,developer,tester,designer',
            'user_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $teams = Team::whereHas('members', function ($query) use ($request) {
            $query->where('user_id', $request->user_id)
                ->where('role', $request->role);
        })->with('members')->get();

        return response()->json(['teams' => $teams], 200);
    }

    /**
     * Get all projects associated with a team.
     */
    public function getTeamProjects($id)
    {
        $team = Team::findOrFail($id);
        $projects = $team->projects;

        return response()->json(['team' => $team->name, 'projects' => $projects], 200);
    }

    /**
     * Get team statistics.
     */
    public function statistics()
    {
        $totalTeams = Team::count();

        $teamSizes = Team::withCount('members')->get()->pluck('members_count')->toArray();
        $avgTeamSize = count($teamSizes) > 0 ? array_sum($teamSizes) / count($teamSizes) : 0;

        $largestTeam = Team::withCount('members')
            ->orderBy('members_count', 'desc')
            ->first();

        $teamsWithoutProjects = Team::whereDoesntHave('projects')->count();

        $roleDistribution = TeamMember::select('role')
            ->selectRaw('count(*) as count')
            ->groupBy('role')
            ->get()
            ->pluck('count', 'role')
            ->toArray();

        $stats = [
            'total_teams' => $totalTeams,
            'average_team_size' => round($avgTeamSize, 2),
            'largest_team' => $largestTeam ? [
                'id' => $largestTeam->id,
                'name' => $largestTeam->name,
                'size' => $largestTeam->members_count
            ] : null,
            'teams_without_projects' => $teamsWithoutProjects,
            'role_distribution' => $roleDistribution
        ];

        return response()->json(['statistics' => $stats], 200);
    }

    /**
     * Search teams by name or description.
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
        $teams = Team::where('name', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->get();

        return response()->json(['teams' => $teams], 200);
    }
}
