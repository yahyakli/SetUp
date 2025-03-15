<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FileController;


// File Routes - All protected by auth middleware
Route::middleware('jwt.auth')->group(function () {
    // Basic CRUD
    Route::post('/files', [FileController::class, 'store']);
    Route::get('/files/{id}', [FileController::class, 'show']);
    Route::delete('/files/{id}', [FileController::class, 'destroy']);
    Route::delete('/files/delete', [FileController::class, 'deleteByUrl']);
    Route::get('/files', [FileController::class, 'index']);

    // Special routes for common operations
    Route::post('/files/avatar/{userId}', [FileController::class, 'storeAvatar']);
    Route::get('/files/avatar/{userId}', [FileController::class, 'getAvatar']);
    Route::post('/files/task/{taskId}', [FileController::class, 'storeTaskAttachment']);
    Route::get('/files/task/{taskId}', [FileController::class, 'getTaskAttachments']);
    Route::get('/files/user/{userId}', [FileController::class, 'getUserFiles']);
    Route::get('/files/download/{id}', [FileController::class, 'download']);
    Route::post('/files/batch', [FileController::class, 'batchUpload']);
    Route::delete('/files/batch', [FileController::class, 'batchDelete']);
});
