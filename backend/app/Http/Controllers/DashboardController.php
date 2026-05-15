<?php

namespace App\Http\Controllers;

use App\Models\CaseModel;
use App\Models\Hearing;
use App\Models\User;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index()
    {
        $start = microtime(true);
        $user = Auth::user();
        $cacheKey = "dashboard_stats_{$user->id}_{$user->role}";

        if ($user->isPolice()) {
            return app(FirController::class)->stats(request());
        }

        $stats = Cache::remember($cacheKey, 600, function () use ($user, $start) {
            $data = [
                'cases' => $this->getCaseStats($user),
                'hearings' => $this->getHearingStats($user),
                'users' => $this->getUserStats($user),
                'documents' => $this->getDocumentStats($user),
                'monthly_cases' => $this->getMonthlyCases($user),
                'monthly_hearings' => $this->getMonthlyHearings($user),
                'case_by_status' => $this->getCasesByStatus($user),
                'recent_activity' => $this->getRecentActivity($user),
            ];
            \Illuminate\Support\Facades\Log::info("Dashboard stats generated for user {$user->id} in " . (microtime(true) - $start) . " seconds.");
            return $data;
        });

        return response()->json($stats);
    }

    private function getCaseStats($user)
    {
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
            SUM(CASE WHEN status IN ('pending', 'in_progress') THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_verdict,
            SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as this_month
        ", [now()->startOfMonth()])->first();

        return [
            'total' => (int)($stats->total ?? 0),
            'active' => (int)($stats->active ?? 0),
            'closed' => (int)($stats->closed ?? 0),
            'pending_verdict' => (int)($stats->pending_verdict ?? 0),
            'this_month' => (int)($stats->this_month ?? 0),
        ];
    }

    private function getHearingStats($user)
    {
        $query = Hearing::query();

        if ($user->isJudge()) {
            $query->where('judge_id', $user->id);
        } elseif ($user->isLawyer() || $user->isClient()) {
            $query->whereHas('participants', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $stats = $query->selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN hearing_date = ? THEN 1 ELSE 0 END) as today,
            SUM(CASE WHEN hearing_date > ? AND status = 'scheduled' THEN 1 ELSE 0 END) as upcoming
        ", [now()->toDateString(), now()->toDateString()])->first();

        // Get today's list specifically for the judge
        $todayList = [];
        if ($user->isJudge()) {
            $todayList = Hearing::with('case:id,case_number,title')
                ->where('judge_id', $user->id)
                ->where('hearing_date', now()->toDateString())
                ->orderBy('hearing_time')
                ->get();
        }

        return [
            'total' => (int)($stats->total ?? 0),
            'today' => (int)($stats->today ?? 0),
            'upcoming' => (int)($stats->upcoming ?? 0),
            'today_list' => $todayList
        ];
    }

    private function getUserStats($user)
    {
        if (!$user->hasRole(['super_admin', 'court_admin'])) {
            return null;
        }

        return User::selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN role = 'judge' THEN 1 ELSE 0 END) as judges,
            SUM(CASE WHEN role = 'lawyer' THEN 1 ELSE 0 END) as lawyers,
            SUM(CASE WHEN role = 'client' THEN 1 ELSE 0 END) as clients
        ")->first();
    }

    private function getDocumentStats($user)
    {
        $query = Document::query();

        if ($user->isClient()) {
            $query->whereHas('case', fn($q) => $q->where('client_id', $user->id));
        } elseif ($user->isLawyer()) {
            $query->whereHas('case', fn($q) => $q->where('assigned_lawyer_id', $user->id));
        } elseif ($user->isJudge()) {
            $query->whereHas('case', fn($q) => $q->where('assigned_judge_id', $user->id));
        }

        $stats = $query->selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as new
        ", [now()->subDays(7)])->first();

        return [
            'total' => (int)($stats->total ?? 0),
            'new' => (int)($stats->new ?? 0),
        ];
    }

    private function getMonthlyCases($user)
    {
        $query = CaseModel::query();
        if ($user->isClient()) $query->where('client_id', $user->id);
        elseif ($user->isLawyer()) $query->where('assigned_lawyer_id', $user->id);
        elseif ($user->isJudge()) $query->where('assigned_judge_id', $user->id);

        $data = $query->selectRaw("MONTH(created_at) as month, COUNT(*) as count")
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $result = [];
        for ($i = 1; $i <= 12; $i++) {
            $result[] = ['month' => date('M', mktime(0, 0, 0, $i, 1)), 'count' => $data[$i] ?? 0];
        }
        return $result;
    }

    private function getMonthlyHearings($user)
    {
        $query = Hearing::query();
        if ($user->isJudge()) $query->where('judge_id', $user->id);
        elseif ($user->isLawyer() || $user->isClient()) {
            $query->whereHas('participants', fn($q) => $q->where('user_id', $user->id));
        }

        $data = $query->selectRaw("MONTH(hearing_date) as month, COUNT(*) as count")
            ->whereYear('hearing_date', now()->year)
            ->groupBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $result = [];
        for ($i = 1; $i <= 12; $i++) {
            $result[] = ['month' => date('M', mktime(0, 0, 0, $i, 1)), 'count' => $data[$i] ?? 0];
        }
        return $result;
    }

    private function getCasesByStatus($user)
    {
        $query = CaseModel::query();
        if ($user->isClient()) $query->where('client_id', $user->id);
        elseif ($user->isLawyer()) $query->where('assigned_lawyer_id', $user->id);
        elseif ($user->isJudge()) $query->where('assigned_judge_id', $user->id);

        return $query->selectRaw("status, COUNT(*) as count")
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'status' => ucfirst(str_replace('_', ' ', $item->status)),
                'count' => $item->count
            ]);
    }

    private function getRecentActivity($user)
    {
        $query = CaseModel::query();
        if ($user->isClient()) $query->where('client_id', $user->id);
        elseif ($user->isLawyer()) $query->where('assigned_lawyer_id', $user->id);
        elseif ($user->isJudge()) $query->where('assigned_judge_id', $user->id);

        return $query->latest('updated_at')->take(5)->get(['id', 'case_number', 'title', 'status', 'updated_at']);
    }
}
