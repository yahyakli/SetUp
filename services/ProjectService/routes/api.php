<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamMemberController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('verify.token')->group(function () {
    // Project Routes
    Route::prefix('projects')->group(function () {
        // Basic CRUD
        Route::get('/', [ProjectController::class, 'index']);
        Route::post('/', [ProjectController::class, 'store']);
        Route::get('/{id}', [ProjectController::class, 'show']);
        Route::put('/{id}', [ProjectController::class, 'update']);
        Route::delete('/{id}', [ProjectController::class, 'destroy']);

        // Additional functionalities
        Route::get('/status/{status}', [ProjectController::class, 'getByStatus']);
        Route::get('/owner/{ownerId}', [ProjectController::class, 'getByOwner']);
        Route::get('/ending-soon', [ProjectController::class, 'getEndingSoon']);
        Route::get('/with-teams', [ProjectController::class, 'getProjectsWithTeams']);
        Route::post('/assign-team', [ProjectController::class, 'assignTeam']);
        Route::post('/remove-team', [ProjectController::class, 'removeTeam']);
        Route::patch('/{id}/status', [ProjectController::class, 'updateStatus']);
        Route::post('/search', [ProjectController::class, 'search']);
        Route::get('/statistics', [ProjectController::class, 'statistics']);
    });

    // Team Routes
    Route::prefix('teams')->group(function () {
        // Basic CRUD
        Route::get('/', [TeamController::class, 'index']);
        Route::post('/', [TeamController::class, 'store']);
        Route::get('/{id}', [TeamController::class, 'show']);
        Route::put('/{id}', [TeamController::class, 'update']);
        Route::delete('/{id}', [TeamController::class, 'destroy']);

        // Additional functionalities
        Route::get('/{id}/with-members', [TeamController::class, 'getTeamWithMembers']);
        Route::post('/add-member', [TeamController::class, 'addMember']);
        Route::post('/remove-member', [TeamController::class, 'removeMember']);
        Route::post('/update-member-role', [TeamController::class, 'updateMemberRole']);
        Route::get('/member/{userId}', [TeamController::class, 'getTeamsByMember']);
        Route::post('/by-role', [TeamController::class, 'getTeamsByRole']);
        Route::get('/{id}/projects', [TeamController::class, 'getTeamProjects']);
        Route::get('/statistics', [TeamController::class, 'statistics']);
        Route::post('/search', [TeamController::class, 'search']);
    });

    // Team Member Routes
    Route::prefix('team-members')->group(function () {
        // Basic CRUD
        Route::get('/', [TeamMemberController::class, 'index']);
        Route::post('/', [TeamMemberController::class, 'store']);
        Route::get('/{id}', [TeamMemberController::class, 'show']);
        Route::put('/{id}', [TeamMemberController::class, 'update']);
        Route::delete('/{id}', [TeamMemberController::class, 'destroy']);

        // Additional functionalities
        Route::get('/role/{role}', [TeamMemberController::class, 'getByRole']);
        Route::get('/user/{userId}', [TeamMemberController::class, 'getUserTeams']);
        Route::get('/team/{teamId}', [TeamMemberController::class, 'getTeamMembers']);
        Route::post('/bulk-add', [TeamMemberController::class, 'bulkAddMembers']);
        Route::post('/transfer', [TeamMemberController::class, 'transferMember']);
        Route::get('/role-counts', [TeamMemberController::class, 'getMemberCountByRole']);
    });

    // API Routes for direct access to project-team relationships (optional)
    Route::prefix('project-teams')->group(function () {
        Route::get('/project/{projectId}', [ProjectController::class, 'getProjectsWithTeams']);
        Route::get('/team/{teamId}', [TeamController::class, 'getTeamProjects']);
    });

    // Default route for API status
    Route::get('/', function () {
        return response()->json([
            'status' => 'API is running',
            'version' => '1.0',
        ]);
    });
});
