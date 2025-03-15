<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileController extends Controller
{
    /**
     * Display a listing of files.
     */
    public function index(Request $request)
    {
        $query = File::query();

        // Apply filters if provided
        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('task_id')) {
            $query->where('task_id', $request->task_id);
        }

        $perPage = $request->get('per_page', 15);
        $files = $query->paginate($perPage);

        return response()->json($files);
    }

    /**
     * Store a new file.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file',
            'user_id' => 'nullable|string',
            'task_id' => 'nullable|string',
            'entity_type' => 'nullable|string',
            'is_public' => 'nullable|boolean',
        ]);

        if (!$request->hasFile('file')) {
            return response()->json(['error' => 'No file uploaded'], 400);
        }

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $fileType = $file->getClientMimeType();
        $fileSize = $file->getSize();

        // Generate a unique filename
        $filename = Str::random(32) . '.' . $file->getClientOriginalExtension();

        // Store the file
        $path = $file->storeAs('uploads', $filename, 'public');

        // Create file record
        $fileRecord = File::create([
            'filename' => $filename,
            'original_name' => $originalName,
            'file_path' => $path,
            'file_type' => $fileType,
            'file_size' => $fileSize,
            'user_id' => $request->user_id,
            'task_id' => $request->task_id,
            'entity_type' => $request->entity_type ?? 'general',
            'is_public' => $request->is_public ?? false,
        ]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'file' => $fileRecord,
            'url' => url('api/files/' . $fileRecord->id)
        ], 201);
    }

    /**
     * Display the specified file.
     */
    public function show($id)
    {
        $file = File::findOrFail($id);
        return response()->json($file);
    }

    /**
     * Remove the specified file.
     */
    public function destroy($id)
    {
        $file = File::findOrFail($id);

        // Delete the file from storage
        Storage::disk('public')->delete($file->file_path);

        // Delete the record
        $file->delete();

        return response()->json(['message' => 'File deleted successfully']);
    }

    /**
     * Download a file.
     */
    public function download($id)
    {
        $file = File::findOrFail($id);
        $path = Storage::disk('public')->path($file->file_path);

        return response()->download($path, $file->original_name);
    }

    /**
     * Store a user avatar.
     */
    public function storeAvatar(Request $request, $userId)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        if (!$request->hasFile('avatar')) {
            return response()->json(['error' => 'No avatar image uploaded'], 400);
        }

        // Delete existing avatar if exists
        $this->deleteExistingFiles($userId, 'avatar');

        $avatar = $request->file('avatar');
        $originalName = $avatar->getClientOriginalName();
        $fileType = $avatar->getClientMimeType();
        $fileSize = $avatar->getSize();

        // Generate a unique filename
        $filename = 'avatar_' . $userId . '_' . Str::random(16) . '.' . $avatar->getClientOriginalExtension();

        // Store the file
        $path = $avatar->storeAs('avatars', $filename, 'public');

        // Create file record
        $avatarRecord = File::create([
            'filename' => $filename,
            'original_name' => $originalName,
            'file_path' => $path,
            'file_type' => $fileType,
            'file_size' => $fileSize,
            'user_id' => $userId,
            'entity_type' => 'avatar',
            'is_public' => true, // Avatars are typically public
        ]);

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'file' => $avatarRecord,
            'url' => url('api/files/avatar/' . $userId)
        ], 201);
    }

    /**
     * Get a user's avatar.
     */
    public function getAvatar($userId)
    {
        $avatar = File::where('user_id', $userId)
            ->where('entity_type', 'avatar')
            ->latest()
            ->first();

        if (!$avatar) {
            return response()->json(['error' => 'Avatar not found'], 404);
        }

        // Return the file
        $path = Storage::disk('public')->path($avatar->file_path);

        return response()->file($path);
    }

    /**
     * Store a task attachment.
     */
    public function storeTaskAttachment(Request $request, $taskId)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'user_id' => 'nullable|string',
        ]);

        if (!$request->hasFile('file')) {
            return response()->json(['error' => 'No file uploaded'], 400);
        }

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $fileType = $file->getClientMimeType();
        $fileSize = $file->getSize();

        // Generate a unique filename
        $filename = 'task_' . $taskId . '_' . Str::random(16) . '.' . $file->getClientOriginalExtension();

        // Store the file
        $path = $file->storeAs('task_attachments', $filename, 'public');

        // Create file record
        $fileRecord = File::create([
            'filename' => $filename,
            'original_name' => $originalName,
            'file_path' => $path,
            'file_type' => $fileType,
            'file_size' => $fileSize,
            'user_id' => $request->user_id,
            'task_id' => $taskId,
            'entity_type' => 'task_attachment',
            'is_public' => false,
        ]);

        return response()->json([
            'message' => 'Task attachment uploaded successfully',
            'file' => $fileRecord,
            'url' => url('api/files/' . $fileRecord->id)
        ], 201);
    }

    /**
     * Get all attachments for a task.
     */
    public function getTaskAttachments($taskId)
    {
        $files = File::where('task_id', $taskId)
            ->where('entity_type', 'task_attachment')
            ->get();

        return response()->json($files);
    }

    /**
     * Get all files for a user.
     */
    public function getUserFiles($userId)
    {
        $files = File::where('user_id', $userId)->get();
        return response()->json($files);
    }

    /**
     * Upload multiple files at once.
     */
    public function batchUpload(Request $request)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'required|file|max:10240',
            'user_id' => 'nullable|string',
            'task_id' => 'nullable|string',
            'entity_type' => 'nullable|string',
            'is_public' => 'nullable|boolean',
        ]);

        $uploadedFiles = [];
        $failedFiles = [];

        foreach ($request->file('files') as $file) {
            try {
                $originalName = $file->getClientOriginalName();
                $fileType = $file->getClientMimeType();
                $fileSize = $file->getSize();

                // Generate a unique filename
                $filename = Str::random(32) . '.' . $file->getClientOriginalExtension();

                // Determine storage path based on entity type
                $storagePath = 'uploads';
                if ($request->entity_type === 'avatar') {
                    $storagePath = 'avatars';
                } elseif ($request->entity_type === 'task_attachment') {
                    $storagePath = 'task_attachments';
                }

                // Store the file
                $path = $file->storeAs($storagePath, $filename, 'public');

                // Create file record
                $fileRecord = File::create([
                    'filename' => $filename,
                    'original_name' => $originalName,
                    'file_path' => $path,
                    'file_type' => $fileType,
                    'file_size' => $fileSize,
                    'user_id' => $request->user_id,
                    'task_id' => $request->task_id,
                    'entity_type' => $request->entity_type ?? 'general',
                    'is_public' => $request->is_public ?? false,
                ]);

                $uploadedFiles[] = [
                    'file' => $fileRecord,
                    'url' => url('api/files/' . $fileRecord->id)
                ];
            } catch (\Exception $e) {
                $failedFiles[] = [
                    'name' => $file->getClientOriginalName(),
                    'error' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'message' => 'Batch upload completed',
            'uploaded' => $uploadedFiles,
            'failed' => $failedFiles,
            'total_uploaded' => count($uploadedFiles),
            'total_failed' => count($failedFiles)
        ]);
    }

    /**
     * Delete multiple files at once.
     */
    public function batchDelete(Request $request)
    {
        $request->validate([
            'file_ids' => 'required|array',
            'file_ids.*' => 'required|integer|exists:files,id',
        ]);

        $deletedFiles = [];
        $failedFiles = [];

        foreach ($request->file_ids as $fileId) {
            try {
                $file = File::findOrFail($fileId);

                // Delete the file from storage
                Storage::disk('public')->delete($file->file_path);

                // Delete the record
                $file->delete();

                $deletedFiles[] = $fileId;
            } catch (\Exception $e) {
                $failedFiles[] = [
                    'id' => $fileId,
                    'error' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'message' => 'Batch delete completed',
            'deleted' => $deletedFiles,
            'failed' => $failedFiles,
            'total_deleted' => count($deletedFiles),
            'total_failed' => count($failedFiles)
        ]);
    }

    /**
     * Helper method to delete existing files of a specific type
     */
    private function deleteExistingFiles($userId, $entityType)
    {
        $existingFiles = File::where('user_id', $userId)
            ->where('entity_type', $entityType)
            ->get();

        foreach ($existingFiles as $file) {
            Storage::disk('public')->delete($file->file_path);
            $file->delete();
        }
    }

    /**
     * Delete a file by its URL.
     */
    public function deleteByUrl(Request $request)
    {
        $request->validate([
            'url' => 'required|string',
        ]);

        $url = $request->url;
        $urlParts = explode('/', $url);
        $fileId = end($urlParts);

        // Ensure the ID is numeric
        if (!is_numeric($fileId)) {
            return response()->json(['error' => 'Invalid file URL format'], 400);
        }

        try {
            $file = File::findOrFail($fileId);

            // Delete the file from storage
            Storage::disk('public')->delete($file->file_path);

            // Delete the record
            $file->delete();

            return response()->json(['message' => 'File deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'File not found or could not be deleted', 'message' => $e->getMessage()], 404);
        }
    }
}
