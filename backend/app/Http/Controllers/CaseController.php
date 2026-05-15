<?php

namespace App\Http\Controllers;

use App\Models\CaseModel;
use App\Models\CaseTimeline;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class CaseController extends Controller
{
    public function index(Request $request)
    {
        $query = CaseModel::with(['client:id,name', 'judge:id,name', 'lawyer:id,name']);

        $user = Auth::user();

        // Filter based on user role
        if ($user->isClient()) {
            $query->where('client_id', $user->id);
        } elseif ($user->isLawyer()) {
            $query->where('assigned_lawyer_id', $user->id);
        } elseif ($user->isJudge()) {
            $query->where('assigned_judge_id', $user->id);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('case_number', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('case_type', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by case type
        if ($request->filled('case_type')) {
            $query->where('case_type', $request->case_type);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $cases = $query->paginate($request->get('per_page', 15));

        return response()->json($cases);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user->isSuperAdmin() && !$user->isCourtAdmin() && !$user->isClerk() && !$user->isJudge()) {
            return response()->json(['message' => 'Access denied. You do not have permission to create cases.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'case_type' => 'required|string',
            'description' => 'required|string',
            'filing_date' => 'required|date',
            'priority' => 'required|in:low,medium,high,urgent',
            'client_id' => 'required|exists:users,id',
            'assigned_judge_id' => 'nullable|exists:users,id',
            'assigned_lawyer_id' => 'nullable|exists:users,id',
        ]);

        $case = CaseModel::create($validated);

        // Create timeline entry
        CaseTimeline::create([
            'case_id' => $case->id,
            'user_id' => Auth::id(),
            'action' => 'Case Filed',
            'description' => 'Case was filed in the system',
        ]);

        // Notify assigned users
        if ($case->assigned_judge_id) {
            Notification::create([
                'user_id' => $case->assigned_judge_id,
                'type' => Notification::TYPE_CASE_ASSIGNED,
                'title' => 'New Case Assigned',
                'message' => "Case {$case->case_number} has been assigned to you",
                'link' => "/cases/{$case->id}",
            ]);
        }

        if ($case->assigned_lawyer_id) {
            Notification::create([
                'user_id' => $case->assigned_lawyer_id,
                'type' => Notification::TYPE_CASE_ASSIGNED,
                'title' => 'New Case Assigned',
                'message' => "Case {$case->case_number} has been assigned to you",
                'link' => "/cases/{$case->id}",
            ]);
        }

        // Clear dashboard cache
        Cache::flush();

        return response()->json([
            'message' => 'Case created successfully',
            'case' => $case->load(['client', 'judge', 'lawyer']),
        ], 201);
    }

    public function show($id)
    {
        $case = CaseModel::with(['client', 'judge', 'lawyer', 'hearings', 'documents', 'timeline.user', 'fir'])
            ->findOrFail($id);

        $user = Auth::user();

        // Enforce access control
        if ($user->isClient() && $case->client_id !== $user->id) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        if ($user->isLawyer() && $case->assigned_lawyer_id !== $user->id) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        if ($user->isJudge() && $case->assigned_judge_id !== $user->id) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        return response()->json($case);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user->isSuperAdmin() && !$user->isCourtAdmin() && !$user->isClerk() && !$user->isJudge()) {
            return response()->json(['message' => 'Access denied. Only Judge, Court personnel or Super Admins can update case status.'], 403);
        }

        $case = CaseModel::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'case_type' => 'sometimes|string',
            'description' => 'sometimes|string',
            'status' => 'sometimes|in:filed,pending,in_progress,adjourned,closed,dismissed',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'assigned_judge_id' => 'nullable|exists:users,id',
            'assigned_lawyer_id' => 'nullable|exists:users,id',
            'next_hearing_date' => 'nullable|date',
        ]);

        $oldStatus = $case->status;
        $case->update($validated);
        Cache::flush();

        // Create timeline entry
        CaseTimeline::create([
            'case_id' => $case->id,
            'user_id' => Auth::id(),
            'action' => 'Case Updated',
            'description' => 'Case details were updated',
        ]);

        // Notify on status change
        if (isset($validated['status']) && $oldStatus !== $validated['status']) {
            Notification::create([
                'user_id' => $case->client_id,
                'type' => Notification::TYPE_CASE_STATUS_CHANGED,
                'title' => 'Case Status Changed',
                'message' => "Case {$case->case_number} status changed to {$case->status}",
                'link' => "/cases/{$case->id}",
            ]);
        }

        return response()->json([
            'message' => 'Case updated successfully',
            'case' => $case->load(['client', 'judge', 'lawyer']),
        ]);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        if (!$user->isSuperAdmin() && !$user->isCourtAdmin()) {
            return response()->json(['message' => 'Access denied. Only administrators can delete cases.'], 403);
        }

        $case = CaseModel::findOrFail($id);
        $case->delete();
        Cache::flush();

        return response()->json([
            'message' => 'Case deleted successfully',
        ]);
    }

    public function stats()
    {
        $user = Auth::user();
        $query = CaseModel::query();

        if ($user->isClient()) {
            $query->where('client_id', $user->id);
        } elseif ($user->isLawyer()) {
            $query->where('assigned_lawyer_id', $user->id);
        } elseif ($user->isJudge()) {
            $query->where('assigned_judge_id', $user->id);
        }

        $stats = $query->selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN status = 'filed' THEN 1 ELSE 0 END) as filed,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
            SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as priority_low,
            SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as priority_medium,
            SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as priority_high,
            SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as priority_urgent
        ")->first();

        return response()->json([
            'total' => (int)$stats->total,
            'filed' => (int)$stats->filed,
            'pending' => (int)$stats->pending,
            'in_progress' => (int)$stats->in_progress,
            'closed' => (int)$stats->closed,
            'by_priority' => [
                'low' => (int)$stats->priority_low,
                'medium' => (int)$stats->priority_medium,
                'high' => (int)$stats->priority_high,
                'urgent' => (int)$stats->priority_urgent,
            ],
        ]);
    }
}
