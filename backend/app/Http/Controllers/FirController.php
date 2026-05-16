<?php

namespace App\Http\Controllers;

use App\Models\Fir;
use App\Models\FirAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;

class FirController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Fir::with(['filedBy', 'linkedCase']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Access Control
        if ($user->isPolice()) {
            // Police can see all FIRs filed by their department/station or all for now
        } elseif (!$user->isSuperAdmin() && !$user->isJudge()) {
            // Other roles (Lawyer, Client) cannot see general FIR list
            return response()->json(['message' => 'Access denied'], 403);
        }

        $firs = $query->latest()->paginate(10);
        return response()->json($firs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'incident_date' => 'required|date',
            'location' => 'required|string|max:255',
            'police_station_id' => 'nullable|string|max:255',
        ]);

        $validated['fir_number'] = 'FIR-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $validated['filed_by_id'] = $request->user()->id;
        $validated['status'] = 'pending';

        $fir = Fir::create($validated);
        Cache::flush();

        return response()->json([
            'message' => 'FIR filed successfully',
            'fir' => $fir
        ], 201);
    }

    public function show($id, Request $request)
    {
        $fir = Fir::with(['filedBy', 'linkedCase', 'evidences.uploadedBy', 'assignments.officer', 'assignments.assignedBy'])->findOrFail($id);
        $user = $request->user();

        // Access Control
        if (!$user->isPolice() && !$user->isSuperAdmin() && !$user->isJudge()) {
            if (!$fir->linked_case_id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
            
            $case = $fir->linkedCase;
            if ($user->isClient() && $case->client_id !== $user->id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
            if ($user->isLawyer() && $case->assigned_lawyer_id !== $user->id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }

        return response()->json($fir);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user->isSuperAdmin() && !$user->isPolice()) {
            return response()->json(['message' => 'Access denied. Only Police or Super Admins can update FIR status.'], 403);
        }
        $fir = Fir::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'incident_date' => 'sometimes|date',
            'location' => 'sometimes|string|max:255',
            'police_station_id' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:pending,investigating,closed,court_referred',
            'linked_case_id' => 'nullable|exists:cases,id'
        ]);

        $fir->update($validated);
        Cache::flush();

        return response()->json([
            'message' => 'FIR updated successfully',
            'fir' => $fir
        ]);
    }

    public function stats(Request $request)
    {
        $start = microtime(true);
        $user = $request->user();
        $cacheKey = "police_stats_" . ($user->isPolice() ? $user->id : 'global');
        
        $stats = Cache::remember($cacheKey, 600, function () use ($user, $start) {
            $query = Fir::query();
            
            $baseStats = $query->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'investigating' THEN 1 ELSE 0 END) as investigating,
                SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
                SUM(CASE WHEN status = 'court_referred' THEN 1 ELSE 0 END) as court_referred
            ")->first();

            $monthlyFirs = Fir::selectRaw("MONTH(created_at) as month, COUNT(*) as count")
                ->whereYear('created_at', now()->year)
                ->groupBy('month')
                ->pluck('count', 'month')
                ->toArray();

            $monthlyData = [];
            for ($i = 1; $i <= 12; $i++) {
                $monthlyData[] = [
                    'month' => date('M', mktime(0, 0, 0, $i, 1)),
                    'count' => $monthlyFirs[$i] ?? 0,
                ];
            }

            $upcomingHearings = \App\Models\Hearing::with(['case'])
                ->where('hearing_date', '>=', now()->toDateString())
                ->where(function ($q) use ($user) {
                    $q->whereHas('participants', function ($pq) use ($user) {
                        $pq->where('user_id', $user->id);
                    })
                    ->orWhereHas('case.fir', function ($fq) use ($user) {
                        $fq->where('filed_by_id', $user->id);
                    });
                })
                ->orderBy('hearing_date', 'asc')
                ->orderBy('hearing_time', 'asc')
                ->take(5)
                ->get();

            $result = [
                'total' => (int)($baseStats->total ?? 0),
                'pending' => (int)($baseStats->pending ?? 0),
                'investigating' => (int)($baseStats->investigating ?? 0),
                'closed' => (int)($baseStats->closed ?? 0),
                'court_referred' => (int)($baseStats->court_referred ?? 0),
                'monthly' => $monthlyData,
                'recent' => Fir::with(['filedBy:id,name'])->latest()->take(5)->get(['id', 'fir_number', 'title', 'status', 'filed_by_id', 'created_at']),
                'upcoming_hearings' => $upcomingHearings
            ];
            
            \Illuminate\Support\Facades\Log::info("Police stats generated for user {$user->id} in " . (microtime(true) - $start) . " seconds.");
            return $result;
        });

        return response()->json($stats);
    }

    public function uploadEvidence(Request $request)
    {
        $validated = $request->validate([
            'fir_id' => 'required|exists:firs,id',
            'title' => 'required|string|max:255',
            'file' => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('fir_evidence', $fileName, 'public');

        $evidence = \App\Models\FirEvidence::create([
            'fir_id' => $validated['fir_id'],
            'title' => $validated['title'],
            'file_path' => '/storage/' . $filePath,
            'file_type' => $file->getClientMimeType(),
            'uploaded_by_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Evidence uploaded successfully',
            'evidence' => $evidence
        ], 201);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        if (!$user->isSuperAdmin() && !$user->isPolice()) {
            return response()->json(['message' => 'Access denied. Only Police or Super Admins can delete FIRs.'], 403);
        }
        
        $fir = Fir::findOrFail($id);
        $fir->delete();
        Cache::flush();

        return response()->json([
            'message' => 'FIR deleted successfully'
        ]);
    }
}
