<?php

namespace App\Http\Controllers;

use App\Models\TeamMember;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TeamMemberController extends Controller
{
    /**
     * Display a listing of all team members.
     */
    public function index()
    {
        $teamMembers = TeamMember::with('team')->get();
        return response()->json(['team_members' => $teamMembers], 200);
    }

    /**
     * Store a newly created team member in storage.
     */
    public function store(Request $request)
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

        $teamMember = new TeamMember();
        $teamMember->team_id = $request->team_id;
        $teamMember->user_id = $request->user_id;
        $teamMember->role = $request->role;
        $teamMember->joined_at = now();
        $teamMember->save();

        $team = Team::findOrFail($request->team_id);
        

        return response()->json($team, 201);
    }

    /**
     * Display the specified team member.
     */
    public function show($id)
    {
        $teamMember = TeamMember::with('team')->findOrFail($id);
        return response()->json(['team_member' => $teamMember], 200);
    }

    /**
     * Update the specified team member in storage.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:owner,leader,manager,developer,tester,designer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $teamMember = TeamMember::findOrFail($id);
        $teamMember->role = $request->role;
        $teamMember->save();

        return response()->json(['team_member' => $teamMember, 'message' => 'Team member updated successfully'], 200);
    }

    /**
     * Remove the specified team member from storage.
     */
    public function destroy($id)
    {
        $teamMember = TeamMember::findOrFail($id);
        $teamMember->delete();

        return response()->json(['message' => 'Team member removed successfully'], 200);
    }

    /**
     * Get all members with a specific role.
     */
    public function getByRole($role)
    {
        $validator = Validator::make(['role' => $role], [
            'role' => 'required|in:owner,leader,manager,developer,tester,designer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $teamMembers = TeamMember::where('role', $role)
            ->with('team')
            ->get();

        return response()->json(['team_members' => $teamMembers], 200);
    }

    /**
     * Get all team memberships for a specific user.
     */
    public function getUserTeams($userId)
    {
        $teamMemberships = TeamMember::where('user_id', $userId)
            ->with('team')
            ->get();

        return response()->json(['team_memberships' => $teamMemberships], 200);
    }

    /**
     * Get all members of a specific team.
     */
    public function getTeamMembers($teamId)
    {
        $team = Team::findOrFail($teamId);
        $members = $team->members;

        return response()->json(['team' => $team->name, 'members' => $members], 200);
    }

    /**
     * Bulk add members to a team.
     */
    public function bulkAddMembers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'team_id' => 'required|exists:teams,id',
            'members' => 'required|array|min:1',
            'members.*.user_id' => 'required|string',
            'members.*.role' => 'required|in:owner,leader,manager,developer,tester,designer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $team = Team::findOrFail($request->team_id);
        $addedMembers = [];
        $skippedMembers = [];

        foreach ($request->members as $memberData) {
            // Check if user is already a member of this team
            $existingMember = TeamMember::where('team_id', $team->id)
                ->where('user_id', $memberData['user_id'])
                ->first();

            if ($existingMember) {
                $skippedMembers[] = $memberData['user_id'];
                continue;
            }

            $teamMember = new TeamMember();
            $teamMember->team_id = $team->id;
            $teamMember->user_id = $memberData['user_id'];
            $teamMember->role = $memberData['role'];
            $teamMember->joined_at = now();
            $teamMember->save();

            $addedMembers[] = $teamMember;
        }

        return response()->json([
            'message' => count($addedMembers) . ' members added successfully',
            'added_members' => $addedMembers,
            'skipped_members' => $skippedMembers,
            'team' => $team->load('members')
        ], 200);
    }

    /**
     * Transfer a member from one team to another.
     */
    public function transferMember(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|string',
            'from_team_id' => 'required|exists:teams,id',
            'to_team_id' => 'required|exists:teams,id|different:from_team_id',
            'new_role' => 'sometimes|in:owner,leader,manager,developer,tester,designer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if user is a member of the source team
        $sourceMember = TeamMember::where('team_id', $request->from_team_id)
            ->where('user_id', $request->user_id)
            ->first();

        if (!$sourceMember) {
            return response()->json(['message' => 'User is not a member of the source team'], 404);
        }

        // Check if user is already a member of the destination team
        $existingMember = TeamMember::where('team_id', $request->to_team_id)
            ->where('user_id', $request->user_id)
            ->first();

        if ($existingMember) {
            return response()->json(['message' => 'User is already a member of the destination team'], 422);
        }

        // Create new membership in destination team
        $newMember = new TeamMember();
        $newMember->team_id = $request->to_team_id;
        $newMember->user_id = $request->user_id;
        $newMember->role = $request->new_role ?? $sourceMember->role;
        $newMember->joined_at = now();
        $newMember->save();

        // Remove from source team
        $sourceMember->delete();

        return response()->json([
            'message' => 'Member transferred successfully',
            'new_membership' => $newMember,
            'from_team' => Team::find($request->from_team_id)->name,
            'to_team' => Team::find($request->to_team_id)->name
        ], 200);
    }

    /**
     * Get member count by role.
     */
    public function getMemberCountByRole()
    {
        $roleCounts = TeamMember::select('role')
            ->selectRaw('count(*) as count')
            ->groupBy('role')
            ->get();

        return response()->json(['role_counts' => $roleCounts], 200);
    }
}
