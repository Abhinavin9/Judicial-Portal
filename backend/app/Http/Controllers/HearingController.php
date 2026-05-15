<?php

namespace App\Http\Controllers;

use App\Models\Hearing;
use App\Models\CaseModel;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HearingController extends Controller
{
    public function index(Request $request)
    {
        $query = Hearing::with(['case', 'judge', 'participants']);

        $user = Auth::user();

        // Filter based on user role
        if ($user->isJudge()) {
            $query->where('judge_id', $user->id);
        } elseif ($user->isLawyer() || $user->isClient() || $user->isPolice()) {
            $query->whereHas('participants', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->where('hearing_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->where('hearing_date', '<=', $request->end_date);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by case
        if ($request->filled('case_id')) {
            $query->where('case_id', $request->case_id);
        }

        $sortBy = $request->get('sort_by', 'hearing_date');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $hearings = $query->paginate($request->get('per_page', 15));

        return response()->json($hearings);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'case_id' => 'required|exists:cases,id',
            'hearing_date' => 'required|date',
            'hearing_time' => 'required',
            'hearing_type' => 'required|in:pre_trial,trial,bail,final,motion',
            'room_number' => 'nullable|string',
            'judge_id' => 'required|exists:users,id',
            'notes' => 'nullable|string',
            'duration_minutes' => 'nullable|integer',
            'is_online' => 'boolean',
            'participant_ids' => 'nullable|array',
            'participant_ids.*' => 'exists:users,id',
        ]);

        $hearing = Hearing::create($validated);

        // Generate Jitsi meeting link if online
        if ($validated['is_online']) {
            $roomName = 'hearing-' . $hearing->id . '-' . time();
            $hearing->meeting_link = "https://meet.jit.si/{$roomName}";
            $hearing->save();
        }
        $case = CaseModel::find($validated['case_id']);
        $participantsToAttach = collect([$case->client_id, $case->assigned_lawyer_id])
            ->filter()
            ->unique();

        // Merge with manually provided participant_ids
        if (isset($validated['participant_ids'])) {
            $participantsToAttach = $participantsToAttach->merge($validated['participant_ids'])->unique();
        }

        foreach ($participantsToAttach as $userId) {
            $hearing->participants()->syncWithoutDetaching([$userId => ['role' => 'participant']]);
        }

        // Update case next hearing date
        $case = CaseModel::find($validated['case_id']);
        $case->next_hearing_date = $validated['hearing_date'] . ' ' . $validated['hearing_time'];
        $case->save();

        // Notify all participants
        $participants = $hearing->participants;
        foreach ($participants as $participant) {
            Notification::create([
                'user_id' => $participant->id,
                'type' => Notification::TYPE_HEARING_SCHEDULED,
                'title' => 'Hearing Scheduled',
                'message' => "A hearing has been scheduled for case {$case->case_number} on {$hearing->hearing_date}",
                'link' => "/hearings/{$hearing->id}",
            ]);
        }

        return response()->json([
            'message' => 'Hearing scheduled successfully',
            'hearing' => $hearing->load(['case', 'judge', 'participants']),
        ], 201);
    }

    public function show($id)
    {
        $hearing = Hearing::with(['case', 'judge', 'participants'])
            ->findOrFail($id);

        return response()->json($hearing);
    }

    public function update(Request $request, $id)
    {
        $hearing = Hearing::findOrFail($id);

        $validated = $request->validate([
            'hearing_date' => 'sometimes|date',
            'hearing_time' => 'sometimes',
            'hearing_type' => 'sometimes|in:pre_trial,trial,bail,final,motion',
            'status' => 'sometimes|in:scheduled,in_progress,completed,cancelled,rescheduled',
            'room_number' => 'nullable|string',
            'notes' => 'nullable|string',
            'duration_minutes' => 'nullable|integer',
        ]);

        $oldDate = $hearing->hearing_date;
        $hearing->update($validated);

        // Notify on reschedule
        if (isset($validated['hearing_date']) && $oldDate != $validated['hearing_date']) {
            $participants = $hearing->participants;
            foreach ($participants as $participant) {
                Notification::create([
                    'user_id' => $participant->id,
                    'type' => Notification::TYPE_HEARING_SCHEDULED,
                    'title' => 'Hearing Rescheduled',
                    'message' => "Hearing {$hearing->hearing_number} has been rescheduled to {$hearing->hearing_date}",
                    'link' => "/hearings/{$hearing->id}",
                ]);
            }
        }

        // Notify on cancellation
        if (isset($validated['status']) && $validated['status'] === 'cancelled') {
            $participants = $hearing->participants;
            foreach ($participants as $participant) {
                Notification::create([
                    'user_id' => $participant->id,
                    'type' => Notification::TYPE_HEARING_CANCELLED,
                    'title' => 'Hearing Cancelled',
                    'message' => "Hearing {$hearing->hearing_number} has been cancelled",
                    'link' => "/hearings/{$hearing->id}",
                ]);
            }
        }

        return response()->json([
            'message' => 'Hearing updated successfully',
            'hearing' => $hearing->load(['case', 'judge', 'participants']),
        ]);
    }

    public function destroy($id)
    {
        $hearing = Hearing::findOrFail($id);
        $hearing->delete();

        return response()->json([
            'message' => 'Hearing deleted successfully',
        ]);
    }

    public function calendar(Request $request)
    {
        $query = Hearing::with(['case', 'judge']);

        $user = Auth::user();

        if ($user->isJudge()) {
            $query->where('judge_id', $user->id);
        } elseif ($user->isLawyer() || $user->isClient()) {
            $query->whereHas('participants', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        if ($request->has('month')) {
            $query->whereMonth('hearing_date', $request->month);
        }
        if ($request->has('year')) {
            $query->whereYear('hearing_date', $request->year);
        }

        $hearings = $query->get();

        return response()->json($hearings);
    }

    public function stats()
    {
        $user = Auth::user();
        $query = Hearing::query();

        if ($user->isJudge()) {
            $query->where('judge_id', $user->id);
        } elseif ($user->isLawyer() || $user->isClient()) {
            $query->whereHas('participants', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $stats = [
            'total' => $query->count(),
            'scheduled' => (clone $query)->where('status', 'scheduled')->count(),
            'completed' => (clone $query)->where('status', 'completed')->count(),
            'cancelled' => (clone $query)->where('status', 'cancelled')->count(),
            'upcoming' => (clone $query)->where('hearing_date', '>=', now())->where('status', 'scheduled')->count(),
        ];

        return response()->json($stats);
    }
}
