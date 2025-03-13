<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    /**
     * Accept an invitation
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function accept(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $invitation = Invitation::where('token', $request->token)
            ->where('status', 'pending')
            ->first();

        if (!$invitation) {
            return response()->json([
                'message' => 'Invalid or expired invitation',
            ], 404);
        }

        // Add user to team
        $teamMember = new TeamMember();
        $teamMember->team_id = $invitation->team_id;
        $teamMember->user_id = $invitation->user_id;
        $teamMember->role = $invitation->role;
        $teamMember->joined_at = now();
        $teamMember->save();

        // Update invitation status
        $invitation->status = 'accepted';
        $invitation->accepted_at = now();
        $invitation->save();

        $team = Team::with('members')->find($invitation->team_id);

        return response()->json([
            'message' => 'Invitation accepted successfully',
            'team' => $team
        ], 200);
    }

    /**
     * Decline an invitation
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function decline(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $invitation = Invitation::where('token', $request->token)
            ->where('status', 'pending')
            ->first();

        if (!$invitation) {
            return response()->json([
                'message' => 'Invalid invitation',
            ], 404);
        }

        // Update invitation status
        $invitation->status = 'declined';
        $invitation->declined_at = now();
        $invitation->save();

        return response()->json([
            'message' => 'Invitation declined successfully',
        ], 200);
    }

    /**
     * List all invitations for a team
     *
     * @param Request $request
     * @param int $teamId
     * @return \Illuminate\Http\JsonResponse
     */
    public function listTeamInvitations($teamId)
    {
        // Check if team exists
        $team = Team::find($teamId);

        if (!$team) {
            return response()->json([
                'message' => 'Team not found',
            ], 404);
        }

        // Get all invitations for this team
        $invitations = Invitation::where('team_id', $teamId)
            ->where('status', 'pending')
            ->get();

        return response()->json($invitations, 200);
    }

    /**
     * List all invitations for a user
     *
     * @param Request $request
     * @param string $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function listUserInvitations($userId)
    {
        // Get all pending invitations for this user
        $invitations = Invitation::where('user_id', $userId)
            ->where('status', 'pending')
            ->with('team')
            ->get();

        return response()->json($invitations, 200);
    }
}
