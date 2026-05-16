<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Notification;
use App\Models\CaseModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::with(['case', 'uploader']);
        $user = Auth::user();

        if ($user->isClient()) {
            $query->whereHas('case', function($q) use ($user) {
                $q->where('client_id', $user->id);
            });
        } elseif ($user->isLawyer()) {
            $query->whereHas('case', function($q) use ($user) {
                $q->where('assigned_lawyer_id', $user->id);
            });
        } elseif ($user->isJudge()) {
            $query->whereHas('case', function($q) use ($user) {
                $q->where('assigned_judge_id', $user->id);
            });
        }

        if ($request->has('case_id')) {
            $query->where('case_id', $request->case_id);
        }

        if ($request->has('document_type')) {
            $query->where('document_type', $request->document_type);
        }

        $documents = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($documents);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'case_id' => 'required|exists:cases,id',
            'document_type' => 'required|in:petition,evidence,order,judgment,notice,affidavit,written_statement,other',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
        ]);

        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('documents', $fileName, 'public');

        $document = Document::create([
            'case_id' => $validated['case_id'],
            'uploaded_by' => Auth::id(),
            'document_type' => $validated['document_type'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        // Notify case participants
        $case = CaseModel::with(['client', 'judge', 'lawyer'])->find($validated['case_id']);
        $notifyUsers = collect([$case->client_id, $case->assigned_judge_id, $case->assigned_lawyer_id])
            ->filter()
            ->unique()
            ->reject(fn($id) => $id === Auth::id());

        foreach ($notifyUsers as $userId) {
            Notification::create([
                'user_id' => $userId,
                'type' => Notification::TYPE_DOCUMENT_UPLOADED,
                'title' => 'Document Uploaded',
                'message' => "A new document has been uploaded to case {$case->case_number}",
                'link' => "/cases/{$case->id}",
            ]);
        }

        return response()->json([
            'message' => 'Document uploaded successfully',
            'document' => $document->load(['case', 'uploader']),
        ], 201);
    }

    public function show($id)
    {
        $document = Document::with(['case', 'uploader'])->findOrFail($id);
        return response()->json($document);
    }

    public function download($id)
    {
        $document = Document::with('case')->findOrFail($id);
        $user = Auth::user();

        // RBAC Check
        if ($user->isClient() && $document->case->client_id !== $user->id) {
            abort(403, 'Unauthorized access to this document.');
        }

        if (!Storage::disk('public')->exists($document->file_path)) {
            return response()->json(['message' => 'File not found on server.'], 404);
        }

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    public function destroy($id)
    {
        $document = Document::findOrFail($id);
        
        // Delete file from storage
        Storage::disk('public')->delete($document->file_path);
        
        $document->delete();

        return response()->json([
            'message' => 'Document deleted successfully',
        ]);
    }
}
